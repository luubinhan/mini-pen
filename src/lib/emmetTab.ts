import { indentMore } from '@codemirror/commands'
import { expandAbbreviation } from '@emmetio/codemirror6-plugin'
import type { EditorView } from '@codemirror/view'

export function runEmmetTab(view: EditorView): boolean {
  return expandAbbreviation(view) || indentMore(view)
}
