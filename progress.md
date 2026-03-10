# Frontend Progress

Branch: `feature/poc-lab`

This file tracks the frontend work applied on the learner lab flow and should be updated after each relevant modification.

## Scope

The work is focused on the real learner lab experience in:

- `src/pages/learner/LabView.tsx`
- `src/pages/learner/LabSession.tsx`
- `src/components/labs/LabInstructions.tsx`
- `src/api/labs.ts`
- `src/api/sessions.ts`
- `src/contracts/labs.ts`

The goal is to move the learner flow away from placeholder logic and align it with the real backend services.

## Changes Applied So Far

### 1. Lab briefing has been enriched

`LabView` now displays the expected briefing information from backend data:

- `story`
- `estimated duration`
- `objectives`

Notes:

- `estimated duration` remains in its dedicated metadata area at the top of the page
- the `Briefing` block now focuses on:
  - `Story`
  - `Objectives`

### 2. Lab contracts have been extended

The frontend `Lab` contract now supports the narrative fields exposed by `labs-ms`:

- `category`
- `story`
- `objectives`
- `prerequisites`

This allows the learner pages to render the richer lab payload returned by the backend.

### 3. Real session APIs have been added to the frontend

Session-related frontend API helpers now include:

- `SessionSummary`
- `SessionProgress`
- `getSessionProgress`
- `validateSessionStep`
- `requestSessionHint`

`startLab()` now returns a typed session summary instead of a minimal inline shape.

### 4. Learner lab validation now uses the backend

The learner lab session page no longer validates answers with frontend-only comparison logic.

It now calls the backend through:

- `POST /sessions/sessions/:id/validate-step`
- `POST /sessions/sessions/:id/request-hint`
- `GET /sessions/sessions/:id/progress`

This means:

- answer validation is now backend-driven
- score progression is backend-driven
- current step progression is backend-driven

### 5. Step validation data is no longer shown in the learner UI

The learner UI no longer displays validation-sensitive content such as:

- expected answers
- local solution text

The page only renders the pedagogical content needed by the learner.

### 6. Step UI now includes scoring and hint cost integration

The learner step panel now shows:

- step points
- accumulated hint penalty
- current effective step score
- global score
- unlocked step progression

Hints are now treated as score-reducing actions rather than plain text helpers.

### 7. Hints are now hidden by default

Hints are displayed through a collapsible panel:

- hidden by default
- expandable on demand
- each revealed hint shows its cost

This makes the learner UI cleaner and keeps the help flow intentional.

### 8. Validation form appears only when a step requires validation

The answer input and validation button are no longer always shown.

They now appear only when the current step is marked as requiring validation.

This is driven by the step payload through `has_validation`.

### 9. Real steps and hints are loaded from backend data

`LabSession` now loads:

- lab details from `labs-ms`
- steps from `labs-ms`
- hints per step from `labs-ms`
- session progress from `sessions-ms`

This replaces the earlier local-only learner logic for the real flow.

### 10. Session resume logic has been tightened

The frontend now reuses a stored session only if it is still usable:

- `created`
- `running`
- or already has a `webshell_url`

Otherwise the stored session id is cleared and a fresh start request is made.

This avoids reusing stale or invalid sessions.

### 11. React hook order issue has been fixed

`LabSession` previously triggered a route-level crash because memoized values were declared after conditional returns.

This has been corrected by ensuring all hooks remain declared before conditional rendering branches.

### 12. Session progress resume bug was identified and fixed at backend level

Issue observed:

- after page reload, the UI looked reset
- but hints could not be requested again

Root cause:

- `sessions-ms` persisted `hints_used`
- but did not expose it in the public session progress response

Fix applied:

- `LabProgress` now exposes `hints_used`
- the backend converts the stored JSON state to `Vec<String>`

Impact:

- the frontend can rebuild revealed hints after reload
- visual state and backend persisted state are aligned again

### 13. Hint cost scoring logic has been corrected

The scoring model has been aligned with the intended learner experience.

Previous issue:

- using a hint could still allow the learner to receive the full step score

Fix applied in backend:

- hint usage remains persisted immediately
- but hint cost is now applied when the step is validated
- awarded points are now computed as:
  - `max(step_points - total_hint_cost, 0)`

Result:

- hint penalties are applied exactly once
- step reward is reduced consistently based on consumed hints

### 14. Session exit behavior is now explicit

The learner session header now supports two distinct exit flows:

- `End`
  - stops the backend session
  - stops the pod/runtime through the session backend flow
  - clears the locally stored session id
  - returns to the dashboard

- `Resume Later`
  - does not stop the backend session
  - keeps the locally stored session id
  - returns to the dashboard so the learner can come back later

This removes ambiguity between:

- leaving temporarily
- ending the session for real

## Current Known State

### Frontend files in active modification set

- `src/api/labs.ts`
- `src/api/sessions.ts`
- `src/contracts/labs.ts`
- `src/components/labs/LabInstructions.tsx`
- `src/pages/learner/LabView.tsx`
- `src/pages/learner/LabSession.tsx`

### Backend dependency required for correct frontend resume

The frontend now depends on `sessions-ms` exposing:

- `current_step`
- `completed_steps`
- `score`
- `max_score`
- `hints_used`

for consistent learner reload behavior.

## Validation Status

What has been checked:

- `git diff --check` on the modified frontend files
- `cargo check` on `altair-sessions-ms` after exposing `hints_used`

Known repository-wide limitation:

- the full `altair-frontend` typecheck still fails because of unrelated pre-existing errors outside the learner lab files

## Next Updates

This file should be updated when new frontend work is added on this branch, especially for:

- learner session stop flow
- completed session UI
- hybrid web/terminal lab rendering
- backend-driven session completion flow
- stronger progress restore UX
