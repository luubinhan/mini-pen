import { usePenStore } from '../store/penStore'

export function Header() {
  const reset = usePenStore((s) => s.reset)

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4">
      <span className="text-sm font-semibold tracking-tight text-zinc-100">mini-pen</span>
      <button
        type="button"
        onClick={reset}
        className="rounded border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
      >
        Reset
      </button>
    </header>
  )
}
