import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CodeEditor } from './CodeEditor'

vi.mock('@uiw/react-codemirror', () => ({
  default: () => <div data-testid="codemirror-stub" />,
}))

function setupClipboardUser() {
  const user = userEvent.setup()

  if (!navigator.clipboard) {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.resolve() },
    })
  }

  const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)
  return { user, writeText }
}

describe('CodeEditor copy', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('copies the full editor value when the copy button is clicked', async () => {
    const { user, writeText } = setupClipboardUser()

    render(
      <CodeEditor label="HTML" lang="html" value="<h1>Hi</h1>" onChange={() => {}} />,
    )

    await user.click(screen.getByRole('button', { name: 'Copy code' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('<h1>Hi</h1>')
    })
  })

  it('shows a Copied label after a successful copy', async () => {
    const { user } = setupClipboardUser()

    render(
      <CodeEditor label="CSS" lang="css" value="body{}" onChange={() => {}} />,
    )

    await user.click(screen.getByRole('button', { name: 'Copy code' }))

    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument()
  })

  it('reverts to Copy code after 1.5s', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    if (!navigator.clipboard) {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: () => Promise.resolve() },
      })
    }
    vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)

    render(
      <CodeEditor label="HTML" lang="html" value="x" onChange={() => {}} />,
    )

    await user.click(screen.getByRole('button', { name: 'Copy code' }))
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument()

    await vi.advanceTimersByTimeAsync(1500)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument()
    })
  })

  it('does not show Copied when clipboard write fails', async () => {
    const { user, writeText } = setupClipboardUser()
    writeText.mockRejectedValue(new Error('denied'))

    render(
      <CodeEditor label="HTML" lang="html" value="x" onChange={() => {}} />,
    )

    await user.click(screen.getByRole('button', { name: 'Copy code' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
    })
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Copied' })).not.toBeInTheDocument()
  })
})
