import { randomUUID } from 'node:crypto'
import { cp, mkdir, mkdtemp, readdir, rename, rm, stat } from 'node:fs/promises'
import { basename, isAbsolute, join, relative, resolve } from 'node:path'
import { app, dialog } from 'electron'
import { validatePack } from '@base-case/schema'
import type { PackManifest } from '@base-case/schema'
import type {
  ContentPackSummary,
  PackImportKind,
  PackIssue,
  PackPreviewResult,
} from '../shared/types'
import type { ContentRepository } from './content'
import { rebuildContentIndex } from './content-sync'
import { AppError } from './ipc-errors'
import { getLogger } from './logger'
import type { ContentIndexRepository } from './repositories/content-index'
import { defaultZipLimits, extractZip, ZipExtractionError } from './zip'

const pendingLifetimeMs = 15 * 60 * 1000
const maxPendingImports = 8
const ignoredCopyNames = new Set(['.DS_Store', '__MACOSX', '.git', 'node_modules'])

interface PendingPack {
  readonly token: string
  readonly directory: string
  readonly workRoot: string | null
  readonly kind: PackImportKind
  readonly manifest: PackManifest
  readonly createdAt: number
}

interface SelectedPack {
  readonly path: string
  readonly kind: PackImportKind
}

export class PackManager {
  private readonly pending = new Map<string, PendingPack>()

  constructor(
    private readonly userDataPath: string,
    private readonly content: ContentRepository,
    private readonly contentIndex: ContentIndexRepository,
  ) {}

  async preview(kind: PackImportKind): Promise<PackPreviewResult | null> {
    await this.prunePending()

    const selected = await this.selectPack(kind)

    if (!selected) {
      return null
    }

    const log = getLogger('packs')
    let workRoot: string | null = null

    try {
      if (selected.kind === 'archive') {
        workRoot = await mkdtemp(join(this.userDataPath, 'pack-import-'))

        if (!(await isFile(selected.path))) {
          throw new AppError('invalid_request', 'The selected archive is not a readable file.')
        }

        await extractZip(selected.path, join(workRoot, 'pack'))
      } else {
        await assertDirectoryWithinLimits(selected.path, defaultZipLimits)
      }

      const packRoot = await resolvePackRoot(
        selected.kind === 'archive' ? join(workRoot!, 'pack') : selected.path,
      )

      if (!packRoot) {
        throw new AppError(
          'invalid_request',
          'No pack.json was found. Choose the pack folder itself, or a folder that contains a packs/ directory.',
        )
      }

      const validation = await validatePack(packRoot)

      if (!validation.ok || !validation.pack) {
        return {
          ok: false,
          issues: validation.issues.map((issue) => ({
            path: issue.path,
            message: issue.message,
          })),
          warnings: validation.warnings,
        }
      }

      const manifest = validation.pack
      const installed = this.installedPack(manifest.id)

      if (installed) {
        return {
          ok: false,
          issues: [
            {
              path: 'pack.json',
              message:
                installed.source === 'bundled'
                  ? `The id "${manifest.id}" belongs to a bundled pack and cannot be replaced.`
                  : `A pack with the id "${manifest.id}" is already installed. Remove it before importing a new copy.`,
            },
          ],
          warnings: validation.warnings,
        }
      }

      const token = randomUUID()
      this.pending.set(token, {
        token,
        directory: packRoot,
        workRoot,
        kind: selected.kind,
        manifest,
        createdAt: Date.now(),
      })

      // The pending entry now owns the extracted directory.
      workRoot = null

      log.info('pack.previewed', {
        pack: manifest.id,
        version: manifest.version,
        source: selected.kind,
        warnings: validation.warnings.length,
      })

      const preview: ContentPackSummary & {
        readonly token: string
        readonly warnings: readonly string[]
      } = {
        ...this.summary(manifest, packRoot, 'user'),
        token,
        warnings: validation.warnings,
      }

      return { ok: true, preview, warnings: validation.warnings }
    } catch (error) {
      const issues = toImportIssues(error)
      log.warn('pack.preview.failed', {
        path: selected.path,
        message: issues[0]?.message ?? 'unknown',
      })

      return { ok: false, issues, warnings: [] }
    } finally {
      if (workRoot) {
        await rm(workRoot, { recursive: true, force: true }).catch(() => undefined)
      }
    }
  }

  async install(token: string): Promise<ContentPackSummary> {
    const log = getLogger('packs')
    const pending = this.pending.get(token)

    if (!pending) {
      throw new AppError('not_found', 'That import has expired. Choose the pack again.')
    }

    this.pending.delete(token)

    try {
      if (this.installedPack(pending.manifest.id)) {
        throw new AppError('invalid_request', 'That pack is already installed.')
      }

      const packsRoot = join(this.userDataPath, 'packs')
      const target = join(packsRoot, pending.manifest.id)

      if (await pathExists(target)) {
        throw new AppError(
          'invalid_request',
          `A folder already exists at ${target}. Remove it or choose a different pack.`,
        )
      }

      await mkdir(packsRoot, { recursive: true })

      const stagingRoot = await mkdtemp(join(this.userDataPath, 'pack-install-'))
      const staging = join(stagingRoot, 'pack')

      try {
        if (pending.kind === 'archive') {
          await rename(pending.directory, staging)
        } else {
          await copyPackDirectory(pending.directory, staging)
        }

        await rename(staging, target)
      } finally {
        await rm(stagingRoot, { recursive: true, force: true }).catch(() => undefined)
      }

      try {
        await rebuildContentIndex(this.content, this.contentIndex, this.userDataPath)
      } catch (error) {
        await rm(target, { recursive: true, force: true }).catch(() => undefined)

        try {
          await rebuildContentIndex(this.content, this.contentIndex, this.userDataPath)
        } catch (rollbackError) {
          log.error('pack.rollback.failed', {
            pack: pending.manifest.id,
            message: errorMessage(rollbackError),
          })
        }

        throw new AppError(
          'internal_error',
          `The pack was copied but could not be loaded: ${errorMessage(error)}`,
        )
      }

      const summary = this.installedPack(pending.manifest.id)

      if (!summary) {
        throw new AppError(
          'internal_error',
          'The pack was copied but did not appear in the catalog.',
        )
      }

      log.info('pack.installed', {
        pack: summary.id,
        version: summary.version,
        problems: summary.problemCount,
      })

      return summary
    } finally {
      if (pending.workRoot) {
        await rm(pending.workRoot, { recursive: true, force: true }).catch(() => undefined)
      }
    }
  }

  async uninstall(packId: string): Promise<void> {
    const log = getLogger('packs')
    const pack = this.installedPack(packId)

    if (!pack) {
      throw new AppError('not_found', `Unknown content pack: ${packId}`)
    }

    if (pack.source === 'bundled') {
      throw new AppError(
        'invalid_request',
        'Bundled packs are part of the app and cannot be removed.',
      )
    }

    const packsRoot = resolve(join(this.userDataPath, 'packs'))
    const target = resolve(pack.path)
    const targetRelative = relative(packsRoot, target)

    if (
      targetRelative.length === 0 ||
      targetRelative.startsWith('..') ||
      isAbsolute(targetRelative)
    ) {
      throw new AppError('invalid_request', 'That pack is not stored in the user pack directory.')
    }

    await rm(target, { recursive: true, force: true })
    await rebuildContentIndex(this.content, this.contentIndex, this.userDataPath)

    log.info('pack.uninstalled', { pack: packId })
  }

  async cleanupStaleImports(): Promise<void> {
    const log = getLogger('packs')
    const entries = await readdir(this.userDataPath, { withFileTypes: true }).catch(() => [])
    const cutoff = Date.now() - 60 * 60 * 1000

    await Promise.all(
      entries
        .filter(
          (entry) =>
            entry.isDirectory() &&
            (entry.name.startsWith('pack-import-') || entry.name.startsWith('pack-install-')),
        )
        .map(async (entry) => {
          const path = join(this.userDataPath, entry.name)

          try {
            const info = await stat(path)

            if (info.mtimeMs > cutoff) {
              return
            }

            await rm(path, { recursive: true, force: true })
            log.info('pack.import.cleaned', { path })
          } catch {
            // A missing or locked directory is not worth failing startup for.
          }
        }),
    )
  }

  private installedPack(packId: string): ContentPackSummary | undefined {
    return this.content.listPacks().find((pack) => pack.id === packId)
  }

  private async selectPack(kind: PackImportKind): Promise<SelectedPack | null> {
    const testPath = !app.isPackaged ? process.env.BASE_CASE_TEST_PACK_PATH : undefined

    if (testPath) {
      const info = await stat(testPath)

      return { path: testPath, kind: info.isDirectory() ? 'folder' : 'archive' }
    }

    const selection =
      kind === 'archive'
        ? await dialog.showOpenDialog({
            title: 'Import a content pack',
            buttonLabel: 'Inspect pack',
            properties: ['openFile'],
            filters: [{ name: 'Content pack archive', extensions: ['zip'] }],
          })
        : await dialog.showOpenDialog({
            title: 'Import a content pack folder',
            buttonLabel: 'Inspect pack',
            properties: ['openDirectory'],
          })

    const path = selection.filePaths[0]

    if (selection.canceled || !path) {
      return null
    }

    return { path, kind }
  }

  private async prunePending(): Promise<void> {
    const now = Date.now()
    const entries = [...this.pending.values()].sort((a, b) => a.createdAt - b.createdAt)

    for (const entry of entries) {
      if (now - entry.createdAt > pendingLifetimeMs || this.pending.size >= maxPendingImports) {
        this.pending.delete(entry.token)

        // Only temporary archive directories are ours to delete. A pending
        // folder import still points at the user's chosen folder.
        if (entry.workRoot) {
          await rm(entry.workRoot, { recursive: true, force: true }).catch(() => undefined)
        }
      }
    }
  }

  private summary(
    manifest: PackManifest,
    directory: string,
    source: ContentPackSummary['source'],
  ): ContentPackSummary {
    return {
      id: manifest.id,
      name: manifest.name,
      version: manifest.version,
      license: manifest.license,
      attribution: manifest.attribution,
      source,
      problemCount: manifest.problems.length,
      designCount: manifest.designs.length,
      path: directory,
    }
  }
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

async function isFile(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isFile()
  } catch {
    return false
  }
}

async function childDirectories(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true }).catch(() => [])

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(directory, entry.name))
    .sort()
}

async function resolvePackRoot(directory: string, depth = 0): Promise<string | null> {
  if (await pathExists(join(directory, 'pack.json'))) {
    return directory
  }

  const packedChildren = (
    await Promise.all(
      (await childDirectories(join(directory, 'packs'))).map(async (child) =>
        (await pathExists(join(child, 'pack.json'))) ? child : null,
      ),
    )
  ).filter((child): child is string => child !== null)

  if (packedChildren.length > 0) {
    return packedChildren[0]!
  }

  const children = await childDirectories(directory)

  if (children.length === 1 && depth < 3) {
    return resolvePackRoot(children[0]!, depth + 1)
  }

  return null
}

async function assertDirectoryWithinLimits(
  root: string,
  limits: { readonly maxEntries: number; readonly maxUncompressedBytes: number },
): Promise<void> {
  const stack = [resolve(root)]
  let files = 0
  let bytes = 0

  while (stack.length > 0) {
    const directory = stack.pop()!
    const entries = await readdir(directory, { withFileTypes: true })

    for (const entry of entries) {
      if (ignoredCopyNames.has(entry.name)) {
        continue
      }

      const path = join(directory, entry.name)

      if (entry.isSymbolicLink()) {
        throw new AppError(
          'invalid_request',
          `Content packs cannot contain symbolic links: ${path}`,
        )
      }

      if (entry.isDirectory()) {
        stack.push(path)
        continue
      }

      if (!entry.isFile()) {
        continue
      }

      files += 1
      bytes += (await stat(path)).size

      if (files > limits.maxEntries || bytes > limits.maxUncompressedBytes) {
        throw new AppError(
          'invalid_request',
          'The selected folder is too large to be a content pack.',
        )
      }
    }
  }
}

async function copyPackDirectory(source: string, destination: string): Promise<void> {
  await cp(source, destination, {
    recursive: true,
    force: false,
    errorOnExist: true,
    filter: (path) => !ignoredCopyNames.has(basename(path)),
  })
}

function toImportIssues(error: unknown): PackIssue[] {
  if (error instanceof ZipExtractionError) {
    return [{ path: 'archive', message: error.message }]
  }

  if (error instanceof AppError) {
    return [{ path: 'pack.json', message: error.message }]
  }

  return [{ path: 'pack.json', message: errorMessage(error) }]
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
