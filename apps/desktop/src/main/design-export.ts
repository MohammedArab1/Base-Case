import { designNoteSections } from '../shared/types'
import type { DesignAttemptDetail, DesignScenarioDetail } from '../shared/types'

function escapeCell(value: string): string {
  return value.replaceAll('|', '\\|').replace(/\r?\n/g, ' ').trim()
}

/** Renders a portable Markdown summary of a submitted design attempt. */
export function renderDesignAttemptMarkdown(
  scenario: DesignScenarioDetail,
  attempt: DesignAttemptDetail,
): string {
  const lines: string[] = [
    `# ${scenario.title} — design attempt`,
    '',
    `- Date: ${new Date(attempt.createdAt).toLocaleString()}`,
    `- Difficulty: ${scenario.difficulty}`,
    `- Tags: ${scenario.tags.join(', ') || '—'}`,
    `- Self-assessment: ${attempt.averageScore ?? '—'} / 4`,
    '',
    '## Prompt',
    '',
    scenario.prompt.trim(),
    '',
    '## Notes',
  ]

  for (const section of designNoteSections) {
    lines.push(
      '',
      `### ${section.label}`,
      '',
      attempt.notes[section.id].trim() || '_Not filled in._',
    )
  }

  lines.push(
    '',
    '## Self-assessment',
    '',
    '| Dimension | Score | Evidence |',
    '| --- | --- | --- |',
  )

  for (const dimension of scenario.rubric) {
    const answer = attempt.rubric[dimension.id]
    lines.push(
      `| ${escapeCell(dimension.name)} | ${answer?.score ?? '—'} | ${escapeCell(answer?.evidence ?? '')} |`,
    )
  }

  lines.push('', '## Reference', '', scenario.reference.markdown.trim(), '')

  return lines.join('\n')
}
