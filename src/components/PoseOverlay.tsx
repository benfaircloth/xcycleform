import { useEffect, useRef } from 'react'
import type { PoseLandmark } from '../lib/pose-adapter'
import { CYCLING_LANDMARKS, SKELETON_CONNECTIONS } from '../lib/landmarks'

interface PoseOverlayProps {
  landmarks: PoseLandmark[] | null
  width: number
  height: number
  confidenceThreshold: number
  highlightIndices?: number[]
}

const CYCLING_INDICES = Object.values(CYCLING_LANDMARKS)

export function PoseOverlay({
  landmarks,
  width,
  height,
  confidenceThreshold,
  highlightIndices,
}: PoseOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = width
    canvas.height = height
    ctx.clearRect(0, 0, width, height)

    if (!landmarks) return

    for (const [startIdx, endIdx] of SKELETON_CONNECTIONS) {
      const start = landmarks[startIdx]
      const end = landmarks[endIdx]
      if (!start || !end) continue

      const avgVis = (start.visibility + end.visibility) / 2
      const alpha = avgVis < confidenceThreshold ? 0.3 : 0.8

      ctx.beginPath()
      ctx.moveTo(start.x * width, start.y * height)
      ctx.lineTo(end.x * width, end.y * height)
      ctx.strokeStyle = `rgba(0, 255, 170, ${alpha})`
      ctx.lineWidth = 2
      ctx.stroke()
    }

    for (const idx of CYCLING_INDICES) {
      const lm = landmarks[idx]
      if (!lm) continue

      const x = lm.x * width
      const y = lm.y * height
      const isHighlighted = highlightIndices?.includes(idx)
      const isLowConf = lm.visibility < confidenceThreshold

      const radius = isHighlighted ? 6 : 4

      ctx.beginPath()
      ctx.arc(x, y, radius, 0, 2 * Math.PI)

      if (isHighlighted) {
        ctx.fillStyle = isLowConf ? 'rgba(255, 165, 0, 0.9)' : 'rgba(255, 255, 0, 0.9)'
      } else {
        ctx.fillStyle = isLowConf ? 'rgba(255, 100, 100, 0.6)' : 'rgba(0, 255, 170, 0.8)'
      }

      ctx.fill()

      if (isHighlighted) {
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
    }
  }, [landmarks, width, height, confidenceThreshold, highlightIndices])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  )
}
