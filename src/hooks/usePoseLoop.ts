import { useCallback, useEffect, useRef, useState } from 'react'
import type { PoseLandmark, PoseResult } from '../lib/pose-adapter'
import { detectPose, destroyPoseLandmarker, initPoseLandmarker } from '../lib/pose-adapter'
import { CYCLING_LANDMARKS } from '../lib/landmarks'
import { computeKneeAngle, type KneeAngleResult } from '../lib/geometry'
import type { PoseLandmarker } from '@mediapipe/tasks-vision'

export interface PoseLoopState {
  landmarks: PoseLandmark[] | null
  kneeAngleLeft: KneeAngleResult | null
  kneeAngleRight: KneeAngleResult | null
  renderFps: number
  inferenceFps: number
  inferenceLatency: number
  isModelLoaded: boolean
  modelError: string | null
}

const DEFAULT_STATE: PoseLoopState = {
  landmarks: null,
  kneeAngleLeft: null,
  kneeAngleRight: null,
  renderFps: 0,
  inferenceFps: 0,
  inferenceLatency: 0,
  isModelLoaded: false,
  modelError: null,
}

export function usePoseLoop(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  isPlaying: boolean,
  confidenceThreshold: number,
) {
  const [state, setState] = useState<PoseLoopState>(DEFAULT_STATE)
  const landmarkerRef = useRef<PoseLandmarker | null>(null)
  const animFrameRef = useRef<number>(0)
  const lastTimestampRef = useRef<number>(-1)
  const renderFrameTimesRef = useRef<number[]>([])
  const inferenceFrameTimesRef = useRef<number[]>([])

  useEffect(() => {
    let cancelled = false
    initPoseLandmarker()
      .then((lm) => {
        if (!cancelled) {
          landmarkerRef.current = lm
          setState((s) => ({ ...s, isModelLoaded: true }))
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setState((s) => ({ ...s, modelError: String(err) }))
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const processFrame = useCallback(() => {
    const video = videoRef.current
    const landmarker = landmarkerRef.current
    if (!video || !landmarker || video.paused || video.ended) return

    const now = performance.now()
    renderFrameTimesRef.current.push(now)
    const oneSecAgo = now - 1000
    renderFrameTimesRef.current = renderFrameTimesRef.current.filter((t) => t > oneSecAgo)

    const currentTimeMs = video.currentTime * 1000

    if (currentTimeMs !== lastTimestampRef.current && currentTimeMs > 0) {
      lastTimestampRef.current = currentTimeMs

      const result = detectPose(landmarker, video, Math.round(currentTimeMs))

      if (result) {
        inferenceFrameTimesRef.current.push(now)
        inferenceFrameTimesRef.current = inferenceFrameTimesRef.current.filter((t) => t > oneSecAgo)

        const kneeAngleLeft = computeKneeAngleFromResult(result, 'left', confidenceThreshold)
        const kneeAngleRight = computeKneeAngleFromResult(result, 'right', confidenceThreshold)

        setState((s) => ({
          ...s,
          landmarks: result.landmarks,
          kneeAngleLeft,
          kneeAngleRight,
          renderFps: renderFrameTimesRef.current.length,
          inferenceFps: inferenceFrameTimesRef.current.length,
          inferenceLatency: result.inferenceLatencyMs,
        }))
      }
    }

    animFrameRef.current = requestAnimationFrame(processFrame)
  }, [videoRef, confidenceThreshold])

  const runSingleFrame = useCallback(() => {
    const video = videoRef.current
    const landmarker = landmarkerRef.current
    if (!video || !landmarker) return

    const currentTimeMs = video.currentTime * 1000
    if (currentTimeMs <= 0) return

    lastTimestampRef.current = currentTimeMs
    const result = detectPose(landmarker, video, Math.round(currentTimeMs))

    if (result) {
      const kneeAngleLeft = computeKneeAngleFromResult(result, 'left', confidenceThreshold)
      const kneeAngleRight = computeKneeAngleFromResult(result, 'right', confidenceThreshold)

      setState((s) => ({
        ...s,
        landmarks: result.landmarks,
        kneeAngleLeft,
        kneeAngleRight,
        inferenceLatency: result.inferenceLatencyMs,
      }))
    }
  }, [videoRef, confidenceThreshold])

  useEffect(() => {
    if (isPlaying && state.isModelLoaded) {
      animFrameRef.current = requestAnimationFrame(processFrame)
    }
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [isPlaying, state.isModelLoaded, processFrame])

  useEffect(() => {
    return () => {
      destroyPoseLandmarker()
    }
  }, [])

  return { ...state, runSingleFrame }
}

function computeKneeAngleFromResult(
  result: PoseResult,
  side: 'left' | 'right',
  threshold: number,
): KneeAngleResult {
  const hipIdx = side === 'left' ? CYCLING_LANDMARKS.LEFT_HIP : CYCLING_LANDMARKS.RIGHT_HIP
  const kneeIdx = side === 'left' ? CYCLING_LANDMARKS.LEFT_KNEE : CYCLING_LANDMARKS.RIGHT_KNEE
  const ankleIdx = side === 'left' ? CYCLING_LANDMARKS.LEFT_ANKLE : CYCLING_LANDMARKS.RIGHT_ANKLE

  const hip = result.landmarks[hipIdx]
  const knee = result.landmarks[kneeIdx]
  const ankle = result.landmarks[ankleIdx]

  if (!hip || !knee || !ankle) {
    return {
      angle: null,
      status: 'unavailable',
      hipConfidence: 0,
      kneeConfidence: 0,
      ankleConfidence: 0,
      reason: 'missing landmarks',
    }
  }

  return computeKneeAngle(
    { x: hip.x, y: hip.y, visibility: hip.visibility },
    { x: knee.x, y: knee.y, visibility: knee.visibility },
    { x: ankle.x, y: ankle.y, visibility: ankle.visibility },
    threshold,
  )
}
