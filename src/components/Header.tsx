import { FilePlus } from 'lucide-react'
import { usePenStore } from '../store/penStore'
import Favicon from '../assets/favicon.svg?react'

const CLEAR_CONFIRM = 'Clear all HTML and CSS? This cannot be undone.'

const actionButtonClassName =
  'inline-flex items-center gap-1.5 rounded border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-200 hover:bg-zinc-800 cursor-pointer'

export function Header() {
  const clear = usePenStore((s) => s.clear)

  function handleNew() {
    if (window.confirm(CLEAR_CONFIRM)) {
      clear()
    }
  }

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4">
      <span className="flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-100">
        <Favicon className="size-4" aria-hidden />
        Mini Pen
      </span>
      <div className="flex items-center gap-2">
        <button type="button" onClick={handleNew} className={actionButtonClassName}>
          <FilePlus className="size-3.5" aria-hidden />
          New
        </button>
      </div>
    </header>
  )
}
