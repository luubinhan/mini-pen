import { describe, expect, it } from 'vitest'
import { buildPreviewDocument } from './buildPreviewDocument'

describe('buildPreviewDocument', () => {
  it('wraps html in body and css in style', () => {
    const doc = buildPreviewDocument('<h1>Hi</h1>', 'h1 { color: red; }')
    expect(doc).toContain('<!DOCTYPE html>')
    expect(doc).toContain('<meta charset="UTF-8" />')
    expect(doc).toContain('<style>h1 { color: red; }</style>')
    expect(doc).toContain('<body><h1>Hi</h1></body>')
  })

  it('handles empty html and css', () => {
    const doc = buildPreviewDocument('', '')
    expect(doc).toContain('<style></style>')
    expect(doc).toContain('<body></body>')
  })
})
