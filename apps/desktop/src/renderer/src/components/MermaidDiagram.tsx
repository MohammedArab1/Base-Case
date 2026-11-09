import { useEffect, useId, useRef, useState } from 'react'
import type { JSX } from 'react'

interface MermaidDiagramProps {
  readonly chart: string
}

function currentTheme(): 'dark' | 'default' {
  const explicit = document.documentElement.dataset.theme

  if (explicit === 'dark') {
    return 'dark'
  }

  if (explicit === 'light') {
    return 'default'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'default'
}

/**
 * Mermaid is loaded lazily so lessons without diagrams do not pay for its
 * parser. The rendered SVG is produced with Mermaid's strict security level,
 * which rejects scripts and interactive links from content packs.
 */
export function MermaidDiagram({ chart }: MermaidDiagramProps): JSX.Element {
  const reactId = useId()
  const diagramId = `mermaid-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`
  const renderCount = useRef(0)
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [theme, setTheme] = useState<'dark' | 'default'>('default')

  useEffect(() => {
    const update = (): void => setTheme(currentTheme())
    update()

    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    media.addEventListener('change', update)

    return () => {
      observer.disconnect()
      media.removeEventListener('change', update)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    void import('mermaid')
      .then(async ({ default: mermaid }) => {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme,
          fontFamily: 'Assistant, system-ui, sans-serif',
        })

        const rendered = await mermaid.render(`${diagramId}-${++renderCount.current}`, chart)

        if (!cancelled) {
          setSvg(rendered.svg)
          setError(null)
        }
      })
      .catch((renderError: unknown) => {
        if (!cancelled) {
          setSvg(null)
          setError(renderError instanceof Error ? renderError.message : String(renderError))
        }
      })

    return () => {
      cancelled = true
    }
  }, [chart, diagramId, theme])

  if (svg) {
    return (
      <figure className="mermaid-diagram" data-testid="mermaid-diagram">
        <div dangerouslySetInnerHTML={{ __html: svg }} />
      </figure>
    )
  }

  if (!error) {
    return (
      <figure className="mermaid-diagram" data-testid="mermaid-diagram">
        <div className="mermaid-loading" role="status">
          Rendering diagram…
        </div>
      </figure>
    )
  }

  return (
    <figure className="mermaid-diagram mermaid-diagram-error" data-testid="mermaid-diagram">
      <pre>
        <code>{chart}</code>
      </pre>
      <figcaption>Diagram could not be rendered: {error}</figcaption>
    </figure>
  )
}
