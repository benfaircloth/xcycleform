import { useCallback, useState } from 'react'
import type { MeasurementBuffer } from '../lib/measurement-buffer'
import { getCoaching, type CoachingResponse } from '../lib/seekrflow-client'

interface CoachingPanelProps {
  buffer: MeasurementBuffer
  onClear: () => void
}

export function CoachingPanel({ buffer, onClear }: CoachingPanelProps) {
  const [response, setResponse] = useState<CoachingResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = useCallback(async () => {
    const summary = buffer.summarize()
    if (!summary.angleStats) {
      setError('No angle measurements collected yet. Play the video first.')
      return
    }

    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const result = await getCoaching(summary)
      setResponse(result)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }, [buffer])

  const handleClear = useCallback(() => {
    onClear()
    setResponse(null)
    setError(null)
  }, [onClear])

  return (
    <div className="panel coaching-panel">
      <h3>Coaching</h3>

      <div className="coaching-stats">
        <span>{buffer.sampleCount} samples</span>
        <span>{buffer.cycleCount} cycles</span>
        {buffer.currentCadence !== null && (
          <span>{Math.round(buffer.currentCadence)} rpm</span>
        )}
      </div>

      <div className="coaching-controls">
        <button
          type="button"
          className="coaching-btn"
          onClick={handleAnalyze}
          disabled={loading || buffer.sampleCount === 0}
        >
          {loading ? 'Analyzing...' : 'Get Coaching'}
        </button>
        <button
          type="button"
          className="coaching-btn coaching-btn-secondary"
          onClick={handleClear}
        >
          Clear
        </button>
      </div>

      {error && <div className="coaching-error">{error}</div>}

      {response && (
        <div className="coaching-response">
          <div className="coaching-content">{response.content}</div>
          <div className="coaching-meta">
            {response.model} / {response.tokensUsed} tokens
          </div>
        </div>
      )}
    </div>
  )
}
