import { css } from '@codemirror/lang-css'
import { html } from '@codemirror/lang-html'
import CodeMirror from '@uiw/react-codemirror'
import { oneDark } from '@codemirror/theme-one-dark'
import { useMemo } from 'react'

type CodeEditorProps = {
  id?: string
  label: string
  lang: 'html' | 'css'
  value: string
  onChange: (value: string) => void
}

export function CodeEditor({ id, label, lang, value, onChange }: CodeEditorProps) {
  const extensions = useMemo(() => (lang === 'html' ? [html()] : [css()]), [lang])

  return (
    <div className="flex h-full min-h-0 flex-col bg-zinc-900">
      <div className="flex shrink-0 items-center border-b border-white/20 px-3 py-1.5">
        <label htmlFor={id} className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          {label}
        </label>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        <CodeMirror
          id={id}
          value={value}
          height="100%"
          theme={oneDark}
          extensions={extensions}
          onChange={onChange}
          className="h-full text-sm [&_.cm-editor]:h-full [&_.cm-scroller]:h-full scrollbar-thumb-zinc-700 scrollbar-track-[#282c34]"
          basicSetup={{
            foldGutter: false,
            lineNumbers: true,
            highlightActiveLine: true,
          }}
        />
      </div>
    </div>
  )
}
