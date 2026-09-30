import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision'

export interface PoseLandmark {
  x: number
  y: number
  z: number
  visibility: number
}

export interface PoseResult {
  landmarks: PoseLandmark[]
  worldLandmarks: PoseLandmark[]
  timestampMs: number
  inferenceLatencyMs: number
}

let landmarkerInstance: PoseLandmarker | null = null
let initPromise: Promise<PoseLandmarker> | null = null

export async function initPoseLandmarker(): Promise<PoseLandmarker> {
  if (landmarkerInstance) return landmarkerInstance
  if (initPromise) return initPromise

  initPromise = (async () => {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
    )

    const landmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numPoses: 2,
    })

    landmarkerInstance = landmarker
    return landmarker
  })()

  return initPromise
}

export function detectPose(
  landmarker: PoseLandmarker,
  videoElement: HTMLVideoElement,
  timestampMs: number,
): PoseResult[] {
  const start = performance.now()

  const result = landmarker.detectForVideo(videoElement, timestampMs)

  const inferenceLatencyMs = performance.now() - start

  if (!result.landmarks || result.landmarks.length === 0) {
    return []
  }

  return result.landmarks.map((lms, i) => ({
    landmarks: lms.map((lm) => ({
      x: lm.x,
      y: lm.y,
      z: lm.z,
      visibility: lm.visibility ?? 0,
    })),
    worldLandmarks:
      result.worldLandmarks?.[i]?.map((lm) => ({
        x: lm.x,
        y: lm.y,
        z: lm.z,
        visibility: lm.visibility ?? 0,
      })) ?? [],
    timestampMs,
    inferenceLatencyMs,
  }))
}

/**
 * Detect pose on a single frame using IMAGE mode.
 * Safe for paused-frame inspection: no temporal state, works after backward seeks.
 */
export function detectForImage(
  landmarker: PoseLandmarker,
  videoElement: HTMLVideoElement,
): PoseResult[] {
  const start = performance.now()

  landmarker.setOptions({ runningMode: 'IMAGE', numPoses: 2 })
  const result = landmarker.detect(videoElement)
  landmarker.setOptions({ runningMode: 'VIDEO', numPoses: 2 })

  const inferenceLatencyMs = performance.now() - start

  if (!result.landmarks || result.landmarks.length === 0) {
    return []
  }

  return result.landmarks.map((lms, i) => ({
    landmarks: lms.map((lm) => ({
      x: lm.x,
      y: lm.y,
      z: lm.z,
      visibility: lm.visibility ?? 0,
    })),
    worldLandmarks:
      result.worldLandmarks?.[i]?.map((lm) => ({
        x: lm.x,
        y: lm.y,
        z: lm.z,
        visibility: lm.visibility ?? 0,
      })) ?? [],
    timestampMs: videoElement.currentTime * 1000,
    inferenceLatencyMs,
  }))
}

export function destroyPoseLandmarker(): void {
  if (landmarkerInstance) {
    landmarkerInstance.close()
    landmarkerInstance = null
    initPromise = null
  }
}
