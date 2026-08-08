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
