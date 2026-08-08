# Header “New” Button

## Goal

Add a **New** control next to **Reset** that clears all HTML and CSS after an explicit browser confirm.

## Placement

- Header actions on the right: **New** then **Reset** (New to the left of Reset).
- Same visual style as the existing Reset button (`rounded border border-zinc-700 …`).

## Behavior

| Action | Result |
|--------|--------|
| **New** → confirm OK | `html = ''`, `css = ''`, bump `resetRevision` so `EditorLayout` local editors sync |
| **New** → confirm Cancel | No state change |
| **Reset** (unchanged) | Restore `DEFAULT_HTML` / `DEFAULT_CSS`, bump `resetRevision` |

- Confirm UI: `window.confirm` with message: `Clear all HTML and CSS? This cannot be undone.`
- Persist via existing Zustand `persist` (empty strings are stored like any other content).

## Store API

Add `clear: () => void` on `PenState`, parallel to `reset`:

```ts
clear: () =>
  set((state) => ({
    html: '',
    css: '',
    resetRevision: state.resetRevision + 1,
  }))
```

Header wires: `onClick` → `if (window.confirm(...)) clear()`.

## Scope

- Modify: `src/store/penStore.ts`, `src/components/Header.tsx`
- Tests: store `clear` + Header confirm/cancel/clear wiring
- Out of scope: custom modal, skipping confirm when already empty, changing Reset

## Notes

- Do not clear editors only in the Header without `resetRevision` — local `EditorLayout` state would desync.
- CodeEditor itself needs no UI changes; it already renders whatever `value` it receives.
