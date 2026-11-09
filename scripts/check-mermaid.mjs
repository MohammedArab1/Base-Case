import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!doctype html><html><body></body></html>')
globalThis.window = dom.window
globalThis.document = dom.window.document
Object.defineProperty(globalThis, 'navigator', {
  value: dom.window.navigator,
  configurable: true,
})
globalThis.Element = dom.window.Element
globalThis.HTMLElement = dom.window.HTMLElement
globalThis.SVGElement = dom.window.SVGElement
globalThis.Node = dom.window.Node
globalThis.MutationObserver = dom.window.MutationObserver

const { default: mermaid } = await import('mermaid')
const root = join(process.cwd(), 'content', 'packs')

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const path = join(directory, entry.name)

    if (entry.isDirectory()) {
      files.push(...(await markdownFiles(path)))
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(path)
    }
  }

  return files
}

const requestedFiles = process.argv.slice(2)
const files = requestedFiles.length > 0 ? requestedFiles : await markdownFiles(root)

let blockCount = 0
const failures = []

for (const path of files) {
  const source = await readFile(path, 'utf8')
  const pattern = /^```mermaid[ \t]*\r?\n([\s\S]*?)^```[ \t]*$/gm

  for (const match of source.matchAll(pattern)) {
    blockCount += 1
    const chart = match[1]
    const line = source.slice(0, match.index).split(/\r?\n/).length

    try {
      await mermaid.parse(chart)
    } catch (error) {
      failures.push({
        path: relative(process.cwd(), path),
        line,
        message: error instanceof Error ? error.message : String(error),
      })
    }
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`${failure.path}:${failure.line}: ${failure.message}`)
  }
  console.error(`\n${failures.length} invalid Mermaid diagram(s).`)
  process.exitCode = 1
} else {
  console.log(`Validated ${blockCount} Mermaid diagram(s).`)
}
