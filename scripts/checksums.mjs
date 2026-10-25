#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { readdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const extensions = ['.dmg', '.zip', '.exe']
const directory = resolve(process.argv[2] ?? 'apps/desktop/dist')

async function hashFile(path) {
  const hash = createHash('sha256')

  await new Promise((resolvePromise, reject) => {
    const stream = createReadStream(path)
    stream.on('data', (chunk) => hash.update(chunk))
    stream.on('error', reject)
    stream.on('end', resolvePromise)
  })

  return hash.digest('hex')
}

const entries = await readdir(directory, { withFileTypes: true })
const files = entries
  .filter(
    (entry) => entry.isFile() && extensions.some((extension) => entry.name.endsWith(extension)),
  )
  .map((entry) => entry.name)
  .sort()

if (files.length === 0) {
  console.error(`No installers found in ${directory}.`)
  process.exit(1)
}

const lines = []

for (const file of files) {
  const digest = await hashFile(join(directory, file))
  lines.push(`${digest}  ${file}`)
  console.log(`${digest}  ${file}`)
}

const outputPath = join(directory, 'SHA256SUMS.txt')
await writeFile(outputPath, `${lines.join('\n')}\n`, 'utf8')
console.log(`Wrote ${outputPath}`)
