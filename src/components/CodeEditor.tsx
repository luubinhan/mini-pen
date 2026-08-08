import { css } from '@codemirror/lang-css'
import { html } from '@codemirror/lang-html'
import CodeMirror from '@uiw/react-codemirror'
import { oneDark } from '@codemirror/theme-one-dark'
import { Check, Copy } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

type CodeEditorProps = {
  id?: string
  label: string
  lang: 'html' | 'css'
  value: string
  onChange: (value: string) => void
}

const COPIED_MS = 1500

export function CodeEditor({ id, label, lang, value, onChange }: CodeEditorProps) {
  const extensions = useMemo(() => (lang === 'html' ? [html()] : [css()]), [lang])
  const [copied, setCopied] = useState(false)
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current !== null) {
        clearTimeout(copiedTimeoutRef.current)
      }
    }
  }, [])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      return
    }

    if (copiedTimeoutRef.current !== null) {
      clearTimeout(copiedTimeoutRef.current)
    }
    setCopied(true)
    copiedTimeoutRef.current = setTimeout(() => {
      setCopied(false)
      copiedTimeoutRef.current = null
    }, COPIED_MS)
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-zinc-900">
      <div className="flex shrink-0 items-center justify-between border-b border-white/20 px-3 py-1.5">
        <label htmlFor={id} className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          {label}
        </label>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Copied' : 'Copy code'}
          className="rounded p-0.5 text-zinc-400 hover:text-zinc-200 cursor-pointer"
        >
          {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
        </button>
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
