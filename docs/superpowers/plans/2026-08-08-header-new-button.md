# Header New Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Header **New** button that confirms with `window.confirm`, then clears HTML and CSS to empty strings via a store `clear()` action.

**Architecture:** Extend `penStore` with `clear()` that sets `html`/`css` to `''` and bumps `resetRevision` (same sync path as `reset`). Header renders **New** left of **Reset**; click runs confirm then `clear()`.

**Tech Stack:** React 19, Zustand persist, Vitest + Testing Library, existing zinc Header button styles.

## Global Constraints

- Confirm: `window.confirm('Clear all HTML and CSS? This cannot be undone.')`
- New clears to empty strings; Reset still restores defaults (unchanged).
- Must bump `resetRevision` so `EditorLayout` local editors sync.
- Scope: `penStore` + `Header` (+ tests). No custom modal.
- Do not commit unless the user explicitly asks (skip Commit steps until requested).

---

## File Structure

| File | Responsibility |
|------|----------------|
| `src/store/penStore.ts` | Add `clear()` action |
| `src/store/penStore.test.ts` | Cover `clear` + `resetRevision` |
| `src/components/Header.tsx` | New button + confirm wiring |
| `src/components/Header.test.tsx` | Confirm OK / Cancel / button order |

---

### Task 1: Store `clear()` action

**Files:**
- Modify: `src/store/penStore.ts`
- Modify: `src/store/penStore.test.ts`

**Interfaces:**
- Consumes: existing `PenState` / `resetRevision` pattern
- Produces: `clear: () => void` on `PenState`

- [ ] **Step 1: Write the failing store test**

Append to `src/store/penStore.test.ts` (keep existing tests; extend `beforeEach` to also reset `resetRevision` if needed):

```ts
  it('clear empties html and css and bumps resetRevision', () => {
    usePenStore.setState({ html: '<p>x</p>', css: 'a{}', resetRevision: 2 })
    usePenStore.getState().clear()
    expect(usePenStore.getState().html).toBe('')
    expect(usePenStore.getState().css).toBe('')
    expect(usePenStore.getState().resetRevision).toBe(3)
  })
```

Also update the existing `beforeEach` to include `resetRevision: 0` for stability:

```ts
  beforeEach(() => {
    localStorage.clear()
    usePenStore.setState({ html: DEFAULT_HTML, css: DEFAULT_CSS, resetRevision: 0 })
  })
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- src/store/penStore.test.ts
```

Expected: FAIL — `clear` is not a function / undefined.

- [ ] **Step 3: Implement `clear` in the store**

In `src/store/penStore.ts`, add `clear` to the type and implementation:

```ts
export type PenState = {
  html: string
  css: string
  resetRevision: number
  setHtml: (html: string) => void
  setCss: (css: string) => void
  reset: () => void
  clear: () => void
}

// inside create:
      clear: () =>
        set((state) => ({
          html: '',
          css: '',
          resetRevision: state.resetRevision + 1,
        })),
```

- [ ] **Step 4: Run store tests to verify they pass**

```bash
npm test -- src/store/penStore.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit (only if user asked)** — otherwise skip.

---

### Task 2: Header New button with confirm

**Files:**
- Create: `src/components/Header.test.tsx`
- Modify: `src/components/Header.tsx`

**Interfaces:**
- Consumes: `usePenStore` → `clear`, `reset`
- Produces: New button labeled `New`; confirm message exact string below

- [ ] **Step 1: Write the failing Header tests**

Create `src/components/Header.test.tsx`:

```tsx
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_CSS, DEFAULT_HTML } from '../lib/defaults'
import { usePenStore } from '../store/penStore'
import { Header } from './Header'

describe('Header New', () => {
  beforeEach(() => {
    localStorage.clear()
    usePenStore.setState({
      html: '<p>draft</p>',
      css: 'body{}',
      resetRevision: 0,
    })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders New to the left of Reset', () => {
    render(<Header />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.map((b) => b.textContent)).toEqual(['New', 'Reset'])
  })

  it('clears editors when New is confirmed', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<Header />)
    await user.click(screen.getByRole('button', { name: 'New' }))

    expect(window.confirm).toHaveBeenCalledWith(
      'Clear all HTML and CSS? This cannot be undone.',
    )
    expect(usePenStore.getState().html).toBe('')
    expect(usePenStore.getState().css).toBe('')
    expect(usePenStore.getState().resetRevision).toBe(1)
  })

  it('does not clear when New is cancelled', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(false)

    render(<Header />)
    await user.click(screen.getByRole('button', { name: 'New' }))

    expect(usePenStore.getState().html).toBe('<p>draft</p>')
    expect(usePenStore.getState().css).toBe('body{}')
    expect(usePenStore.getState().resetRevision).toBe(0)
  })

  it('Reset still restores defaults without confirm', async () => {
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm')

    render(<Header />)
    await user.click(screen.getByRole('button', { name: 'Reset' }))

    expect(confirmSpy).not.toHaveBeenCalled()
    expect(usePenStore.getState().html).toBe(DEFAULT_HTML)
    expect(usePenStore.getState().css).toBe(DEFAULT_CSS)
  })
})
```

- [ ] **Step 2: Run Header tests to verify they fail**

```bash
npm test -- src/components/Header.test.tsx
```

Expected: FAIL — no New button / wrong button list.

- [ ] **Step 3: Implement Header New button**

Replace `src/components/Header.tsx` with:

```tsx
import { usePenStore } from '../store/penStore'
import Favicon from '../assets/favicon.svg?react'

const CLEAR_CONFIRM = 'Clear all HTML and CSS? This cannot be undone.'

const actionButtonClassName =
  'rounded border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-200 hover:bg-zinc-800 cursor-pointer'

export function Header() {
  const reset = usePenStore((s) => s.reset)
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
          New
        </button>
        <button type="button" onClick={reset} className={actionButtonClassName}>
          Reset
        </button>
      </div>
    </header>
  )
}
```

- [ ] **Step 4: Run Header + store tests**

```bash
npm test -- src/components/Header.test.tsx src/store/penStore.test.ts
```

Expected: PASS.

- [ ] **Step 5: Full suite + lint**

```bash
npm test && npm run lint
```

Expected: all green.

- [ ] **Step 6: Snyk scan on modified first-party code**

Run Snyk Code scan on `src/store/penStore.ts` and `src/components/Header.tsx` (and tests). Fix any new issues; rescan until clean. If auth is unavailable, note and continue.

- [ ] **Step 7: Commit (only if user asked)** — otherwise skip.

---

## Spec coverage (self-review)

| Spec requirement | Task |
|------------------|------|
| New left of Reset, same style | Task 2 |
| `window.confirm` exact message | Task 2 |
| `clear` → empty + `resetRevision++` | Task 1 |
| Reset unchanged | Task 2 regression test |
| Scope store + Header | Tasks 1–2 |

No placeholders. Confirm string matches spec verbatim.
