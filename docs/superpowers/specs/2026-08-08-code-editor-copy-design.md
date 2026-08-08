# Code Editor Copy Button

## Goal

Add a control to copy the full contents of each `CodeEditor` panel (HTML / CSS) to the clipboard.

## Placement

- Button lives in the panel header row (same row as the `HTML` / `CSS` label).
- Layout: `justify-between` — label on the left, copy button on the right.
- Not an overlay on the CodeMirror surface.

## Behavior

- On click: `navigator.clipboard.writeText(value)` with the editor’s current `value`.
- Empty string is allowed (still copies).
- On success: swap the icon to a check for ~1.5s, then revert to the copy icon.
- On failure (clipboard rejected / unavailable): do not show the success state; leave the copy icon unchanged.
- Accessible: `type="button"`, `aria-label="Copy code"` (and `aria-label="Copied"` while in success state, or keep label and rely on visual feedback).

## Icons

- Use [Lucide](https://lucide.dev/icons/) via `lucide-react`.
- Default: `Copy`
- Success: `Check`
- Size ~14–16px to match the compact header (`text-xs` label row).

## Styling

- Match existing zinc dark theme: muted `text-zinc-400`, hover `text-zinc-200`.
- Icon-only button; no card, no pill cluster, no toast.

## Implementation scope

- Change `src/components/CodeEditor.tsx` only (plus `lucide-react` dependency).
- Local `copied` state + timeout cleanup on unmount / re-click.
- No store changes; no new shared components unless they emerge naturally during implementation.

## Out of scope

- Toast / snackbar
- Copy combined HTML+CSS document
- Keyboard shortcut
- Overlay placement on the editor surface
