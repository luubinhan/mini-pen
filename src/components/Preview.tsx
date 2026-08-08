import { buildPreviewDocument } from '../lib/buildPreviewDocument'
import { usePenStore } from '../store/penStore'

export function Preview() {
  const html = usePenStore((s) => s.html)
  const css = usePenStore((s) => s.css)
  const srcDoc = buildPreviewDocument(html, css)

  return (
    <div className="flex h-full min-h-0 flex-col bg-zinc-900">
      <div className="flex shrink-0 items-center border-b border-zinc-800 px-3 py-1.5">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          Preview
        </span>
      </div>
      <iframe
        title="preview"
        sandbox="allow-same-origin"
        srcDoc={srcDoc}
        className="min-h-0 w-full flex-1 border-0 bg-white"
      />
    </div>
  )
}
