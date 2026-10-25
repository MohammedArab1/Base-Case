import type { DiagnosticsReport } from './types'

const labels = {
  pass: 'PASS',
  warn: 'WARN',
  fail: 'FAIL',
} as const

/**
 * Formats a diagnostics report as plain text for clipboard or issue reports.
 * Paths and versions only; the report never contains API keys or user content.
 */
export function formatDiagnosticsReport(report: DiagnosticsReport): string {
  const lines = [
    `Base Case diagnostics — ${report.generatedAt}`,
    `${report.appVersion} · ${report.platform}/${report.arch} · ${report.ok ? 'OK' : 'ACTION NEEDED'}`,
    '',
    ...report.checks.map((check) => `${labels[check.status]}  ${check.label} — ${check.detail}`),
  ]

  const hints = report.checks.filter((check) => check.hint)

  if (hints.length > 0) {
    lines.push('', 'Next steps:')
    for (const check of hints) {
      lines.push(`- ${check.label}: ${check.hint}`)
    }
  }

  return `${lines.join('\n')}\n`
}
