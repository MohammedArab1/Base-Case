import { useEffect, useRef } from 'react'
import type { JSX } from 'react'
import { basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { oneDark } from '@codemirror/theme-one-dark'
import type { Language } from '../../../shared/types'

interface CodeEditorProps {
  readonly value: string
  readonly language: Language
  readonly onChange: (value: string) => void
  readonly ariaLabel?: string
}

export function CodeEditor({
  value,
  language,
  onChange,
  ariaLabel = 'Code editor',
}: CodeEditorProps): JSX.Element {
  const host = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    if (!host.current) {
      return
    }

    const languageExtension = language === 'python' ? python() : javascript({ typescript: true })

    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          languageExtension,
          oneDark,
          EditorState.tabSize.of(2),
          EditorView.contentAttributes.of({ 'aria-label': ariaLabel }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChangeRef.current(update.state.doc.toString())
            }
          }),
          EditorView.theme({
            '&': {
              height: '100%',
              fontSize: '13px',
            },
            '.cm-scroller': {
              fontFamily:
                "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
              lineHeight: '1.6',
            },
            '.cm-content': {
              padding: '12px 0',
            },
            '.cm-gutters': {
              backgroundColor: 'transparent',
              borderRight: '1px solid var(--border)',
            },
          }),
        ],
      }),
      parent: host.current,
    })

    viewRef.current = view

    return () => {
      viewRef.current = null
      view.destroy()
    }
    // The editor owns its document after mount. Language changes remount it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, ariaLabel])

  useEffect(() => {
    const view = viewRef.current

    if (!view) {
      return
    }

    const current = view.state.doc.toString()

    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      })
    }
  }, [value])

  return <div className="code-editor" ref={host} />
}
