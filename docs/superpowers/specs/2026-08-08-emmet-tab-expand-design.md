# Emmet Expand Abbreviation (Tab)

## Goal

Enable [Emmet](https://emmet.io/) **Expand Abbreviation** in Mini Pen’s HTML and CSS CodeMirror editors: press **Tab** to expand abbreviations; if expand fails, fall back to normal indent.

## Scope

**In:**
- Expand Abbreviation on Tab in both HTML and CSS panels
- Indent fallback when expand returns false
- Shift-Tab → outdent (`indentLess`)

**Out:**
- Wrap with Abbreviation
- Balance / Select Item / full Emmet command set
- Custom Emmet snippets config
- Abbreviation preview tracker UI (optional later)

## Approach

Use official `@emmetio/codemirror6-plugin` with CodeMirror 6 keymap, matching the known `@uiw/react-codemirror` pattern: disable default `indentWithTab`, then:

```ts
Tab: (view) => expandAbbreviation(view) || indentMore(view)
Shift-Tab: indentLess
```

## Files

| File | Change |
|------|--------|
| `package.json` | Add `@emmetio/codemirror6-plugin` |
| `src/components/CodeEditor.tsx` | Wire Emmet keymap + `indentWithTab: false` |
| Tests | Cover Tab helper behavior (expand vs indent) where practical |

## Behavior

| Input | Panel | Tab result |
|-------|--------|------------|
| `ul>li*3` | HTML | Expanded HTML markup |
| `m10` | CSS | Expanded CSS property |
| Non-abbreviation / expand fails | Either | Indent (`indentMore`) |
| Shift-Tab | Either | Outdent |

## Constraints

- Keep existing Copy button / oneDark / lang extensions
- No store changes
- Do not commit unless user asks

## Success criteria

- Typing a common HTML/CSS Emmet abbreviation and pressing Tab expands it
- Tab still indents when there is nothing to expand
- Existing editor tests still pass
