import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_CSS, DEFAULT_HTML } from '../lib/defaults'
import { usePenStore } from './penStore'

describe('penStore', () => {
  beforeEach(() => {
    localStorage.clear()
    usePenStore.setState({ html: DEFAULT_HTML, css: DEFAULT_CSS })
  })

  it('setHtml and setCss update state', () => {
    usePenStore.getState().setHtml('<p>x</p>')
    usePenStore.getState().setCss('p { color: blue; }')
    expect(usePenStore.getState().html).toBe('<p>x</p>')
    expect(usePenStore.getState().css).toBe('p { color: blue; }')

    const persisted = JSON.parse(localStorage.getItem('mini-pen') ?? '{}') as {
      state?: { html?: string; css?: string }
    }
    expect(persisted.state).toEqual({
      html: '<p>x</p>',
      css: 'p { color: blue; }',
    })
  })

  it('reset restores defaults', () => {
    usePenStore.getState().setHtml('<p>changed</p>')
    usePenStore.getState().setCss('/* changed */')
    usePenStore.getState().reset()
    expect(usePenStore.getState().html).toBe(DEFAULT_HTML)
    expect(usePenStore.getState().css).toBe(DEFAULT_CSS)
  })
})
