import { useEffect, useRef } from 'react'
import type { PoseLandmark } from '../lib/pose-adapter'
import { CYCLING_LANDMARKS, SKELETON_CONNECTIONS } from '../lib/landmarks'

interface PoseOverlayProps {
  allPoses: PoseLandmark[][]
  selectedPoseIndex: number
  width: number
  height: number
  confidenceThreshold: number
  highlightIndices?: number[]
}

const CYCLING_INDICES = Object.values(CYCLING_LANDMARKS)

const POSE_COLORS = [
  { line: '0, 255, 170', dot: '0, 255, 170', highlight: '255, 255, 0' },
  { line: '100, 150, 255', dot: '100, 150, 255', highlight: '255, 180, 100' },
]

export function PoseOverlay({
  allPoses,
  selectedPoseIndex,
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

    if (allPoses.length === 0) return

    for (let poseIdx = 0; poseIdx < allPoses.length; poseIdx++) {
      const landmarks = allPoses[poseIdx]
      if (!landmarks) continue

      const isSelected = poseIdx === selectedPoseIndex
      const colors = POSE_COLORS[poseIdx % POSE_COLORS.length]
      const dimFactor = isSelected ? 1 : 0.35

      for (const [startIdx, endIdx] of SKELETON_CONNECTIONS) {
        const start = landmarks[startIdx]
        const end = landmarks[endIdx]
        if (!start || !end) continue

        const avgVis = (start.visibility + end.visibility) / 2
        const alpha = (avgVis < confidenceThreshold ? 0.3 : 0.8) * dimFactor

        ctx.beginPath()
        ctx.moveTo(start.x * width, start.y * height)
        ctx.lineTo(end.x * width, end.y * height)
        ctx.strokeStyle = `rgba(${colors.line}, ${alpha})`
        ctx.lineWidth = isSelected ? 2 : 1
        ctx.stroke()
      }

      for (const idx of CYCLING_INDICES) {
        const lm = landmarks[idx]
        if (!lm) continue

        const x = lm.x * width
        const y = lm.y * height
        const isHighlighted = isSelected && highlightIndices?.includes(idx)
        const isLowConf = lm.visibility < confidenceThreshold

        const radius = isHighlighted ? 6 : isSelected ? 4 : 3

        ctx.beginPath()
        ctx.arc(x, y, radius, 0, 2 * Math.PI)

        if (isHighlighted) {
          ctx.fillStyle = isLowConf
            ? `rgba(255, 165, 0, ${0.9 * dimFactor})`
            : `rgba(${colors.highlight}, ${0.9 * dimFactor})`
        } else {
          ctx.fillStyle = isLowConf
            ? `rgba(255, 100, 100, ${0.6 * dimFactor})`
            : `rgba(${colors.dot}, ${0.8 * dimFactor})`
        }

        ctx.fill()

        if (isHighlighted) {
          ctx.strokeStyle = '#fff'
          ctx.lineWidth = 1.5
          ctx.stroke()
        }
      }

      if (!isSelected && allPoses.length > 1) {
        const avgX = landmarks.reduce((s, lm) => s + lm.x, 0) / landmarks.length
        const avgY = Math.min(...landmarks.map((lm) => lm.y))
        ctx.fillStyle = `rgba(${colors.dot}, 0.6)`
        ctx.font = '12px system-ui'
        ctx.textAlign = 'center'
        ctx.fillText(`Person ${poseIdx + 1}`, avgX * width, avgY * height - 8)
      }
    }
  }, [allPoses, selectedPoseIndex, width, height, confidenceThreshold, highlightIndices])

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
