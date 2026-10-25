import { readFileSync } from 'node:fs'

const reportPath = process.argv[2]

if (!reportPath) {
  process.exit(0)
}

let report

try {
  report = JSON.parse(readFileSync(reportPath, 'utf8'))
} catch {
  process.exit(0)
}

const failures = []

function walkSuite(suite, titles) {
  const nextTitles = suite.title ? [...titles, suite.title] : titles

  for (const spec of suite.specs ?? []) {
    const testTitles = [...nextTitles, spec.title]

    for (const test of spec.tests ?? []) {
      const failed = (test.results ?? []).find(
        (result) =>
          result.status === 'failed' ||
          result.status === 'timedOut' ||
          result.status === 'interrupted',
      )

      if (failed) {
        failures.push({
          title: testTitles.join(' › '),
          status: failed.status,
          message: failed.error?.message ?? failed.error?.value ?? 'Unknown failure',
        })
      }
    }
  }

  for (const child of suite.suites ?? []) {
    walkSuite(child, nextTitles)
  }
}

for (const suite of report.suites ?? []) {
  walkSuite(suite, [])
}

for (const error of report.errors ?? []) {
  failures.push({
    title: 'Playwright',
    status: 'error',
    message: error.message ?? String(error),
  })
}

for (const failure of failures) {
  const message = String(failure.message)
    .replaceAll('%', '%25')
    .replaceAll('\r', '')
    .replaceAll('\n', '%0A')
    .replaceAll('::', ': :')
    .slice(0, 6000)

  console.log(`::error title=Playwright ${failure.status}: ${failure.title}::${message}`)
}

if (failures.length > 0) {
  console.log(`Playwright failures: ${failures.length}`)
}
