import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_CSS, DEFAULT_HTML } from '../lib/defaults'
import { usePenStore } from '../store/penStore'
import { EditorLayout } from './EditorLayout'

vi.mock('react-resizable-panels', () => ({
  Group: ({
    children,
    orientation = 'horizontal',
  }: ComponentProps<'div'> & { orientation?: 'horizontal' | 'vertical' }) => (
    <div data-testid={`group-${orientation}`}>{children}</div>
  ),
  Panel: ({ children }: ComponentProps<'div'>) => <div>{children}</div>,
  Separator: () => <div role="separator" />,
}))

vi.mock('./CodeEditor', () => ({
  CodeEditor: ({
    id,
    label,
    value,
    onChange,
  }: {
    id: string
    label: string
    value: string
    onChange: (value: string) => void
  }) => (
    <label>
      {label}
      <textarea id={id} aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  ),
}))

vi.mock('./Preview', () => ({
  Preview: () => <div>Preview</div>,
}))

describe('EditorLayout', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
    usePenStore.setState({ html: DEFAULT_HTML, css: DEFAULT_CSS })
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('renders nested horizontal and vertical resizable groups', () => {
    render(<EditorLayout />)

    expect(screen.getByTestId('group-horizontal')).toBeInTheDocument()
    expect(screen.getByTestId('group-vertical')).toBeInTheDocument()
    expect(screen.getAllByRole('separator')).toHaveLength(2)
  })

  it('updates the local editor immediately and the store after 150ms', () => {
    render(<EditorLayout />)
    const htmlEditor = screen.getByRole('textbox', { name: 'HTML' })

    fireEvent.change(htmlEditor, { target: { value: '<p>changed</p>' } })

    expect(htmlEditor).toHaveValue('<p>changed</p>')
    expect(usePenStore.getState().html).toBe(DEFAULT_HTML)

    act(() => {
      vi.advanceTimersByTime(149)
    })
    expect(usePenStore.getState().html).toBe(DEFAULT_HTML)

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(usePenStore.getState().html).toBe('<p>changed</p>')
  })

  it('synchronizes editor buffers when store content changes', () => {
    render(<EditorLayout />)

    act(() => {
      usePenStore.setState({ html: '<main>reset</main>', css: 'main { color: red; }' })
    })

    expect(screen.getByRole('textbox', { name: 'HTML' })).toHaveValue('<main>reset</main>')
    expect(screen.getByRole('textbox', { name: 'CSS' })).toHaveValue('main { color: red; }')
  })

  it('cancels a pending editor write when reset keeps the store at defaults', () => {
    render(<EditorLayout />)

    fireEvent.change(screen.getByRole('textbox', { name: 'HTML' }), {
      target: { value: '<p>stale edit</p>' },
    })

    act(() => {
      usePenStore.getState().reset()
    })

    act(() => {
      vi.advanceTimersByTime(150)
    })

    expect(usePenStore.getState().html).toBe(DEFAULT_HTML)
    expect(screen.getByRole('textbox', { name: 'HTML' })).toHaveValue(DEFAULT_HTML)
  })
})
