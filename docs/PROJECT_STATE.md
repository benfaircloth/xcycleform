# Project State

This file is the human-controlled phase gate.

## Authorized phase

`PHASE_0`

## Status

`AUTHORIZED`

## Rule

Claude may implement only the authorized phase above. Passing the phase's tests does **not** authorize changing this file or beginning the next phase.

Only a human reviewer may update `Authorized phase`.

## Current human notes

- Working name: xCycleForm.
- Initial deployment target: browser/PWA on a phone positioned side-on to a cyclist on an indoor trainer.
- Raw pose/video data should remain local by default.
- SeekrFlow enters only in Phase 5 after the deterministic Session Evidence Package is validated.
- Phase 0 redefined: Visual Pipeline Validation. Full pose-to-measurement loop with prerecorded video first, then live camera. Knee extension angle as the validation metric. See updated PHASE_0 spec.
