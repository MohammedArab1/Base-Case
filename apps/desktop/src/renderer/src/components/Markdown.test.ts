import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Markdown } from './Markdown'

function render(markdown: string): string {
  return renderToStaticMarkup(createElement(Markdown, null, markdown))
}

describe('Markdown', () => {
  it('renders inline and block math with KaTeX', () => {
    const html = render('Inline $a^2 + b^2 = c^2$.\n\n$$\n\\int_0^1 x \\, dx\n$$')

    expect(html).toContain('class="katex"')
    expect(html).toContain('katex-display')
  })

  it('sanitizes raw HTML from content packs', () => {
    const html = render('<script>alert(1)</script><img src=x onerror=alert(1)>')

    expect(html).not.toContain('<script')
    expect(html).not.toContain('onerror')
  })

  it('renders mermaid fences in a diagram container', () => {
    const html = render('```mermaid\nflowchart LR\n  A[client] --> B[app]\n```')

    expect(html).toContain('data-testid="mermaid-diagram"')
    expect(html).toContain('Rendering diagram')
    expect(html).not.toContain('language-mermaid')
  })

  it('keeps ordinary fenced code as code', () => {
    const html = render('```ts\nconst answer = 42\n```')

    expect(html).toContain('class="language-ts"')
    expect(html).toContain('const answer = 42')
    expect(html).not.toContain('mermaid-diagram')
  })
})
