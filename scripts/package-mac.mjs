import { execFileSync } from 'node:child_process'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const desktop = 'apps/desktop'

function run(command, args, env = process.env) {
  console.log(`$ ${command} ${args.join(' ')}`)
  execFileSync(command, args, { cwd: root, stdio: 'inherit', env })
}

if (process.platform !== 'darwin') {
  console.error('macOS packaging must run on macOS.')
  process.exit(1)
}

run('pnpm', ['--filter', '@base-case/desktop', 'build'])

for (const arch of ['x64', 'arm64']) {
  const goarch = arch === 'x64' ? 'amd64' : arch

  // Each architecture gets matching runtimes and a judge compiled for that target.
  run('node', ['scripts/fetch-runtimes.mjs', '--platform', `darwin-${arch}`, '--force'])
  run('node', ['scripts/build-judge.mjs'], { ...process.env, GOOS: 'darwin', GOARCH: goarch })
  run('pnpm', ['--filter', '@base-case/desktop', 'exec', 'electron-builder', '--mac', `--${arch}`])
}

// Leave the working tree usable for local smoke tests on this machine.
const hostPlatform = `${process.platform}-${process.arch}`
run('node', ['scripts/fetch-runtimes.mjs', '--platform', hostPlatform, '--force'])
run('node', ['scripts/build-judge.mjs'])

console.log('macOS arm64 and x64 installers are ready in apps/desktop/dist.')
