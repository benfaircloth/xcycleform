# xCycleForm

Camera-based cycling biomechanics coach. Phase-gated product demo of deterministic measurement + evidence-backed SeekrFlow coaching.

## Local development

```bash
npm install
npm run dev       # start dev server
npm test          # run test suite
npm run lint      # oxlint + tsc type checking
npm run build     # production build
```

## External dependencies

The MediaPipe Pose Landmarker WASM runtime and model file are loaded from remote CDNs at runtime:

- WASM: `cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm`
- Model: `storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`

An internet connection is required for pose estimation to function. The model is cached by the browser after first load.

## Current phase

**Phase 0: Visual Pipeline Validation.** See `docs/PROJECT_STATE.md` for authorization status and `docs/PHASE_PLAN.md` for scope.
