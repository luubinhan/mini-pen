# Code Editor Copy Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Lucide icon button in each CodeEditor header that copies the panel’s full code to the clipboard and briefly shows a check on success.

**Architecture:** Keep the feature inside `CodeEditor`. Header uses `justify-between` with an icon-only button on the right. Click calls `navigator.clipboard.writeText(value)`, sets local `copied` for ~1.5s on success, and cleans up the timeout on unmount or re-click. Icons come from `lucide-react` (`Copy`, `Check`).

**Tech Stack:** React 19, Vitest + Testing Library, `lucide-react`, existing Tailwind zinc dark UI, `@uiw/react-codemirror` (mocked in unit tests).

## Global Constraints

- Placement: panel header row only (not CodeMirror overlay).
- Icons: Lucide via `lucide-react` — `Copy` default, `Check` on success.
- Success feedback: check icon for ~1.5s; clipboard failure leaves copy icon unchanged.
- Scope: `CodeEditor.tsx` + `lucide-react` dependency (+ tests); no store / toast / keyboard shortcut.
- Do not commit unless the user explicitly asks (project git rule overrides plan commit steps — skip Step “Commit” until requested).

---

## File Structure

| File | Responsibility |
|------|----------------|
| `package.json` / `package-lock.json` | Add `lucide-react` |
| `src/components/CodeEditor.tsx` | Header copy button, clipboard + copied state |
| `src/components/CodeEditor.test.tsx` | Unit tests for copy / success / failure / a11y |

---

### Task 1: Install lucide-react and add copy button with tests

**Files:**
- Modify: `package.json`, `package-lock.json`
- Modify: `src/components/CodeEditor.tsx`
- Create: `src/components/CodeEditor.test.tsx`

**Interfaces:**
- Consumes: existing `CodeEditorProps` (`id?`, `label`, `lang`, `value`, `onChange`)
- Produces: unchanged public props; internal `copied` boolean; button `aria-label` `"Copy code"` / `"Copied"`

- [ ] **Step 1: Install dependency**

```bash
npm install lucide-react
```

Expected: `lucide-react` appears in `dependencies` in `package.json`.

- [ ] **Step 2: Write the failing tests**

Create `src/components/CodeEditor.test.tsx`:

```tsx
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CodeEditor } from './CodeEditor'

vi.mock('@uiw/react-codemirror', () => ({
  default: () => <div data-testid="codemirror-stub" />,
}))

describe('CodeEditor copy', () => {
  const writeText = vi.fn()

  beforeEach(() => {
    writeText.mockReset()
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('copies the full editor value when the copy button is clicked', async () => {
    const user = userEvent.setup()
    writeText.mockResolvedValue(undefined)

    render(
      <CodeEditor label="HTML" lang="html" value="<h1>Hi</h1>" onChange={() => {}} />,
    )

    await user.click(screen.getByRole('button', { name: 'Copy code' }))

    expect(writeText).toHaveBeenCalledWith('<h1>Hi</h1>')
  })

  it('shows a Copied label after a successful copy', async () => {
    const user = userEvent.setup()
    writeText.mockResolvedValue(undefined)

    render(
      <CodeEditor label="CSS" lang="css" value="body{}" onChange={() => {}} />,
    )

    await user.click(screen.getByRole('button', { name: 'Copy code' }))

    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument()
  })

  it('reverts to Copy code after 1.5s', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    writeText.mockResolvedValue(undefined)

    render(
      <CodeEditor label="HTML" lang="html" value="x" onChange={() => {}} />,
    )

    await user.click(screen.getByRole('button', { name: 'Copy code' }))
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument()

    await vi.advanceTimersByTimeAsync(1500)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument()
    })
  })

  it('does not show Copied when clipboard write fails', async () => {
    const user = userEvent.setup()
    writeText.mockRejectedValue(new Error('denied'))

    render(
      <CodeEditor label="HTML" lang="html" value="x" onChange={() => {}} />,
    )

    await user.click(screen.getByRole('button', { name: 'Copy code' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
    })
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Copied' })).not.toBeInTheDocument()
  })
})
```

If `@testing-library/user-event` is missing, install it as a devDependency:

```bash
npm install -D @testing-library/user-event
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
npm test -- src/components/CodeEditor.test.tsx
```

Expected: FAIL — missing copy button / `getByRole('button', { name: 'Copy code' })` not found.

- [ ] **Step 4: Implement CodeEditor copy button**

Replace `src/components/CodeEditor.tsx` with:

```tsx
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
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test -- src/components/CodeEditor.test.tsx
```

Expected: PASS (all four tests).

- [ ] **Step 6: Run full suite + lint**

```bash
npm test && npm run lint
```

Expected: all green.

- [ ] **Step 7: Snyk scan on new/modified first-party code**

Run Snyk Code scan on `src/components/CodeEditor.tsx` and `src/components/CodeEditor.test.tsx`. Fix any new issues and rescan until clean.

- [ ] **Step 8: Commit (only if user asked)**

If the user requested a commit:

```bash
git add package.json package-lock.json src/components/CodeEditor.tsx src/components/CodeEditor.test.tsx docs/superpowers/specs/2026-08-08-code-editor-copy-design.md docs/superpowers/plans/2026-08-08-code-editor-copy.md
git commit -m "$(cat <<'EOF'
Add copy-to-clipboard control on code editor panels.

EOF
)"
```

Otherwise skip.

---

## Spec coverage (self-review)

| Spec requirement | Task |
|------------------|------|
| Header right copy button | Task 1 Step 4 |
| `navigator.clipboard.writeText(value)` | Task 1 Step 4 |
| Check icon ~1.5s | Task 1 Steps 2 + 4 |
| Failure keeps copy icon | Task 1 Steps 2 + 4 |
| Lucide `Copy` / `Check` | Task 1 Steps 1 + 4 |
| Zinc styling, icon-only | Task 1 Step 4 |
| Scope limited to CodeEditor + dep | Task 1 |
| Timeout cleanup | Task 1 Step 4 `useEffect` cleanup |

No placeholders remaining. Types/props unchanged for consumers.
