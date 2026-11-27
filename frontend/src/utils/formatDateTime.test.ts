import { describe, expect, it } from 'vitest'
import { formatDateTime } from './formatDateTime'

describe('formatDateTime', () => {
  it('formats an ISO date and time using the Brazilian date order', () => {
    expect(formatDateTime('2026-11-27T15:30:00Z')).toContain('27/11/2026')
  })
})
