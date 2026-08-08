import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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

  it('renders New button', () => {
    render(<Header />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.map((b) => b.textContent)).toEqual(['New'])
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
})
