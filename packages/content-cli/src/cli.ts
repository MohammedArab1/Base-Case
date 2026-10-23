import { validatePack, type PackValidationResult } from '@base-case/schema'

const usage = `Base Case content CLI

Usage:
  content validate <pack-directory> [--json]
  content version
  content help

Examples:
  content validate content/packs/core
  content validate content/packs/core --json
`

function formatHumanResult(packDirectory: string, result: PackValidationResult): string {
  const lines: string[] = []

  if (result.pack) {
    lines.push(
      `Pack: ${result.pack.name} (${result.pack.id}) v${result.pack.version}`,
      `Problems: ${result.pack.problems.length}`,
      `Designs: ${result.pack.designs.length}`,
    )
  }

  if (result.warnings.length > 0) {
    lines.push('', 'Warnings:')
    for (const warning of result.warnings) {
      lines.push(`  - ${warning}`)
    }
  }

  if (result.issues.length > 0) {
    lines.push('', `Invalid pack: ${result.issues.length} issue(s)`)
    for (const issue of result.issues) {
      lines.push(`  [${issue.code}] ${issue.path}: ${issue.message}`)
    }
  } else {
    lines.push('', `Valid: ${packDirectory}`)
  }

  return lines.join('\n')
}

async function validateCommand(args: readonly string[]): Promise<number> {
  const packDirectory = args.find((argument) => !argument.startsWith('-'))
  const json = args.includes('--json')

  if (!packDirectory) {
    process.stderr.write('Missing pack directory.\n\n')
    process.stderr.write(usage)
    return 2
  }

  const result = await validatePack(packDirectory)

  if (json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
  } else {
    process.stdout.write(`${formatHumanResult(packDirectory, result)}\n`)
  }

  return result.ok ? 0 : 1
}

async function main(args: readonly string[]): Promise<number> {
  const [command, ...rest] = args

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    process.stdout.write(usage)
    return command ? 0 : 2
  }

  if (command === 'version' || command === '--version' || command === '-v') {
    process.stdout.write('0.0.0\n')
    return 0
  }

  if (command === 'validate') {
    return validateCommand(rest)
  }

  process.stderr.write(`Unknown command: ${command}\n\n`)
  process.stderr.write(usage)
  return 2
}

try {
  process.exitCode = await main(process.argv.slice(2))
} catch (error) {
  process.stderr.write(
    `${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`,
  )
  process.exitCode = 1
}
