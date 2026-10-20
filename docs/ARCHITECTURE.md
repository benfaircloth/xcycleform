# Architecture

## 1. System boundary

### Client / edge

```text
Camera
  -> Pose estimator
  -> Landmark quality checks
  -> Measurement engine
  -> Temporal analysis
  -> Local session store
  -> Session Evidence Package
```

Responsibilities:
- camera capture;
- on-device pose estimation;
- skeleton rendering;
- deterministic geometry;
- measurement validity/confidence;
- temporal drift/event detection;
- local high-volume session data;
- evidence-package generation.

### LLM / cloud reasoning

```text
Session Evidence Package
   + curated biomechanics evidence
   + permitted session history (later phase)
            -> reasoning / retrieval
            -> structured coaching response
            -> evidence attribution
```

Responsibilities:
- interpret observed events;
- retrieve relevant supporting material;
- qualify applicability;
- propose proportionate coaching actions;
- expose evidence/context attribution;
- abstain when evidence is insufficient.

## 2. Boundary principle

The client owns **measurement truth**. The LLM owns **interpretation under evidence**.

The LLM must never be asked to infer a numeric knee angle from prose if the deterministic system can calculate it. Conversely, the deterministic engine must never encode a causal explanation such as “fatigue” merely because a metric drifted.

## 3. Internal client modules

Suggested conceptual modules; names may vary with the repository.

### CameraController
- permission lifecycle;
- stream management;
- resolution/orientation;
- device failure handling.

### PoseAdapter
- wraps MediaPipe implementation details;
- emits normalized pose frames;
- retains landmark confidence/visibility;
- isolates third-party API changes from the domain layer.

### PoseOverlay
- renders skeleton/landmarks;
- never owns measurement math.

### MeasurementEngine
- pure or near-pure deterministic functions;
- accepts a pose frame + configuration;
- returns typed measurements with validity/confidence.

### QualityEngine
- evaluates whether required landmarks/setup support reliable measurement;
- may flag poor camera framing, pose loss, occlusion, or geometry concerns;
- does not claim biomechanical correctness.

### TemporalAnalyzer
- consumes time-series measurements;
- identifies sustained deviations and event windows;
- no causal interpretation.

### SessionStore
- local persistence for MVP;
- stores session metadata, measurements at an appropriate resolution, events, and optional replay data;
- raw video storage is out of scope unless separately approved.

### EvidenceBuilder
- converts a completed local session into the canonical Session Evidence Package;
- deterministic;
- schema validated.

### CoachingClient
- Phase 5+ only;
- sends evidence package to the inference endpoint;
- validates structured response;
- handles errors and abstentions.

## 4. Provenance model

Every coaching claim should be traceable backward:

```text
Coaching recommendation
  -> interpretation
  -> retrieved reference(s)
  -> observed event(s)
  -> derived metric(s)
  -> source landmarks / quality
```

Do not promise perfect causal provenance. The goal is an inspectable evidence chain that distinguishes inputs, retrieved context, model reasoning products, and deterministic observations.

## 5. Data-volume strategy

Keep high-frequency raw data local.

Initial cloud payload should normally contain:
- session metadata;
- quality summary;
- metric distributions / summary statistics;
- baseline definitions;
- observed events;
- limited representative samples around events when useful.

Do not default to uploading:
- raw video;
- every camera frame;
- the entire 30 FPS landmark stream.

## 6. Real-time UX principle

During a ride, prioritize:
- tracking quality;
- confidence;
- simple measurement visibility;
- material deviations.

Avoid aggressive real-time “good/bad” fit judgments. Rich interpretation belongs in the post-session experience until validated otherwise.

## 7. Failure is a first-class state

Represent and surface:
- camera unavailable;
- model unavailable;
- landmark occlusion;
- low confidence;
- insufficient setup quality;
- insufficient evidence for interpretation;
- inference endpoint / network failure;
- retrieved evidence not applicable enough to support a recommendation.

Do not silently replace missing evidence with generated certainty.
