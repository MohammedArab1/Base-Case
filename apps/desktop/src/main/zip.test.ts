import { existsSync } from 'node:fs'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { extractZip } from './zip'

interface ZipEntrySpec {
  readonly name: string
  readonly data?: Buffer
  readonly mode?: number
}

/**
 * Minimal stored-ZIP writer for tests. Real archives from macOS and Windows
 * use the same structure, and this keeps the test free of extra dependencies.
 */
function createZip(entries: readonly ZipEntrySpec[]): Buffer {
  const localParts: Buffer[] = []
  const centralParts: Buffer[] = []
  let offset = 0

  for (const entry of entries) {
    const name = Buffer.from(entry.name, 'utf8')
    const data = entry.data ?? Buffer.alloc(0)

    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(0x0800, 6)
    local.writeUInt16LE(0, 8)
    local.writeUInt16LE(0, 10)
    local.writeUInt16LE(0, 12)
    local.writeUInt32LE(0, 14)
    local.writeUInt32LE(data.length, 18)
    local.writeUInt32LE(data.length, 22)
    local.writeUInt16LE(name.length, 26)
    local.writeUInt16LE(0, 28)
    localParts.push(local, name, data)

    const central = Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50, 0)
    central.writeUInt16LE(0x0314, 4)
    central.writeUInt16LE(20, 6)
    central.writeUInt16LE(0x0800, 8)
    central.writeUInt16LE(0, 10)
    central.writeUInt16LE(0, 12)
    central.writeUInt16LE(0, 14)
    central.writeUInt32LE(0, 16)
    central.writeUInt32LE(data.length, 20)
    central.writeUInt32LE(data.length, 24)
    central.writeUInt16LE(name.length, 28)
    central.writeUInt16LE(0, 30)
    central.writeUInt16LE(0, 32)
    central.writeUInt16LE(0, 34)
    central.writeUInt16LE(0, 36)
    central.writeUInt32LE(((entry.mode ?? 0o100644) << 16) >>> 0, 38)
    central.writeUInt32LE(offset, 42)
    centralParts.push(central, name)

    offset += local.length + name.length + data.length
  }

  const central = Buffer.concat(centralParts)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(0, 4)
  end.writeUInt16LE(0, 6)
  end.writeUInt16LE(entries.length, 8)
  end.writeUInt16LE(entries.length, 10)
  end.writeUInt32LE(central.length, 12)
  end.writeUInt32LE(offset, 16)
  end.writeUInt16LE(0, 20)

  return Buffer.concat([...localParts, central, end])
}

describe('extractZip', () => {
  let root: string

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'base-case-zip-'))
  })

  afterEach(async () => {
    await rm(root, { recursive: true, force: true })
  })

  it('extracts regular files and directories', async () => {
    const archive = join(root, 'pack.zip')
    await writeFile(
      archive,
      createZip([
        { name: 'pack.json', data: Buffer.from('{"id":"fixture"}') },
        { name: 'problems/echo/statement.md', data: Buffer.from('# Echo') },
        { name: 'problems/', mode: 0o040755 },
      ]),
    )

    const destination = join(root, 'out')
    await extractZip(archive, destination)

    expect(await readFile(join(destination, 'pack.json'), 'utf8')).toBe('{"id":"fixture"}')
    expect(await readFile(join(destination, 'problems/echo/statement.md'), 'utf8')).toBe('# Echo')
    expect(existsSync(join(destination, 'problems'))).toBe(true)
  })

  it('ignores macOS metadata entries', async () => {
    const archive = join(root, 'pack.zip')
    await writeFile(
      archive,
      createZip([
        { name: '__MACOSX/._pack.json', data: Buffer.from('junk') },
        { name: 'pack.json', data: Buffer.from('{}') },
      ]),
    )

    const destination = join(root, 'out')
    await extractZip(archive, destination)

    expect(existsSync(join(destination, '__MACOSX'))).toBe(false)
    expect(existsSync(join(destination, 'pack.json'))).toBe(true)
  })

  it('rejects path traversal without writing outside the destination', async () => {
    const archive = join(root, 'pack.zip')
    await writeFile(archive, createZip([{ name: '../escape.txt', data: Buffer.from('nope') }]))

    await expect(extractZip(archive, join(root, 'out'))).rejects.toThrow(
      /(unsafe|invalid relative) path/,
    )
    expect(existsSync(join(root, 'escape.txt'))).toBe(false)
  })

  it('rejects absolute paths', async () => {
    const archive = join(root, 'pack.zip')
    await writeFile(archive, createZip([{ name: '/tmp/escape.txt', data: Buffer.from('nope') }]))

    await expect(extractZip(archive, join(root, 'out'))).rejects.toThrow(/(unsafe|absolute) path/)
  })

  it('rejects symbolic links', async () => {
    const archive = join(root, 'pack.zip')
    await writeFile(
      archive,
      createZip([{ name: 'link', data: Buffer.from('/etc/passwd'), mode: 0o120777 }]),
    )

    await expect(extractZip(archive, join(root, 'out'))).rejects.toThrow(/symbolic link/)
  })

  it('rejects archives above the configured size limit', async () => {
    const archive = join(root, 'pack.zip')
    await writeFile(archive, createZip([{ name: 'pack.json', data: Buffer.from('{}') }]))

    await expect(
      extractZip(archive, join(root, 'out'), {
        maxArchiveBytes: 1,
        maxEntries: 10,
        maxUncompressedBytes: 1024,
      }),
    ).rejects.toThrow(/too large/)
  })
})
