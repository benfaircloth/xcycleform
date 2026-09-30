import { useCallback, useEffect, useRef, useState } from 'react'
import type { PoseLandmark, PoseResult } from '../lib/pose-adapter'
import { detectForImage, detectPose, destroyPoseLandmarker, initPoseLandmarker } from '../lib/pose-adapter'
import { CYCLING_LANDMARKS } from '../lib/landmarks'
import { computeKneeAngle, type KneeAngleResult } from '../lib/geometry'
import type { PoseLandmarker } from '@mediapipe/tasks-vision'

export interface PoseLoopState {
  allPoses: PoseLandmark[][]
  landmarks: PoseLandmark[] | null
  selectedPoseIndex: number
  poseCount: number
  kneeAngleLeft: KneeAngleResult | null
  kneeAngleRight: KneeAngleResult | null
  renderFps: number
  inferenceFps: number
  inferenceLatency: number
  isModelLoaded: boolean
  modelError: string | null
}

const DEFAULT_STATE: PoseLoopState = {
  allPoses: [],
  landmarks: null,
  selectedPoseIndex: 0,
  poseCount: 0,
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
  const selectedIndexRef = useRef<number>(0)
  const renderFrameTimesRef = useRef<number[]>([])
  const inferenceFrameTimesRef = useRef<number[]>([])
  const processFrameRef = useRef<() => void>(() => {})

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

  const setSelectedPoseIndex = useCallback((index: number) => {
    selectedIndexRef.current = index
    setState((s) => {
      if (index >= s.poseCount || index < 0) return s
      const landmarks = s.allPoses[index] ?? null
      const selectedResult = landmarks ? { landmarks, worldLandmarks: [], timestampMs: 0, inferenceLatencyMs: 0 } : null
      return {
        ...s,
        selectedPoseIndex: index,
        landmarks,
        kneeAngleLeft: selectedResult ? computeKneeAngleFromResult(selectedResult, 'left', confidenceThreshold) : null,
        kneeAngleRight: selectedResult ? computeKneeAngleFromResult(selectedResult, 'right', confidenceThreshold) : null,
      }
    })
  }, [confidenceThreshold])

  useEffect(() => {
    processFrameRef.current = () => {
      const video = videoRef.current
      const landmarker = landmarkerRef.current
      if (!video || !landmarker || video.paused || video.ended) return

      const now = performance.now()
      renderFrameTimesRef.current.push(now)
      const oneSecAgo = now - 1000
      renderFrameTimesRef.current = renderFrameTimesRef.current.filter((t) => t > oneSecAgo)

      const currentTimeMs = Math.round(video.currentTime * 1000)

      if (currentTimeMs > lastTimestampRef.current && currentTimeMs > 0) {
        lastTimestampRef.current = currentTimeMs

        const results = detectPose(landmarker, video, currentTimeMs)

        inferenceFrameTimesRef.current.push(now)
        inferenceFrameTimesRef.current = inferenceFrameTimesRef.current.filter((t) => t > oneSecAgo)

        if (results.length > 0) {
          const allPoses = results.map((r) => r.landmarks)
          const selected = Math.min(selectedIndexRef.current, results.length - 1)
          const selectedResult = results[selected]

          const kneeAngleLeft = computeKneeAngleFromResult(selectedResult, 'left', confidenceThreshold)
          const kneeAngleRight = computeKneeAngleFromResult(selectedResult, 'right', confidenceThreshold)

          setState((s) => ({
            ...s,
            allPoses,
            poseCount: results.length,
            selectedPoseIndex: selected,
            landmarks: selectedResult.landmarks,
            kneeAngleLeft,
            kneeAngleRight,
            renderFps: renderFrameTimesRef.current.length,
            inferenceFps: inferenceFrameTimesRef.current.length,
            inferenceLatency: selectedResult.inferenceLatencyMs,
          }))
        } else {
          setState((s) => ({
            ...s,
            allPoses: [],
            poseCount: 0,
            landmarks: null,
            kneeAngleLeft: null,
            kneeAngleRight: null,
            renderFps: renderFrameTimesRef.current.length,
            inferenceFps: inferenceFrameTimesRef.current.length,
            inferenceLatency: 0,
          }))
        }
      }

      animFrameRef.current = requestAnimationFrame(() => processFrameRef.current())
    }
  }, [videoRef, confidenceThreshold])

  const runSingleFrame = useCallback(() => {
    const video = videoRef.current
    const landmarker = landmarkerRef.current
    if (!video || !landmarker) return

    const currentTimeMs = Math.round(video.currentTime * 1000)
    if (currentTimeMs <= 0) return

    const results = detectForImage(landmarker, video)
    // Reset so VIDEO mode resumes cleanly after the IMAGE mode switch
    lastTimestampRef.current = -1

    if (results.length > 0) {
      const allPoses = results.map((r) => r.landmarks)
      const selected = Math.min(selectedIndexRef.current, results.length - 1)
      const selectedResult = results[selected]

      const kneeAngleLeft = computeKneeAngleFromResult(selectedResult, 'left', confidenceThreshold)
      const kneeAngleRight = computeKneeAngleFromResult(selectedResult, 'right', confidenceThreshold)

      setState((s) => ({
        ...s,
        allPoses,
        poseCount: results.length,
        selectedPoseIndex: selected,
        landmarks: selectedResult.landmarks,
        kneeAngleLeft,
        kneeAngleRight,
        inferenceLatency: selectedResult.inferenceLatencyMs,
      }))
    } else {
      setState((s) => ({
        ...s,
        allPoses: [],
        poseCount: 0,
        landmarks: null,
        kneeAngleLeft: null,
        kneeAngleRight: null,
        inferenceLatency: 0,
      }))
    }
  }, [videoRef, confidenceThreshold])

  useEffect(() => {
    if (isPlaying && state.isModelLoaded) {
      animFrameRef.current = requestAnimationFrame(() => processFrameRef.current())
    }
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [isPlaying, state.isModelLoaded])

  useEffect(() => {
    return () => {
      destroyPoseLandmarker()
    }
  }, [])

  return { ...state, runSingleFrame, setSelectedPoseIndex }
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
