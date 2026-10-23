import { createInterface } from 'node:readline'

const outputs = new Map()
let failed = false

function escapeAnnotation(value) {
  return value.replaceAll('%', '%25').replaceAll('\r', '').replaceAll('\n', '%0A')
}

function keyFor(event) {
  return `${event.Package ?? ''}/${event.Test ?? ''}`
}

const lines = createInterface({ input: process.stdin })

lines.on('line', (line) => {
  let event

  try {
    event = JSON.parse(line)
  } catch {
    process.stdout.write(`${line}\n`)
    return
  }

  if (event.Output) {
    process.stdout.write(event.Output)
    const key = keyFor(event)
    const previous = outputs.get(key) ?? ''
    outputs.set(key, `${previous}${event.Output}`.slice(-8000))
  }

  if (event.Action === 'fail') {
    failed = true
    const output = outputs.get(keyFor(event)) ?? ''

    if (output.trim()) {
      const title = event.Test
        ? `Go test failed: ${event.Package} ${event.Test}`
        : `Go package failed: ${event.Package}`
      process.stdout.write(
        `::error title=${escapeAnnotation(title)}::${escapeAnnotation(output.trim())}\n`,
      )
    }
  }
})

lines.on('close', () => {
  process.exitCode = failed ? 1 : 0
})
