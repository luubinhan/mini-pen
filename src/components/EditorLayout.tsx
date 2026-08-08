import { useEffect, useState } from 'react'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { useDebouncedCallback } from '../hooks/useDebouncedCallback'
import { usePenStore } from '../store/penStore'
import { CodeEditor } from './CodeEditor'
import { Preview } from './Preview'

const DEBOUNCE_MS = 150
const separatorClassName =
  'shrink-0 bg-zinc-800 transition-colors active:bg-sky-600 focus-visible:bg-sky-600 focus-visible:outline-none'

export function EditorLayout() {
  const html = usePenStore((state) => state.html)
  const css = usePenStore((state) => state.css)
  const setHtml = usePenStore((state) => state.setHtml)
  const setCss = usePenStore((state) => state.setCss)
  const [localHtml, setLocalHtml] = useState(html)
  const [localCss, setLocalCss] = useState(css)

  useEffect(() => {
    setLocalHtml(html)
  }, [html])

  useEffect(() => {
    setLocalCss(css)
  }, [css])

  const debouncedSetHtml = useDebouncedCallback(setHtml, DEBOUNCE_MS)
  const debouncedSetCss = useDebouncedCallback(setCss, DEBOUNCE_MS)

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
