import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import { CoachingPanel } from './components/CoachingPanel'
import { ConfidencePanel } from './components/ConfidencePanel'
import { DebugPanel } from './components/DebugPanel'
import { KneeAngleDisplay } from './components/KneeAngleDisplay'
import { PoseOverlay } from './components/PoseOverlay'
import { usePoseLoop } from './hooks/usePoseLoop'
import { CYCLING_LANDMARKS } from './lib/landmarks'
import { MeasurementBuffer } from './lib/measurement-buffer'

type InputMode = 'video' | 'camera'

const CONFIDENCE_THRESHOLD = 0.65
const STEP_INCREMENT = 1 / 30

const measurementBuffer = new MeasurementBuffer()

function App() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [inputMode, setInputMode] = useState<InputMode>('video')
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoDimensions, setVideoDimensions] = useState({ width: 640, height: 480 })
  const [activeSide, setActiveSide] = useState<'left' | 'right'>('left')
  const [, forceUpdate] = useState(0)
  const cameraStreamRef = useRef<MediaStream | null>(null)

  const {
    allPoses,
    landmarks,
    selectedPoseIndex,
    poseCount,
    kneeAngleLeft,
    kneeAngleRight,
    renderFps,
    inferenceFps,
    inferenceLatency,
    isModelLoaded,
    modelError,
    runSingleFrame,
    setSelectedPoseIndex,
  } = usePoseLoop(videoRef, isPlaying, CONFIDENCE_THRESHOLD)

  const kneeAngle = activeSide === 'left' ? kneeAngleLeft : kneeAngleRight
  const highlightIndices =
    activeSide === 'left'
      ? [CYCLING_LANDMARKS.LEFT_HIP, CYCLING_LANDMARKS.LEFT_KNEE, CYCLING_LANDMARKS.LEFT_ANKLE]
      : [CYCLING_LANDMARKS.RIGHT_HIP, CYCLING_LANDMARKS.RIGHT_KNEE, CYCLING_LANDMARKS.RIGHT_ANKLE]

  useEffect(() => {
    measurementBuffer.setVideoElement(videoRef.current)
  }, [videoRef.current])

  useEffect(() => {
    measurementBuffer.setSide(activeSide)
  }, [activeSide])

  useEffect(() => {
    if (!isPlaying) return
    const video = videoRef.current
    if (!video) return
    measurementBuffer.record(video.currentTime, kneeAngle)
  }, [kneeAngle, isPlaying])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setVideoSrc(url)
    setInputMode('video')
    stopCamera()
  }, [])

  const handleVideoMetadata = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    setVideoDimensions({ width: video.videoWidth, height: video.videoHeight })
  }, [])

  const handlePlay = useCallback(() => setIsPlaying(true), [])
  const handlePause = useCallback(() => {
    setIsPlaying(false)
    setTimeout(() => runSingleFrame(), 50)
    forceUpdate((n) => n + 1)
  }, [runSingleFrame])

  const stepFrame = useCallback(
    (direction: 1 | -1) => {
      const video = videoRef.current
      if (!video) return
      if (!video.paused) video.pause()
      video.currentTime = Math.max(0, video.currentTime + direction * STEP_INCREMENT)
      setTimeout(() => runSingleFrame(), 100)
    },
    [runSingleFrame],
  )

  function stopCamera() {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop())
      cameraStreamRef.current = null
    }
  }

  const startCamera = useCallback(async () => {
    stopCamera()
    if (videoSrc) {
      URL.revokeObjectURL(videoSrc)
      setVideoSrc(null)
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      cameraStreamRef.current = stream
      const video = videoRef.current
      if (video) {
        video.srcObject = stream
        video.play()
      }
      setInputMode('camera')
      setIsPlaying(true)
    } catch (err) {
      console.error('Camera access failed:', err)
    }
  }, [videoSrc])

  const stopCameraAndReset = useCallback(() => {
    stopCamera()
    const video = videoRef.current
    if (video) {
      video.srcObject = null
    }
    setIsPlaying(false)
    setInputMode('video')
  }, [])

  const handleClearBuffer = useCallback(() => {
    measurementBuffer.clear()
    forceUpdate((n) => n + 1)
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1>xCycleForm</h1>
        <div className="controls-bar">
          <label className="file-input-label">
            Load Video
            <input type="file" accept="video/*" onChange={handleFileSelect} />
          </label>
          {inputMode === 'camera' ? (
            <button type="button" onClick={stopCameraAndReset}>
              Stop Camera
            </button>
          ) : (
            <button type="button" onClick={startCamera}>
              Live Camera
            </button>
          )}
          <div className="side-toggle">
            <button
              type="button"
              className={activeSide === 'left' ? 'active' : ''}
              onClick={() => setActiveSide('left')}
            >
              Left
            </button>
            <button
              type="button"
              className={activeSide === 'right' ? 'active' : ''}
              onClick={() => setActiveSide('right')}
            >
              Right
            </button>
          </div>
          {poseCount > 1 && (
            <div className="person-toggle">
              {Array.from({ length: poseCount }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  className={selectedPoseIndex === i ? 'active' : ''}
                  onClick={() => setSelectedPoseIndex(i)}
                >
                  Person {i + 1}
                </button>
              ))}
            </div>
          )}
          <span className="model-status">
            {modelError
              ? `Model error: ${modelError}`
              : isModelLoaded
                ? 'Pose model ready'
                : 'Loading pose model...'}
          </span>
        </div>
      </header>

      <main className="app-main">
        <div className="video-section">
          <div
            ref={containerRef}
            className="video-container"
            style={{ aspectRatio: `${videoDimensions.width} / ${videoDimensions.height}` }}
          >
            <video
              ref={videoRef}
              onLoadedMetadata={handleVideoMetadata}
              onPlay={handlePlay}
              onPause={handlePause}
              controls={inputMode === 'video'}
              playsInline
              src={videoSrc ?? undefined}
            />
            <PoseOverlay
              allPoses={allPoses}
              selectedPoseIndex={selectedPoseIndex}
              width={videoDimensions.width}
              height={videoDimensions.height}
              confidenceThreshold={CONFIDENCE_THRESHOLD}
              highlightIndices={highlightIndices}
            />
          </div>
          {inputMode === 'video' && videoSrc && (
            <div className="frame-controls">
              <button type="button" onClick={() => stepFrame(-1)}>
                &larr; Prev Frame
              </button>
              <button type="button" onClick={() => stepFrame(1)}>
                Next Frame &rarr;
              </button>
            </div>
          )}
        </div>

        <aside className="panels">
          <KneeAngleDisplay
            result={kneeAngle}
            side={activeSide}
          />
          <CoachingPanel
            buffer={measurementBuffer}
            onClear={handleClearBuffer}
          />
          <ConfidencePanel landmarks={landmarks} confidenceThreshold={CONFIDENCE_THRESHOLD} />
          <DebugPanel
            videoTimestamp={videoRef.current?.currentTime ?? 0}
            renderFps={renderFps}
            inferenceFps={inferenceFps}
            inferenceLatency={inferenceLatency}
            landmarks={landmarks}
            kneeAngle={kneeAngle}
            side={activeSide}
          />
        </aside>
      </main>
    </div>
  )
}

export default App
