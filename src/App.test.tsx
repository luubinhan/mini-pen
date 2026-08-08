import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

vi.mock('./components/Header', () => ({
  Header: () => <div>Header</div>,
}))

vi.mock('./components/EditorLayout', () => ({
  EditorLayout: () => <div>Editor layout</div>,
}))

describe('App', () => {
  afterEach(cleanup)

  it('renders the header and editor layout', () => {
    render(<App />)

    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(screen.getByText('Editor layout')).toBeInTheDocument()
  })
})
