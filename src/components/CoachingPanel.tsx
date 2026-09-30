import { useCallback, useEffect, useRef, useState } from 'react'
import type { MeasurementBuffer } from '../lib/measurement-buffer'
import { getCoaching, type CoachingResponse } from '../lib/seekrflow-client'

interface CoachingPanelProps {
  buffer: MeasurementBuffer
  onClear: () => void
}

type LoadingStage = 'preparing' | 'sending' | 'waiting' | null

export function CoachingPanel({ buffer, onClear }: CoachingPanelProps) {
  const [response, setResponse] = useState<CoachingResponse | null>(null)
  const [stage, setStage] = useState<LoadingStage>(null)
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startRef = useRef(0)

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => () => stopTimer(), [stopTimer])

  const startTimer = useCallback(() => {
    stopTimer()
    startRef.current = Date.now()
    setElapsed(0)
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
    }, 1000)
  }, [stopTimer])

  const handleAnalyze = useCallback(async () => {
    const summary = buffer.summarize()
    if (!summary.angleStats) {
      setError('No angle measurements collected yet. Play the video first.')
      return
    }

    setError(null)
    setResponse(null)

    const frameCount = summary.capturedFrames.length
    setStage('preparing')
    startTimer()

    try {
      setStage(frameCount > 0 ? 'sending' : 'waiting')
      const result = await getCoaching(summary)
      setResponse(result)
    } catch (err) {
      setError(String(err))
    } finally {
      setStage(null)
      stopTimer()
    }
  }, [buffer, startTimer, stopTimer])

  const handleClear = useCallback(() => {
    onClear()
    setResponse(null)
    setError(null)
    setStage(null)
    stopTimer()
  }, [onClear, stopTimer])

  const stageLabel = stage === 'preparing'
    ? 'Preparing analysis...'
    : stage === 'sending'
      ? `Sending ${buffer.capturedFrameCount} frames to VLM...`
      : stage === 'waiting'
        ? 'Waiting for model response...'
        : null

  return (
    <div className="panel coaching-panel">
      <h3>Coaching</h3>

      <div className="coaching-stats">
        <span>{buffer.sampleCount} samples</span>
        <span>{buffer.cycleCount} cycles</span>
        {buffer.currentCadence !== null && (
          <span>{Math.round(buffer.currentCadence)} rpm</span>
        )}
        {buffer.capturedFrameCount > 0 && (
          <span>{buffer.capturedFrameCount} frames captured</span>
        )}
      </div>

      <div className="coaching-controls">
        <button
          type="button"
          className="coaching-btn"
          onClick={handleAnalyze}
          disabled={stage !== null || buffer.sampleCount === 0}
        >
          {stage ? 'Analyzing...' : 'Get Coaching'}
        </button>
        <button
          type="button"
          className="coaching-btn coaching-btn-secondary"
          onClick={handleClear}
        >
          Clear
        </button>
      </div>

      {stage && (
        <div className="coaching-status">
          <div className="coaching-status-spinner" />
          <span>{stageLabel}</span>
          <span className="coaching-status-elapsed">{elapsed}s</span>
        </div>
      )}

      {error && <div className="coaching-error">{error}</div>}

      {response && (
        <div className="coaching-response">
          <div className="coaching-content">{response.content}</div>
          <div className="coaching-meta">
            {response.model} / {response.tokensUsed} tokens / {elapsed}s
          </div>
        </div>
      )}
    </div>
  )
}
