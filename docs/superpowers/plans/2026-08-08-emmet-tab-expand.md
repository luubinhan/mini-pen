# Emmet Tab Expand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tab expands Emmet abbreviations in HTML/CSS editors; if expand fails, Tab indents.

**Architecture:** Install `@emmetio/codemirror6-plugin`. Extract a tiny Tab command helper that runs `expandAbbreviation` then `indentMore`. Wire it into `CodeEditor` via `keymap` + `emmetConfig` syntax per `lang`, and set `indentWithTab: false` so default Tab indent does not steal the binding.

**Tech Stack:** CodeMirror 6, `@uiw/react-codemirror`, `@emmetio/codemirror6-plugin`, `@codemirror/commands`, Vitest.

## Global Constraints

- Expand Abbreviation only (no wrap / balance / full toolkit).
- Tab: expand then indent fallback; Shift-Tab: `indentLess`.
- Both HTML and CSS panels; set Emmet `syntax` to match `lang`.
- Keep Copy button and existing editor UX.
- Do not commit unless the user explicitly asks.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `package.json` / lockfile | Add `@emmetio/codemirror6-plugin` |
| `src/lib/emmetTab.ts` | Tab command: expand \|\| indent |
| `src/lib/emmetTab.test.ts` | Unit test helper with mocks |
| `src/components/CodeEditor.tsx` | Extensions: `emmetConfig` + keymap; `indentWithTab: false` |

---

### Task 1: Install plugin + Tab helper (TDD)

**Files:**
- Modify: `package.json`, `package-lock.json`
- Create: `src/lib/emmetTab.ts`
- Create: `src/lib/emmetTab.test.ts`

**Interfaces:**
- Produces: `runEmmetTab(view: EditorView): boolean`
- Consumes: `expandAbbreviation` from `@emmetio/codemirror6-plugin`, `indentMore` from `@codemirror/commands`

- [ ] **Step 1: Install dependency**

```bash
npm install @emmetio/codemirror6-plugin
```

Expected: package listed under `dependencies`.

- [ ] **Step 2: Write failing tests for Tab helper**

Create `src/lib/emmetTab.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest'
import type { EditorView } from '@codemirror/view'

const expandAbbreviation = vi.fn()
const indentMore = vi.fn()

vi.mock('@emmetio/codemirror6-plugin', () => ({
  expandAbbreviation: (...args: unknown[]) => expandAbbreviation(...args),
}))

vi.mock('@codemirror/commands', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@codemirror/commands')>()
  return {
    ...actual,
    indentMore: (...args: unknown[]) => indentMore(...args),
  }
})

import { runEmmetTab } from './emmetTab'

describe('runEmmetTab', () => {
  const view = {} as EditorView

  it('returns true and skips indent when expand succeeds', () => {
    expandAbbreviation.mockReturnValue(true)
    expect(runEmmetTab(view)).toBe(true)
    expect(expandAbbreviation).toHaveBeenCalledWith(view)
    expect(indentMore).not.toHaveBeenCalled()
  })

  it('falls back to indentMore when expand fails', () => {
    expandAbbreviation.mockReturnValue(false)
    indentMore.mockReturnValue(true)
    expect(runEmmetTab(view)).toBe(true)
    expect(indentMore).toHaveBeenCalledWith(view)
  })
})
```

- [ ] **Step 3: Run tests — expect FAIL**

```bash
npm test -- src/lib/emmetTab.test.ts
```

Expected: FAIL — module `./emmetTab` missing.

- [ ] **Step 4: Implement helper**

Create `src/lib/emmetTab.ts`:

```ts
import { indentMore } from '@codemirror/commands'
import { expandAbbreviation } from '@emmetio/codemirror6-plugin'
import type { EditorView } from '@codemirror/view'

export function runEmmetTab(view: EditorView): boolean {
  return expandAbbreviation(view) || indentMore(view)
}
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
npm test -- src/lib/emmetTab.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit (only if user asked)** — skip otherwise.

---

### Task 2: Wire Emmet into CodeEditor

**Files:**
- Modify: `src/components/CodeEditor.tsx`
- Optionally extend: `src/components/CodeEditor.test.tsx` (assert extensions path not required if helper covered; keep existing copy tests green)

**Interfaces:**
- Consumes: `runEmmetTab`, `emmetConfig`, `keymap`, `indentLess`
- Produces: CodeMirror with Tab/Shift-Tab Emmet behavior; `indentWithTab: false`

- [ ] **Step 1: Update CodeEditor extensions**

In `src/components/CodeEditor.tsx`, change imports and `useMemo` / CodeMirror props:

```tsx
import { indentLess } from '@codemirror/commands'
import { css } from '@codemirror/lang-css'
import { html } from '@codemirror/lang-html'
import { keymap } from '@codemirror/view'
import CodeMirror from '@uiw/react-codemirror'
import { oneDark } from '@codemirror/theme-one-dark'
import { emmetConfig } from '@emmetio/codemirror6-plugin'
import { Check, Copy } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { runEmmetTab } from '../lib/emmetTab'

// inside component:
  const extensions = useMemo(
    () => [
      lang === 'html' ? html() : css(),
      emmetConfig.of({ syntax: lang }),
      keymap.of([
        { key: 'Tab', run: runEmmetTab },
        { key: 'Shift-Tab', run: indentLess },
      ]),
    ],
    [lang],
  )
```

On `<CodeMirror>` add:

```tsx
          basicSetup={{
            foldGutter: false,
            lineNumbers: true,
            highlightActiveLine: true,
            // @uiw/react-codemirror also accepts top-level indentWithTab — set both if needed
          }}
          indentWithTab={false}
```

If TypeScript complains that `indentWithTab` is unknown on the component, set it only via `basicSetup` / check `@uiw/react-codemirror` props — the package exposes `indentWithTab` as a prop on `ReactCodeMirror` in recent versions. Prefer the prop.

- [ ] **Step 2: Run existing CodeEditor + full suite**

```bash
npm test -- src/components/CodeEditor.test.tsx src/lib/emmetTab.test.ts
npm test && npm run lint
```

Expected: all green. Fix type/import issues if lint/tsc fails (`npm run build` if needed).

- [ ] **Step 3: Manual smoke (optional but recommended)**

```bash
npm run dev
```

In HTML panel type `ul>li*3` then Tab → list markup. In CSS type `m10` then Tab → `margin: 10px;`. Tab on empty line → indent.

- [ ] **Step 4: Snyk scan on new/modified first-party files**

Scan `src/lib/emmetTab.ts` and `src/components/CodeEditor.tsx`. Fix issues; note if auth unavailable.

- [ ] **Step 5: Commit (only if user asked)** — skip otherwise.

---

## Spec coverage (self-review)

| Spec | Task |
|------|------|
| `@emmetio/codemirror6-plugin` | Task 1 |
| Tab expand \|\| indent | Task 1 + 2 |
| Shift-Tab outdent | Task 2 |
| HTML + CSS syntax | Task 2 `emmetConfig.of({ syntax: lang })` |
| `indentWithTab={false}` | Task 2 |
| No wrap / full toolkit | Scope limited in both tasks |

No placeholders. Helper keeps Tab logic unit-testable without mounting CodeMirror.
