import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

vi.mock('./lib/pose-adapter', () => ({
  initPoseLandmarker: vi.fn(() => Promise.resolve({})),
  detectPose: vi.fn(() => null),
  detectForImage: vi.fn(() => null),
  destroyPoseLandmarker: vi.fn(),
}))

describe('App', () => {
  it('renders the application title', () => {
    render(<App />)
    expect(screen.getByText('xCycleForm')).toBeInTheDocument()
  })

  it('shows load video button', () => {
    render(<App />)
    expect(screen.getByText('Load Video')).toBeInTheDocument()
  })

  it('shows live camera button', () => {
    render(<App />)
    expect(screen.getByText('Live Camera')).toBeInTheDocument()
  })

  it('shows side toggle buttons', () => {
    render(<App />)
    expect(screen.getByText('Left')).toBeInTheDocument()
    expect(screen.getByText('Right')).toBeInTheDocument()
  })

  it('shows panel headers', () => {
    render(<App />)
    expect(screen.getByText('Landmark Confidence')).toBeInTheDocument()
    expect(screen.getByText('Debug')).toBeInTheDocument()
  })

  it('shows pose unavailable when no detection', () => {
    render(<App />)
    expect(screen.getByText('Pose unavailable')).toBeInTheDocument()
  })

  it('does not show normative reference ranges', () => {
    render(<App />)
    const text = document.body.textContent ?? ''
    expect(text).not.toContain('reference range')
    expect(text).not.toContain('reference envelope')
  })
})
