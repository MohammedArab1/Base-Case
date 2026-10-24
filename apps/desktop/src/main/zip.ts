import { createWriteStream } from 'node:fs'
import { mkdir, stat } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { resolveWithinRoot } from '@base-case/schema'
import { openPromise } from 'yauzl'
import type { Entry } from 'yauzl'

export interface ZipLimits {
  readonly maxArchiveBytes: number
  readonly maxEntries: number
  readonly maxUncompressedBytes: number
}

export const defaultZipLimits: ZipLimits = {
  maxArchiveBytes: 100 * 1024 * 1024,
  maxEntries: 10_000,
  maxUncompressedBytes: 200 * 1024 * 1024,
}

export class ZipExtractionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ZipExtractionError'
  }
}

const symlinkType = 0o120000
const fileTypeMask = 0o170000

function normalizeEntryName(fileName: string): string | null {
  if (fileName.includes('\0')) {
    return null
  }

  const normalized = fileName.replaceAll('\\', '/')

  if (normalized.startsWith('/') || /^[a-zA-Z]:/.test(normalized)) {
    return null
  }

  return normalized
}

function isIgnored(name: string): boolean {
  return (
    name === '__MACOSX' ||
    name.startsWith('__MACOSX/') ||
    name === '.DS_Store' ||
    name.endsWith('/.DS_Store') ||
    name === 'Thumbs.db' ||
    name.endsWith('/Thumbs.db')
  )
}

function isSymbolicLink(entry: Entry): boolean {
  const mode = (entry.externalFileAttributes >>> 16) & 0xffff
  return (mode & fileTypeMask) === symlinkType
}

/**
 * Extract a ZIP archive into a fresh directory while refusing path traversal,
 * absolute paths, symlinks, encrypted entries, and oversized archives. Content
 * packs are plain data, so only regular files and directories are accepted.
 */
export async function extractZip(
  archivePath: string,
  destination: string,
  limits: ZipLimits = defaultZipLimits,
): Promise<void> {
  const archiveInfo = await stat(archivePath)

  if (!archiveInfo.isFile()) {
    throw new ZipExtractionError('The selected archive is not a file.')
  }

  if (archiveInfo.size > limits.maxArchiveBytes) {
    throw new ZipExtractionError('The selected archive is too large.')
  }

  const root = resolve(destination)
  await mkdir(root, { recursive: true })

  let zipfile: Awaited<ReturnType<typeof openPromise>>

  try {
    zipfile = await openPromise(archivePath, {
      autoClose: true,
      lazyEntries: true,
      validateEntrySizes: true,
    })
  } catch (error) {
    throw new ZipExtractionError(
      `The selected file is not a readable ZIP archive: ${errorMessage(error)}`,
    )
  }

  let entries = 0
  let totalBytes = 0
  const written = new Set<string>()

  try {
    for await (const entry of zipfile.eachEntry()) {
      const name = normalizeEntryName(entry.fileName)

      if (name === null) {
        throw new ZipExtractionError(`The archive contains an unsafe path: ${entry.fileName}`)
      }

      if (isIgnored(name) || name.length === 0) {
        continue
      }

      if (entry.isEncrypted()) {
        throw new ZipExtractionError('Encrypted archives are not supported.')
      }

      if (isSymbolicLink(entry)) {
        throw new ZipExtractionError(`The archive contains a symbolic link: ${entry.fileName}`)
      }

      entries += 1

      if (entries > limits.maxEntries) {
        throw new ZipExtractionError('The archive contains too many entries.')
      }

      const target = resolveWithinRoot(root, name)

      if (!target) {
        throw new ZipExtractionError(`The archive contains an unsafe path: ${entry.fileName}`)
      }

      if (name.endsWith('/')) {
        await mkdir(target, { recursive: true })
        continue
      }

      totalBytes += entry.uncompressedSize

      if (totalBytes > limits.maxUncompressedBytes) {
        throw new ZipExtractionError('The archive expands beyond the allowed size.')
      }

      if (written.has(target)) {
        throw new ZipExtractionError(`The archive contains a duplicate file: ${entry.fileName}`)
      }

      written.add(target)
      await mkdir(dirname(target), { recursive: true })

      const stream = await zipfile.openReadStreamPromise(entry)
      await pipeline(stream, createWriteStream(target, { flags: 'wx', mode: 0o644 }))
    }
  } catch (error) {
    throw new ZipExtractionError(
      error instanceof ZipExtractionError
        ? error.message
        : `The archive could not be extracted: ${errorMessage(error)}`,
    )
  } finally {
    zipfile.close()
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
