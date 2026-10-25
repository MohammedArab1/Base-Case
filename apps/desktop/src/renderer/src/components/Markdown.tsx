import type { JSX } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import type { Options as SanitizeOptions } from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

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

interface MarkdownProps {
  readonly children: string
}

export function Markdown({ children }: MarkdownProps): JSX.Element {
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeSanitize, sanitizeSchema], rehypeKatex]}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
