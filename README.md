# Altaïr Labs Microservice

> **Lab catalog and pedagogical content management with steps and hints**
> 

[![Cloud Run](https://img.shields.io/badge/deploy-Cloud%20Run-blue)](https://cloud.google.com/run)

[![Rust](https://img.shields.io/badge/rust-nightly-orange)](https://www.rust-lang.org)

[![PostgreSQL](336791)](https://www.postgresql.org)

---

## Description

The **Altaïr Labs Microservice** manages the catalog of cybersecurity labs and their pedagogical content. It stores lab metadata, step-by-step instructions, hints, and validation rules that power the learning experience.

This service provides CRUD operations for labs, steps, and hints, with role-based access control for creators and admins. It also exposes internal endpoints consumed by the Sessions microservice for runtime validation and scoring.

**Key capabilities:**

- Manage lab catalog (metadata, template paths, lab types)
- Define lab steps with validation rules and point values
- Create hints with cost penalties
- Provide internal endpoints for runtime validation
- Calculate maximum scores for labs
- Enforce ownership-based access control

---

## ⚠️ Security Notice

**This service trusts headers injected by the API Gateway.**

- Validates `x-altair-user-id` and `x-altair-roles` headers
- No JWT validation (relies on Gateway trust boundary)
- Public read access (GET endpoints)
- Owner or admin required for modifications
- Internal endpoints not authenticated (network isolation required)

**Deployment requirement:** Must be accessible only via authenticated Gateway.

---

## Architecture

```
┌─────────────┐       ┌──────────────┐       ┌─────────────────┐
│  Frontend   │──────▶│   Gateway    │──────▶│    Labs MS      │
│             │       │              │       │    (:3002)      │
└─────────────┘       └──────────────┘       └────────┬────────┘
                                                       │
                                                       ▼
                                               ┌───────────────┐
                                               │  PostgreSQL   │
                                               │    (Labs)     │
                                               └───────────────┘
                                                 labs
                                                 lab_steps
                                                 lab_hints

┌─────────────────┐
│  Sessions MS    │──── Internal Endpoints ────▶│    Labs MS      │
│                 │                              │    (:3002)      │
└─────────────────┘                              └─────────────────┘
  Validation                                      Steps & scoring
  Scoring
```

### Service Flow

1. **Creator creates lab** → Defines metadata, template_path, lab_type
2. **Creator adds steps** → Defines instructions, questions, validation rules, points
3. **Creator adds hints** → Defines hint text and cost penalties
4. **Learner views lab** → Fetches metadata and steps
5. **Sessions MS validates answers** → Calls internal endpoints for validation
6. **Sessions MS calculates score** → Sums points from all steps

---

## Tech Stack

| Component | Technology | Purpose |
| --- | --- | --- |
| **Language** | Rust (nightly) | High-performance async runtime |
| **HTTP Framework** | Axum | HTTP routing and middleware |
| **Async Runtime** | Tokio | Async I/O and concurrency |
| **Database** | PostgreSQL | Lab and content persistence |
| **DB Client** | SQLx | Compile-time checked queries |
| **Logging** | tracing + EnvFilter | Structured logging |
| **CI/CD** | GitHub Actions | fmt, clippy, tests |
| **Deployment** | Google Cloud Run | Serverless auto-scaling |

---

## Requirements

### Development

- **Rust** nightly toolchain
- **Docker** & Docker Compose
- **PostgreSQL** 14+ (via `docker compose up postgres`)

### Production (Cloud Run)

- **DATABASE_URL** environment variable (PostgreSQL connection string)
- **PORT** environment variable (default: `3002`)

### Environment Variables

```bash
# Database (required)
DATABASE_URL=postgresql://altair:altair@localhost:5432/altair_labs_db

# Server configuration
PORT=3002                                       # Server port (default: 3002)
RUST_LOG=info                                   # Log level filter
```

**⚠️ Database Port Note:** If using `altair-infra` Docker Compose, the Labs database is on port `5432` (default PostgreSQL port).

---

## Installation

### 0. Start infrastructure (database required)

```bash
cd ../altair-infra
docker compose up postgres
```

### 1. Build the Docker image (ONLY if code changed)

**Build only if:**

- You modified the labs code
- You modified the Dockerfile
- First run on a new machine

```bash
cd altair-labs-ms
docker build -t altair-labs-ms .
```

### 2. Run the service

```bash
docker run --rm -it \
  --network altair-infra_default \
  -p 3002:3002 \
  --env-file .env \
  --name altair-labs-ms \
  altair-labs-ms
```

**Note:** The service is designed to be destroyed when the terminal closes. Rebuild is necessary for code changes.

---

## Usage

### API Endpoints

#### **GET /health**

Health check for liveness/readiness probes.

**Response:**

```json
{
  "status": "labs ok"
}
```

---

### Public Endpoints (No Auth Required)

#### **GET /labs**

List all labs.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "lab_id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "CTF Terminal - PATH Hijacking",
      "description": "Learn PATH hijacking via cron jobs",
      "difficulty": "easy",
      "lab_type": "ctf_terminal_guided",
      "template_path": "europe-west9-docker.pkg.dev/.../ctf-terminal:v1",
      "estimated_duration": "25min",
      "creator_id": "..."
    }
  ]
}
```

**⚠️ Note:** Response excludes `category`, `objectives`, `story`, `prerequisites` (stored in DB but not exposed).

---

#### **GET /labs/:id**

Get lab details by ID.

**Response:**

```json
{
  "success": true,
  "data": {
    "lab_id": "...",
    "name": "CTF Terminal - PATH Hijacking",
    "description": "...",
    "difficulty": "easy",
    "lab_type": "ctf_terminal_guided",
    "template_path": "...",
    "estimated_duration": "25min",
    "creator_id": "..."
  }
}
```

---

#### **GET /labs/:id/steps**

List all steps for a lab (public access).

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "step_id": "...",
      "lab_id": "...",
      "step_number": 1,
      "title": "Reconnaissance",
      "description": "Explore the environment",
      "question": "What cron job did you find?",
      "points": 10,
      "created_at": "..."
    }
  ]
}
```

**⚠️ Security Note:** Does NOT expose `expected_answer`, `validation_type`, `validation_pattern` (use internal endpoint for validation).

---

#### **GET /labs/:id/steps/:step_id/hints**

List all hints for a specific step.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "hint_id": "...",
      "step_id": "...",
      "hint_number": 1,
      "cost": 5,
      "text": "Check /etc/cron.d/ for scheduled tasks",
      "created_at": "..."
    }
  ]
}
```

---

### Protected Endpoints (Owner or Admin Only)

**Headers (injected by Gateway):**

- `x-altair-user-id` (required, UUID) – Caller's internal user ID
- `x-altair-roles` (optional, CSV) – Comma-separated role list

**Authorization:**

- ✅ Allow if `admin` role present
- ✅ Allow if `caller.user_id == lab.creator_id`
- ❌ Otherwise return `403 Forbidden`

---

#### **POST /labs**

Create a new lab.

**Request:**

```json
{
  "name": "CTF Terminal - PATH Hijacking",
  "description": "Learn PATH hijacking via cron jobs",
  "difficulty": "easy",
  "lab_type": "ctf_terminal_guided",
  "template_path": "europe-west9-docker.pkg.dev/.../ctf-terminal:v1",
  "estimated_duration": "25min"
}
```

**Validations:**

- `name` must be ≥ 3 characters
- `template_path` must not be empty
- `difficulty` must be one of: `easy`, `medium`, `hard`
- `lab_type` defaults to `ctf_terminal_guided` if not provided
- `creator_id` extracted from `x-altair-user-id` header

**Response:**

```json
{
  "success": true,
  "data": {
    "lab_id": "...",
    "name": "...",
    "creator_id": "...",
    "created_at": "..."
  }
}
```

---

#### **PUT /labs/:id**

Update a lab.

**Authorization:** Owner or admin only.

**Request:**

```json
{
  "name": "Updated Lab Name",
  "description": "Updated description",
  "difficulty": "medium"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "lab_id": "...",
    "name": "Updated Lab Name",
    "...": "..."
  }
}
```

---

#### **DELETE /labs/:id**

Delete a lab.

**Authorization:** Owner or admin only.

**Response:**

```json
{
  "success": true,
  "data": {
    "deleted": true
  }
}
```

---

#### **POST /labs/:id/steps**

Add a step to a lab.

**Authorization:** Owner or admin only.

**Request:**

```json
{
  "step_number": 1,
  "title": "Reconnaissance",
  "description": "Explore the environment",
  "question": "What cron job did you find?",
  "expected_answer": "/opt/backup.sh",
  "validation_type": "exact_match",
  "points": 10
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "step_id": "...",
    "lab_id": "...",
    "step_number": 1,
    "title": "...",
    "points": 10
  }
}
```

**Error (409 Conflict):**

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Step number already exists"
  }
}
```

---

#### **PUT /labs/:id/steps/:step_id**

Update a step.

**Authorization:** Owner or admin only.

**Request:**

```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "points": 15
}
```

---

#### **DELETE /labs/:id/steps/:step_id**

Delete a step.

**Authorization:** Owner or admin only.

**Response:**

```json
{
  "success": true,
  "data": {
    "deleted": true
  }
}
```

---

#### **POST /labs/:id/steps/:step_id/hints**

Add a hint to a step.

**Authorization:** Owner or admin only.

**Request:**

```json
{
  "hint_number": 1,
  "cost": 5,
  "text": "Check /etc/cron.d/ for scheduled tasks"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "hint_id": "...",
    "step_id": "...",
    "hint_number": 1,
    "cost": 5,
    "text": "..."
  }
}
```

---

#### **PUT /labs/:id/steps/:step_id/hints/:hint_id**

Update a hint.

**Authorization:** Owner or admin only.

---

#### **DELETE /labs/:id/steps/:step_id/hints/:hint_id**

Delete a hint.

**Authorization:** Owner or admin only.

---

### Internal Endpoints (for Sessions MS)

**⚠️ Security Notice:** These endpoints are NOT authenticated. Must be protected by network isolation (internal-only routing).

#### **GET /internal/labs/:id/steps**

Get steps with points for score calculation.

**Used by:** Sessions MS to calculate `max_score`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "step_number": 1,
      "points": 10
    },
    {
      "step_number": 2,
      "points": 15
    }
  ]
}
```

---

#### **GET /internal/labs/:id/steps/runtime**

Get runtime step data (without validation answers).

**Used by:** Sessions MS to display steps to learner

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "step_id": "...",
      "step_number": 1,
      "title": "Reconnaissance",
      "description": "Explore the environment",
      "question": "What cron job did you find?",
      "points": 10
    }
  ]
}
```

**⚠️ Note:** Does NOT expose `expected_answer` or validation rules (prevents cheating).

---

#### **GET /internal/labs/:id/steps/:step_number**

Get step validation data.

**Used by:** Sessions MS to validate learner answers

**Response:**

```json
{
  "success": true,
  "data": {
    "expected_answer": "/opt/backup.sh",
    "validation_type": "exact_match",
    "validation_pattern": null,
    "points": 10
  }
}
```

**Validation Types:**

- `exact_match` – Compare to `expected_answer`
- `contains` – Check if answer contains `validation_pattern`
- `regex` – Match `validation_pattern` as regex

---

## Database Schema

### `labs` Table

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `lab_id` | UUID | PRIMARY KEY | Lab identifier |
| `creator_id` | UUID | NOT NULL | Lab creator |
| `name` | TEXT | NOT NULL | Lab name |
| `description` | TEXT | NULLABLE | Lab description |
| `difficulty` | TEXT | NOT NULL | Difficulty (easy/medium/hard) |
| `category` | TEXT | NULLABLE | Category (not exposed in API) |
| `lab_type` | TEXT | NOT NULL | Lab type (ctf_terminal_guided, etc.) |
| `template_path` | TEXT | NOT NULL | Docker image path for runtime |
| `objectives` | TEXT | NULLABLE | Learning objectives (not exposed) |
| `prerequisites` | TEXT | NULLABLE | Prerequisites (not exposed) |
| `story` | TEXT | NULLABLE | Lab narrative (not exposed) |
| `estimated_duration` | TEXT | NULLABLE | Estimated time |
| `created_at` | TIMESTAMP | NOT NULL | Creation timestamp |

---

### `lab_steps` Table

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `step_id` | UUID | PRIMARY KEY | Step identifier |
| `lab_id` | UUID | NOT NULL, FK | Lab identifier |
| `step_number` | INT | NOT NULL | Step sequence number |
| `title` | TEXT | NOT NULL | Step title |
| `description` | TEXT | NOT NULL | Step instructions |
| `question` | TEXT | NOT NULL | Question to answer |
| `expected_answer` | TEXT | NOT NULL | Correct answer |
| `validation_type` | TEXT | NOT NULL | Validation method |
| `validation_pattern` | TEXT | NULLABLE | Regex or contains pattern |
| `points` | INT | NOT NULL | Points for completion |
| `created_at` | TIMESTAMP | NOT NULL | Creation timestamp |

**Constraints:**

- `(lab_id, step_number)` – UNIQUE (constraint name: `lab_steps_lab_id_step_number_key`)

---

### `lab_hints` Table

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `hint_id` | UUID | PRIMARY KEY | Hint identifier |
| `step_id` | UUID | NOT NULL, FK | Step identifier |
| `hint_number` | INT | NOT NULL | Hint sequence number |
| `cost` | INT | NOT NULL | Score penalty |
| `text` | TEXT | NOT NULL | Hint text |
| `created_at` | TIMESTAMP | NOT NULL | Creation timestamp |

**Constraints:**

- `(step_id, hint_number)` – UNIQUE (constraint name: `lab_hints_step_id_hint_number_key`)

---

## Project Structure

```
altair-labs-ms/
├── Cargo.toml                    # Rust dependencies
├── Dockerfile                    # Multi-stage build
├── .env                          # Environment variables
└── src/
    ├── main.rs                  # Server bootstrap, CORS, routes
    ├── state.rs                 # AppState (DB pool + services)
    ├── error.rs                 # AppError type
    ├── routes/
    │   ├── mod.rs              # Route declarations
    │   ├── health.rs           # Health check endpoint
    │   ├── labs.rs             # Lab CRUD endpoints
    │   ├── lab_steps.rs        # Step CRUD + internal endpoints
    │   ├── lab_hints.rs        # Hint CRUD endpoints
    │   └── metrics.rs          # Metrics (not mounted)
    ├── services/
    │   ├── labs_service.rs     # Lab logic
    │   ├── lab_steps_service.rs # Step logic
    │   └── lab_hints_service.rs # Hint logic
    ├── models/
    │   ├── lab.rs              # Lab data models
    │   ├── lab_step.rs         # Step data models
    │   ├── lab_hint.rs         # Hint data models
    │   ├── api.rs              # API response wrappers
    │   └── auth.rs             # Auth models (legacy)
    └── tests/
        └── *.rs                # Unit tests
```

---

## Deployment (Google Cloud Run)

The service is containerized and deployed to **Google Cloud Run** as an internal service.

### Container Configuration

- Listens on port `3002` (configurable via `PORT` env variable)
- Multi-stage Docker build optimizes image size
- Rust nightly toolchain for compilation

**⚠️ Dockerfile Issue:** Exposes port `3001` but service listens on `3002` (inconsistency).

### Runtime Requirements

- `DATABASE_URL` environment variable (Cloud SQL or external PostgreSQL)
- Must be deployed in **private network** (no public access)
- Internal endpoints should not be exposed publicly (network isolation required)

### Service Account Permissions

The Cloud Run service account requires:

- Network access to Cloud SQL (or external PostgreSQL)
- No special GCP API permissions required

### Scaling

- Auto-scales based on request load
- Cold start optimized with Rust's fast startup time
- Stateless design enables horizontal scaling

---

## Known Issues & Limitations

### 🔴 Critical Issues

- **routes/[mod.rs](http://mod.rs) syntax errors** – Multiple routes have incorrect syntax (extra commas/parentheses) preventing compilation
- **Dockerfile port mismatch** – Exposes `3001` but listens on `3002`
- **Dockerfile .env copy** – Attempts to `COPY .env` but file not included in zip

### 🟡 Operational Gaps

- **Metrics endpoint not mounted** – [`metrics.rs`](http://metrics.rs) exists but not exposed in router
- **Internal endpoints not authenticated** – Rely on network isolation only
- **Limited API exposure** – Many DB fields (category, objectives, story) not exposed in API
- **Two auth patterns coexist** – Old `extensions` pattern + new header pattern

### 🟡 Business Logic Limitations

- **No cascade deletes** – Deleting lab doesn't automatically delete steps/hints
- **No step reordering** – Cannot easily renumber steps
- **No validation** – Can create steps with invalid validation_type
- **No template validation** – template_path not checked against registry

---

## TODO / Roadmap

### High Priority (MVP → Production)

- [ ]  **Fix routes/[mod.rs](http://mod.rs) syntax** (compilation blocker)
- [ ]  **Fix Dockerfile issues** (port mismatch, .env copy)
- [ ]  **Mount metrics endpoint** (expose metrics for monitoring)
- [ ]  **Add cascade deletes** (clean up steps/hints on lab deletion)

### Medium Priority (Production Hardening)

- [ ]  **Expose full lab data** (category, objectives, story in API)
- [ ]  **Add validation** (check validation_type enum, template_path format)
- [ ]  **Add step reordering** (helper endpoints to renumber steps)
- [ ]  **Authenticate internal endpoints** (shared secret or network ACLs)

### Low Priority (Future Enhancements)

- [ ]  **Add lab templates** (pre-defined lab structures)
- [ ]  **Add version control** (track lab content changes)
- [ ]  **Add tags/categories** (better lab organization)
- [ ]  **Add difficulty scoring** (auto-calculate based on steps)

---

## Project Status

**⚠️ Current Status: MVP (Compilation Issues)**

This microservice is **functional for MVP deployment** after fixing critical syntax errors. Core lab catalog and content management is operational once built successfully.

**Known limitations to address for production:**

1. Fix routes/[mod.rs](http://mod.rs) syntax errors (blocker)
2. Fix Dockerfile port and .env issues
3. Mount metrics endpoint
4. Add cascade delete operations
5. Authenticate internal endpoints
6. Expose full lab metadata in API

**Maintainers:** Altaïr Platform Team

---

## Notes

- **Port 3002** – Default port, exposed in Dockerfile (with port mismatch issue)
- **Metadata only** – This service exposes lab content, not runtime environments
- **Trust model** – Relies on Gateway for authentication
- **Internal endpoints** – Sessions MS is the primary consumer
- **Public reads** – All GET endpoints are public (no auth required)

---

## License

Internal Altaïr Platform Service – Not licensed for external use.
