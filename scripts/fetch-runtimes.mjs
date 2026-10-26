import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  copyFileSync,
  createReadStream,
  createWriteStream,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const manifestPath = join(root, 'runtimes.json')
const runtimeDirectory = join(root, 'build', 'runtime')
const cacheDirectory = join(root, 'build', 'runtime-cache')
const platformArgument = process.argv.indexOf('--platform')
const platformKey =
  platformArgument >= 0 && process.argv[platformArgument + 1]
    ? process.argv[platformArgument + 1]
    : `${process.platform}-${process.arch}`
const verifyOnly = process.argv.includes('--verify')
const force = process.argv.includes('--force')

function loadManifest() {
  return JSON.parse(readFileSync(manifestPath, 'utf8'))
}

function archiveFor(manifest, name) {
  const runtime = manifest.runtimes?.[name]

  if (!runtime) {
    throw new Error(`runtimes.json has no ${name} entry`)
  }

  const archive = runtime.archives?.[platformKey]

  if (!archive) {
    throw new Error(`runtimes.json has no ${name} archive for ${platformKey}`)
  }

  return { runtime, archive }
}

async function sha256(path) {
  const hash = createHash('sha256')

  for await (const chunk of createReadStream(path)) {
    hash.update(chunk)
  }

  return hash.digest('hex')
}

async function download(url, destination) {
  console.log(`Downloading ${url}`)

  const response = await fetch(url)

  if (!response.ok || !response.body) {
    throw new Error(`Download failed (${response.status} ${response.statusText})`)
  }

  const partial = `${destination}.part`
  await pipeline(Readable.fromWeb(response.body), createWriteStream(partial))
  renameSync(partial, destination)
}

function extract(archivePath, destination) {
  // bsdtar on macOS and Windows 10+ extracts both .tar.gz and .zip.
  execFileSync('tar', ['-xf', archivePath, '-C', destination], { stdio: 'inherit' })
}

function removeIfExists(path) {
  rmSync(path, { recursive: true, force: true })
}

function removePythonBytecode(target) {
  const walk = (directory) => {
    for (const entry of readdirSync(directory)) {
      const path = join(directory, entry)

      if (entry === '__pycache__') {
        removeIfExists(path)
        continue
      }

      const info = lstatSync(path)

      if (info.isSymbolicLink()) {
        continue
      }

      if (info.isDirectory()) {
        walk(path)
        continue
      }

      if (entry.endsWith('.pyc') || entry.endsWith('.pyo')) {
        removeIfExists(path)
      }
    }
  }

  walk(target)
}

function keepOnly(target, keepPaths) {
  const keep = new Set(keepPaths.map((path) => join(target, path)))

  const walk = (directory) => {
    for (const entry of readdirSync(directory)) {
      const path = join(directory, entry)
      const needed = keep.has(path) || [...keep].some((kept) => kept.startsWith(`${path}${sep}`))

      if (!needed) {
        removeIfExists(path)
        continue
      }

      if (statSync(path).isDirectory()) {
        walk(path)
      }
    }
  }

  walk(target)
}

function installedPath(name, archive, target) {
  return join(target, archive.binary)
}

function verifyInstalled(name, archive, target) {
  const binary = installedPath(name, archive, target)

  if (!existsSync(binary)) {
    console.error(`${name}: missing ${binary}`)
    return false
  }

  const licenseCandidates = [
    join(target, archive.licensePath),
    join(target, 'LICENSE'),
    join(target, 'LICENSE.txt'),
  ]

  if (!licenseCandidates.some((path) => existsSync(path))) {
    console.error(`${name}: missing license file`)
    return false
  }

  return true
}

async function installRuntime(manifest, name) {
  const { runtime, archive } = archiveFor(manifest, name)
  const target = join(runtimeDirectory, name)

  if (verifyOnly) {
    if (!verifyInstalled(name, archive, target)) {
      throw new Error(`${name} ${runtime.version} is not installed correctly`)
    }
    console.log(`${name} ${runtime.version}: ok`)
    return
  }

  if (!force && verifyInstalled(name, archive, target)) {
    console.log(`${name} ${runtime.version}: already installed`)
    return
  }

  mkdirSync(cacheDirectory, { recursive: true })

  const archiveName = new URL(archive.url).pathname.split('/').pop()
  const cachePath = join(cacheDirectory, archiveName)

  let validCache = false
  if (existsSync(cachePath)) {
    validCache = (await sha256(cachePath)) === archive.sha256
  }

  if (!validCache) {
    removeIfExists(cachePath)
    await download(archive.url, cachePath)

    const digest = await sha256(cachePath)
    if (digest !== archive.sha256) {
      removeIfExists(cachePath)
      throw new Error(`${name}: checksum mismatch (expected ${archive.sha256}, got ${digest})`)
    }
  }

  const staging = join(runtimeDirectory, `.staging-${name}`)
  removeIfExists(staging)
  mkdirSync(staging, { recursive: true })

  try {
    extract(cachePath, staging)

    const extracted = join(staging, archive.root)
    if (!existsSync(extracted)) {
      throw new Error(`${name}: archive did not contain ${archive.root}`)
    }

    removeIfExists(target)
    renameSync(extracted, target)
  } finally {
    removeIfExists(staging)
  }

  for (const path of archive.strip ?? []) {
    removeIfExists(join(target, path))
  }

  if (archive.stripExtensions) {
    const stripByExtension = (directory) => {
      for (const entry of readdirSync(directory)) {
        const path = join(directory, entry)

        if (statSync(path).isDirectory()) {
          stripByExtension(path)
          continue
        }

        if (archive.stripExtensions.some((extension) => entry.endsWith(extension))) {
          removeIfExists(path)
        }
      }
    }

    stripByExtension(target)
  }

  if (archive.keep) {
    keepOnly(target, archive.keep)
  }

  if (name === 'python') {
    removePythonBytecode(target)
  }

  const licenseSource = join(target, archive.licensePath)
  const licenseTarget = join(target, 'LICENSE')

  if (existsSync(licenseSource) && licenseSource !== licenseTarget) {
    copyFileSync(licenseSource, licenseTarget)
  }

  if (!verifyInstalled(name, archive, target)) {
    throw new Error(`${name}: install verification failed`)
  }

  console.log(`Installed ${name} ${runtime.version}`)
}

async function writeInstalledManifest(manifest) {
  const installed = {}

  for (const name of Object.keys(manifest.runtimes)) {
    const { runtime, archive } = archiveFor(manifest, name)
    installed[name] = {
      version: runtime.version,
      binary: archive.binary,
      license: 'LICENSE',
      source: 'bundled',
    }
  }

  writeFileSync(
    join(runtimeDirectory, 'manifest.json'),
    `${JSON.stringify(
      { schemaVersion: 1, platform: platformKey, runtimes: installed },
      null,
      2,
    )}\n`,
  )
}

async function main() {
  const manifest = loadManifest()

  if (verifyOnly) {
    for (const name of Object.keys(manifest.runtimes)) {
      await installRuntime(manifest, name)
    }
    console.log(`Runtimes for ${platformKey} verified.`)
    return
  }

  mkdirSync(runtimeDirectory, { recursive: true })

  for (const name of Object.keys(manifest.runtimes)) {
    await installRuntime(manifest, name)
  }

  await writeInstalledManifest(manifest)
  console.log(`Runtimes for ${platformKey} are ready in build/runtime.`)
}

try {
  await main()
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
