import { useEffect, useRef, useState } from 'react'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { useDebouncedCallback } from '../hooks/useDebouncedCallback'
import { usePenStore } from '../store/penStore'
import { CodeEditor } from './CodeEditor'
import { Preview } from './Preview'

const DEBOUNCE_MS = 150
const separatorClassName =
  'shrink-0 bg-zinc-900 transition-colors hover:bg-zinc-950 active:bg-yellow-400 focus-visible:bg-yellow-400 focus-visible:outline-none'

export function EditorLayout() {
  const html = usePenStore((state) => state.html)
  const css = usePenStore((state) => state.css)
  const resetRevision = usePenStore((state) => state.resetRevision)
  const setHtml = usePenStore((state) => state.setHtml)
  const setCss = usePenStore((state) => state.setCss)
  const [localHtml, setLocalHtml] = useState(html)
  const [localCss, setLocalCss] = useState(css)
  const htmlResetRevisionRef = useRef(resetRevision)
  const cssResetRevisionRef = useRef(resetRevision)
  const lastHtmlWriteRef = useRef<string | null>(null)
  const lastCssWriteRef = useRef<string | null>(null)
  const debouncedSetHtml = useDebouncedCallback((value: string) => {
    lastHtmlWriteRef.current = value
    setHtml(value)
  }, DEBOUNCE_MS)
  const debouncedSetCss = useDebouncedCallback((value: string) => {
    lastCssWriteRef.current = value
    setCss(value)
  }, DEBOUNCE_MS)

  useEffect(() => {
    if (htmlResetRevisionRef.current !== resetRevision) {
      htmlResetRevisionRef.current = resetRevision
      lastHtmlWriteRef.current = null
      debouncedSetHtml.cancel()
      setLocalHtml(html)
      return
    }

    if (lastHtmlWriteRef.current === html) {
      lastHtmlWriteRef.current = null
      return
    }

    setLocalHtml(html)
  }, [debouncedSetHtml, html, resetRevision])

  useEffect(() => {
    if (cssResetRevisionRef.current !== resetRevision) {
      cssResetRevisionRef.current = resetRevision
      lastCssWriteRef.current = null
      debouncedSetCss.cancel()
      setLocalCss(css)
      return
    }

    if (lastCssWriteRef.current === css) {
      lastCssWriteRef.current = null
      return
    }

    setLocalCss(css)
  }, [css, debouncedSetCss, resetRevision])

  return (
    <Group orientation="horizontal" className="min-h-0 flex-1">
      <Panel defaultSize="40" minSize="20">
        <Group orientation="vertical" className="h-full min-h-0">
          <Panel defaultSize="50" minSize="15">
            <CodeEditor
              id="html-editor"
              label="HTML"
              lang="html"
              value={localHtml}
              onChange={(value) => {
                setLocalHtml(value)
                debouncedSetHtml(value)
              }}
            />
          </Panel>
          <Separator className={`h-1 ${separatorClassName}`} />
          <Panel defaultSize="50" minSize="15">
            <CodeEditor
              id="css-editor"
              label="CSS"
              lang="css"
              value={localCss}
              onChange={(value) => {
                setLocalCss(value)
                debouncedSetCss(value)
              }}
            />
          </Panel>
        </Group>
      </Panel>
      <Separator className={`w-1 ${separatorClassName}`} />
      <Panel defaultSize="60" minSize="25">
        <Preview />
      </Panel>
    </Group>
  )
}
