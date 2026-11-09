import { isValidElement } from 'react'
import type { JSX } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import type { Options as SanitizeOptions } from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { MermaidDiagram } from './MermaidDiagram'

/**
 * KaTeX emits presentational spans with inline positioning styles. The default
 * GitHub-style schema drops both, so allow only the CSS properties KaTeX uses.
 */
const katexStyle =
  /^(?:(?:height|width|top|left|right|bottom|position|vertical-align|font-size|line-height|margin(?:-left|-right|-top|-bottom)?|padding(?:-left|-right)?|border-bottom-width):[^;{}]+;?)*$/

const sanitizeSchema: SanitizeOptions = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    span: [
      ...(defaultSchema.attributes?.span ?? []),
      'className',
      'ariaHidden',
      ['style', katexStyle],
    ],
    div: [...(defaultSchema.attributes?.div ?? []), 'className', ['style', katexStyle]],
  },
}

const markdownComponents: Components = {
  code({ className, children }) {
    const language = /language-([\w-]+)/.exec(className ?? '')?.[1]

    if (language === 'mermaid') {
      return <MermaidDiagram chart={String(children).replace(/\n$/, '')} />
    }

    return <code className={className}>{children}</code>
  },
  pre({ children }) {
    if (isValidElement(children) && children.type === MermaidDiagram) {
      return <>{children}</>
    }

    return <pre>{children}</pre>
  },
}

interface MarkdownProps {
  readonly children: string
}

export function Markdown({ children }: MarkdownProps): JSX.Element {
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeSanitize, sanitizeSchema], rehypeKatex]}
        components={markdownComponents}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
