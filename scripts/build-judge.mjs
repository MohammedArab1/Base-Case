import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const extension = process.platform === 'win32' ? '.exe' : ''
const output = join('build', `judge${extension}`)

mkdirSync(join(root, 'build'), { recursive: true })

execFileSync(
  'go',
  ['build', '-C', 'services/judge', '-o', `../../${output.replaceAll('\\', '/')}`, './cmd/judge'],
  { cwd: root, stdio: 'inherit' },
)

console.log(`Built ${output}`)
