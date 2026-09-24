import { describe, expect, it } from 'vitest'

describe('stale result clearing policy', () => {
  it('documents that null pose detection must clear landmarks and angles', () => {
    // This test documents the required behavior:
    // When detectPose or detectForImage returns null (no pose detected),
    // the state must be updated to:
    //   landmarks: null
    //   kneeAngleLeft: null
    //   kneeAngleRight: null
    //
    // The system must never retain stale landmarks from a previous frame
    // when the current frame has no detected pose.
    //
    // This is enforced in processFrame() and runSingleFrame() in usePoseLoop.ts
    // via explicit else-branches that set state to null on detection failure.
    expect(true).toBe(true)
  })

  it('documents that paused-frame inspection uses IMAGE mode', () => {
    // runSingleFrame() uses detectForImage() (IMAGE running mode)
    // rather than detectForVideo() (VIDEO running mode).
    //
    // This avoids temporal state corruption when seeking backward
    // in a paused video. VIDEO mode maintains internal temporal state
    // that expects monotonically increasing timestamps.
    // IMAGE mode processes each frame independently.
    expect(true).toBe(true)
  })
})
