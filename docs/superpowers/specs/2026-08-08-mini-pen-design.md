# mini-pen — Design Spec

Simple CodePen-like playground: edit HTML/CSS on the left, live preview on the right. Deploy to GitHub Pages via GitHub Actions.

## Goals

- Two editors (HTML, CSS) with syntax highlighting
- Live preview of combined HTML + CSS
- Dark UI
- Persist pen to `localStorage` across reloads
- Resizable panes (horizontal and vertical)
- TypeScript, React, Tailwind, Zustand
- Deploy static build to GitHub Pages with GitHub Actions

## Non-goals (MVP)

- JavaScript editor or runtime in the preview
- Shareable URLs / cloud save
- Auth, multi-file projects, packages/CDN UI
- Light theme or theme toggle
- E2E test suite

## Stack

| Layer | Choice |
|-------|--------|
| Bundler | Vite |
| UI | React + TypeScript |
| Styling (app shell) | Tailwind CSS |
| State | Zustand + `persist` middleware |
| Editors | CodeMirror 6 (`@codemirror/lang-html`, `@codemirror/lang-css`) |
| Panels | `react-resizable-panels` |
| Preview | `iframe` + `srcdoc` |
| Hosting | GitHub Pages |
| CI | GitHub Actions (`actions/deploy-pages`) |

Vite `base` must be `'/mini-pen/'` (repo name) so assets resolve on Pages.

## Architecture

```
┌─────────────────────────────────────────────┐
│ Header (brand + Reset)                      │
├──────────────────┬──────────────────────────┤
│ HTML (CM6)       │                          │
│ ═══════ drag ═══ │   Preview (iframe)       │
│ CSS (CM6)        │                          │
│◄──── drag ──────►│                          │
└──────────────────┴──────────────────────────┘
```

- Single-page Vite app
- Zustand store owns `html` / `css` and is the source of truth after debounce
- Preview derives a full HTML document string and assigns it to `iframe.srcdoc`
- iframe sandbox: `allow-same-origin` only (no `allow-scripts`)
- Layout: horizontal `PanelGroup` (editors | preview), nested vertical `PanelGroup` (HTML | CSS)

## Components

| Unit | Responsibility | Depends on |
|------|----------------|------------|
| `App` | Dark shell, compose Header + EditorLayout | store (indirect) |
| `Header` | Brand `mini-pen`, Reset button | `reset` action |
| `EditorLayout` | Nested resizable panel groups | `react-resizable-panels` |
| `CodeEditor` | CodeMirror 6 wrapper; props `lang`, `value`, `onChange` | `@codemirror/*` |
| `Preview` | Subscribe to store; set `iframe.srcdoc` | store, `buildPreviewDocument` |
| `store/penStore` | `html`, `css`, `setHtml`, `setCss`, `reset` + persist | zustand |
| `lib/buildPreviewDocument` | Pure `(html, css) => document string` | none |

Boundaries:

- `CodeEditor` is presentational; it does not import the store.
- Debounce lives in the parent that wires editors to the store (or a thin wrapper), not inside the pure preview builder.
- `buildPreviewDocument` stays framework-free for unit tests.

## Data flow

1. User types in CodeMirror → local buffer updates immediately (editor stays responsive).
2. After ~150ms without further input → call `setHtml` / `setCss` on the store.
3. Store update triggers:
   - `persist` write to `localStorage` (key: `mini-pen`)
   - `Preview` re-renders and assigns new `srcdoc` (no second debounce)
4. Reset bypasses debounce: write starter defaults into the store immediately.

```
[CodeEditor] → buffer → [debounce ~150ms] → setHtml/setCss → [penStore]
                                                              ├→ localStorage
                                                              └→ Preview → iframe.srcdoc
```

### Default starter

On first visit (empty persist) and on Reset:

- HTML: minimal markup including `<h1>Hello</h1>` (body fragment or full document body content — `buildPreviewDocument` wraps into a full document)
- CSS: simple readable styles (e.g. body font/color suited to a light preview canvas inside the dark app chrome)

### Preview document shape

`buildPreviewDocument(html, css)` returns approximately:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>{css}</style>
  </head>
  <body>{html}</body>
</html>
```

User HTML is treated as body content (not a full document). Invalid markup is left to the browser; the app must not crash.

## Error handling

| Case | Behavior |
|------|----------|
| Broken user HTML/CSS | Browser renders what it can; app shell unaffected |
| `localStorage` quota / blocked | Persist fails quietly (`console.warn` acceptable); in-memory state still works |
| Reset | Immediate restore to starter; no confirm dialog in MVP |
| Wrong Pages base path | Prevented by Vite `base: '/mini-pen/'` and deploying `dist` |

## Testing

- Unit: `buildPreviewDocument` — injects CSS into `<style>`, places HTML in `<body>`, empty-string edges
- Unit: store `reset` returns to starter defaults
- Manual: type → pause → preview updates; reload restores; drag both gutters; Pages URL loads assets
- No E2E required for MVP

## Deploy (GitHub Actions → GitHub Pages)

Workflow on push to `main` (and optionally `workflow_dispatch`):

1. Checkout
2. Setup Node
3. `npm ci`
4. `npm run build`
5. Upload `dist` artifact
6. Deploy with `actions/deploy-pages`

Repo Settings → Pages → Source: GitHub Actions.

## File layout (target)

```
mini-pen/
  index.html
  package.json
  vite.config.ts
  tailwind / postcss config as needed
  src/
    main.tsx
    App.tsx
    index.css
    components/
      Header.tsx
      EditorLayout.tsx
      CodeEditor.tsx
      Preview.tsx
    store/
      penStore.ts
    lib/
      buildPreviewDocument.ts
  .github/workflows/deploy.yml
  docs/superpowers/specs/2026-08-08-mini-pen-design.md
```

## Decisions log

| Topic | Choice |
|-------|--------|
| Editor | CodeMirror 6 |
| Persist | `localStorage` only |
| JS pane | Out of scope |
| Resize | Horizontal + vertical |
| Theme | Dark fixed |
| Approach | Vite SPA + Zustand + iframe `srcdoc` |
| Debounce | Before store update (~150ms), not only before preview |
