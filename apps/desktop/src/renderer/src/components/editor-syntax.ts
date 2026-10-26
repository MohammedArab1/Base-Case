import { syntaxTree } from '@codemirror/language'
import type { Diagnostic } from '@codemirror/lint'
import type { EditorView } from '@codemirror/view'

/**
 * Lezer recovers from syntax errors with error nodes. Surface those as lint
 * diagnostics so a malformed line is visibly underlined instead of looking like
 * valid code.
 */
export function syntaxDiagnostics(view: EditorView): Diagnostic[] {
  const diagnostics: Diagnostic[] = []
  const documentLength = view.state.doc.length

  syntaxTree(view.state)
    .cursor()
    .iterate((node) => {
      if (!node.type.isError || diagnostics.length >= 20) {
        return
      }

      const from = Math.min(node.from, Math.max(0, documentLength - 1))
      const to = Math.min(documentLength, Math.max(node.to, from + 1))

      if (from >= to) {
        return
      }

      diagnostics.push({
        from,
        to,
        severity: 'error',
        message: 'Syntax error near this token.',
      })
    })

  return diagnostics
}
