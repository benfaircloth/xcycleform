import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the application title', () => {
    render(<App />)
    expect(screen.getByText('xCycleForm')).toBeInTheDocument()
  })

  it('shows the current phase status', () => {
    render(<App />)
    expect(screen.getByText(/Phase 0/)).toBeInTheDocument()
  })
})
