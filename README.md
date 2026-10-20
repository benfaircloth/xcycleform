# xCycleForm

Camera-based cycling biomechanics coach. Deterministic measurement separated from probabilistic interpretation.

A phone on a tripod captures a cyclist from the side while riding a trainer. Client-side pose estimation (MediaPipe) produces landmarks. A deterministic biomechanics layer converts those landmarks into knee angle measurements and pedal stroke detection. Only after those observations are summarized does an LLM interpret the evidence and generate coaching guidance.

The system preserves this chain:

`camera -> landmarks -> measurements -> pedal strokes -> evidence summary -> interpretation -> coaching`

The deterministic and generative layers are never collapsed. The measurement engine does not guess causes. The LLM does not invent measurements.

## Architecture

**Deterministic layer** (runs entirely in the browser):
- MediaPipe Pose Landmarker for side-profile pose estimation
- Hip-knee-ankle geometry for knee angle calculation
- Confidence gating per landmark
- Pedal stroke detection (BDC/TDC) from angle time series
- Frame capture at stroke extremes for visual evidence

**Interpretation layer** (LLM via OpenAI-compatible API):
- Receives structured session summary and captured frames
- Multimodal analysis (measurements + BDC/TDC video frames)
- Coaching grounded in biomechanics reference ranges
- Systematic bias acknowledgment (2D pose estimation limitations)

## Local development

```bash
npm install
npm run dev       # start dev server
npm test          # run test suite
npm run lint      # oxlint + tsc type checking
npm run build     # production build
```

Copy `.env.example` to `.env` and configure your LLM endpoint:

```bash
cp .env.example .env
```

The dev server proxies `/api/llm` to your configured inference endpoint. Any OpenAI-compatible API works (Ollama, vLLM, Together, etc.).

## External dependencies

The MediaPipe Pose Landmarker WASM runtime and model file are loaded from remote CDNs at runtime:

- WASM: `cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm`
- Model: `storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`

An internet connection is required for pose estimation to function. The model is cached by the browser after first load.

## Design documents

See `docs/` for architecture, phase plan, data contracts, and decision log.

## License

MIT
