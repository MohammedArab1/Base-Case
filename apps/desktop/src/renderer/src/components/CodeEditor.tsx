import { useEffect, useRef } from 'react'
import type { JSX } from 'react'
import { basicSetup } from 'codemirror'
import { Compartment, EditorState, StateEffect, StateField } from '@codemirror/state'
import { Decoration, EditorView, keymap } from '@codemirror/view'
import type { DecorationSet } from '@codemirror/view'
import { indentWithTab } from '@codemirror/commands'
import { linter, lintGutter } from '@codemirror/lint'
import {
  javascript,
  javascriptLanguage,
  localCompletionSource,
  scopeCompletionSource,
} from '@codemirror/lang-javascript'
import {
  globalCompletion,
  localCompletionSource as pythonLocalCompletionSource,
  python,
  pythonLanguage,
} from '@codemirror/lang-python'
import { oneDark } from '@codemirror/theme-one-dark'
import type { Language } from '../../../shared/types'
import { useSettings } from '../settings'
import { javascriptMemberCompletions, pythonMemberCompletions } from './editor-completions'
import { syntaxDiagnostics } from './editor-syntax'

function fontSizeTheme(size: number): ReturnType<typeof EditorView.theme> {
  return EditorView.theme({
    '&': {
      fontSize: `${size}px`,
    },
  })
}

const setErrorLine = StateEffect.define<number | null>()

const errorLineField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(decorations, transaction) {
    let next = decorations.map(transaction.changes)

    for (const effect of transaction.effects) {
      if (!effect.is(setErrorLine)) {
        continue
      }

      if (effect.value === null) {
        next = Decoration.none
        continue
      }

      const lineNumber = Math.min(Math.max(1, effect.value), transaction.state.doc.lines)
      const line = transaction.state.doc.line(lineNumber)
      next = Decoration.set([Decoration.line({ class: 'cm-error-line' }).range(line.from)])
    }

    return next
  },
  provide: (field) => EditorView.decorations.from(field),
})

interface CodeEditorProps {
  readonly value: string
  readonly language: Language
  readonly onChange: (value: string) => void
  readonly ariaLabel?: string
  readonly errorLine?: number | null
}

export function CodeEditor({
  value,
  language,
  onChange,
  ariaLabel = 'Code editor',
  errorLine = null,
}: CodeEditorProps): JSX.Element {
  const host = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  const { settings } = useSettings()
  const editorSettings = settings.editor
  const settingsRef = useRef(editorSettings)
  const tabSizeCompartment = useRef(new Compartment()).current
  const fontSizeCompartment = useRef(new Compartment()).current
  const wrapCompartment = useRef(new Compartment()).current

  settingsRef.current = editorSettings

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    if (!host.current) {
      return
    }

    const languageExtensions =
      language === 'python'
        ? [
            python(),
            pythonLanguage.data.of({ autocomplete: pythonMemberCompletions }),
            pythonLanguage.data.of({ autocomplete: pythonLocalCompletionSource }),
            pythonLanguage.data.of({ autocomplete: globalCompletion }),
          ]
        : [
            javascript({ typescript: true }),
            javascriptLanguage.data.of({ autocomplete: javascriptMemberCompletions }),
            javascriptLanguage.data.of({ autocomplete: localCompletionSource }),
            javascriptLanguage.data.of({ autocomplete: scopeCompletionSource(globalThis) }),
          ]

    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          languageExtensions,
          oneDark,
          keymap.of([indentWithTab]),
          linter(syntaxDiagnostics, { delay: 250 }),
          lintGutter(),
          errorLineField,
          tabSizeCompartment.of(EditorState.tabSize.of(settingsRef.current.tabSize)),
          fontSizeCompartment.of(fontSizeTheme(settingsRef.current.fontSize)),
          wrapCompartment.of(settingsRef.current.wordWrap ? EditorView.lineWrapping : []),
          EditorView.contentAttributes.of({ 'aria-label': ariaLabel }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChangeRef.current(update.state.doc.toString())
            }
          }),
          EditorView.theme({
            '&': {
              height: '100%',
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
            '.cm-error-line': {
              backgroundColor: 'color-mix(in srgb, var(--danger) 18%, transparent)',
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

    view.dispatch({
      effects: [
        tabSizeCompartment.reconfigure(EditorState.tabSize.of(editorSettings.tabSize)),
        fontSizeCompartment.reconfigure(fontSizeTheme(editorSettings.fontSize)),
        wrapCompartment.reconfigure(editorSettings.wordWrap ? EditorView.lineWrapping : []),
      ],
    })
  }, [
    editorSettings.fontSize,
    editorSettings.tabSize,
    editorSettings.wordWrap,
    fontSizeCompartment,
    tabSizeCompartment,
    wrapCompartment,
  ])

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

  useEffect(() => {
    const view = viewRef.current

    if (!view) {
      return
    }

    view.dispatch({ effects: setErrorLine.of(errorLine) })
  }, [errorLine])

  return <div className="code-editor" ref={host} />
}
