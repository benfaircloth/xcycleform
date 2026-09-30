const CAPTURE_WIDTH = 512

let offscreenCanvas: HTMLCanvasElement | null = null
let offscreenCtx: CanvasRenderingContext2D | null = null

export function captureFrame(video: HTMLVideoElement): string | null {
  if (video.videoWidth === 0 || video.videoHeight === 0) return null

  const aspect = video.videoHeight / video.videoWidth
  const w = CAPTURE_WIDTH
  const h = Math.round(w * aspect)

  if (!offscreenCanvas) {
    offscreenCanvas = document.createElement('canvas')
  }
  offscreenCanvas.width = w
  offscreenCanvas.height = h

  if (!offscreenCtx) {
    offscreenCtx = offscreenCanvas.getContext('2d')
  }
  if (!offscreenCtx) return null

  offscreenCtx.drawImage(video, 0, 0, w, h)
  return offscreenCanvas.toDataURL('image/jpeg', 0.7)
}
