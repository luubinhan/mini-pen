import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_CSS, DEFAULT_HTML } from '../lib/defaults'
import { usePenStore } from '../store/penStore'
import { Preview } from './Preview'

describe('Preview', () => {
  beforeEach(() => {
    usePenStore.setState({ html: DEFAULT_HTML, css: DEFAULT_CSS })
  })

  it('allows same-origin preview content without allowing scripts', () => {
    render(<Preview />)

    const sandbox = screen.getByTitle('preview').getAttribute('sandbox')?.split(/\s+/) ?? []

    expect(sandbox).toContain('allow-same-origin')
    expect(sandbox).not.toContain('allow-scripts')
  })
})
