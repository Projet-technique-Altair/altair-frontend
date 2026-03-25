# Altaïr Frontend

> **React SPA for the Altaïr learning platform with Keycloak SSO and role-based navigation**
> 

[![Vite](https://img.shields.io/badge/vite-5.x-646CFF)](https://vitejs.dev)

[![React](https://img.shields.io/badge/react-18.x-61DAFB)](https://react.dev)

[![TypeScript](https://img.shields.io/badge/typescript-5.x-3178C6)](https://www.typescriptlang.org)

[![Tailwind CSS](https://img.shields.io/badge/tailwind-3.x-06B6D4)](https://tailwindcss.com)

---

## Description

The **Altaïr Frontend** is a React-based single-page application (SPA) that provides the user interface for the Altaïr cybersecurity learning platform. It features Keycloak SSO authentication with PKCE, role-based navigation, and interactive components for learners, creators, and administrators.

This application communicates with backend microservices via the API Gateway and provides distinct experiences based on user roles (Learner, Creator, Admin).

**Key capabilities:**

- Keycloak SSO with Authorization Code + PKCE flow
- Role-based routing (Learner, Creator, Admin dashboards)
- Lab browsing and session management
- Starpath visualization with interactive canvas
- Creator lab creation workflow (UI demo)
- Admin dashboard
- Responsive design with Tailwind CSS

---

## ⚠️ Security Notice

**This frontend has several security gaps in MVP stage:**

- ❌ **RBAC disabled** – Role-based route protection is commented out
- ❌ **Refresh token broken** – Token refresh logic is inconsistent
- ❌ **Token-only guards** – All authenticated routes accessible with any valid token
- ⚠️ **SessionStorage only** – No persistent auth (logout on tab close)

**Deployment requirement:** Backend must enforce all authorization. Frontend guards are for UX only.

---

## Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ OAuth 2.0 PKCE
       │
       ▼
┌─────────────┐       ┌──────────────┐       ┌─────────────────┐
│  Keycloak   │       │   Frontend   │       │   API Gateway   │
│  Auth Server│◀──────│  React SPA   │──────▶│    (:3000)      │
└─────────────┘       └──────────────┘       └────────┬────────┘
                        Vite Dev: :5173               │
                        CDN: CloudFlare               │
                                                      │
                        ┌─────────────────────────────┼──────────┐
                        │                             │          │
                        ▼                             ▼          ▼
                   ┌─────────┐                 ┌─────────┐  ┌─────────┐
                   │ Labs MS │                 │Sessions │  │ Users   │
                   └─────────┘                 │   MS    │  │  MS     │
                                               └─────────┘  └─────────┘
```

### Application Flow

1. **User visits landing** → Public marketing page
2. **User clicks "Start journey"** → Redirects to Keycloak login
3. **Keycloak redirects back** → `/auth/callback` with authorization code
4. **Frontend exchanges code** → Obtains access_token via PKCE
5. **Frontend calls `/users/me`** → Determines user role
6. **Frontend routes to dashboard** → `/learner`, `/creator`, or `/admin`
7. **User interacts** → All API calls via Gateway with Bearer token

---

## Tech Stack

| Component | Technology | Purpose |
| --- | --- | --- |
| **Build Tool** | Vite 5.x | Fast HMR and optimized builds |
| **Framework** | React 18.x | UI components and state management |
| **Language** | TypeScript 5.x | Type safety |
| **Routing** | React Router 6.x | SPA routing with loader/action patterns |
| **Styling** | Tailwind CSS 3.x | Utility-first CSS framework |
| **Auth** | Manual OAuth 2.0 | Keycloak PKCE flow (not using keycloak-js) |
| **HTTP Client** | Fetch API | Native browser API |
| **Icons** | Lucide React | Icon library |
| **Animation** | Framer Motion | UI animations |
| **Charts** | Recharts | Data visualization |
| **Deployment** | Cloudflare Pages | Static hosting with CDN |

---

## Requirements

### Development

- **Node.js** 18+ or 20+
- **npm** or **yarn**
- **Running backend services** (Gateway, Users MS minimum)
- **Running Keycloak** instance (via `altair-infra`)

### Production

- **Cloudflare Pages** or any static host
- **Keycloak** realm configured with frontend client
- **API Gateway** URL
- **Environment Variables** configured

### Environment Variables

Create `.env` file at project root:

```bash
# Keycloak Configuration (required)
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=altair
VITE_KEYCLOAK_CLIENT_ID=frontend

# API Configuration (required)
VITE_GATEWAY_URL=http://localhost:3000     # API Gateway URL
VITE_API_URL=http://localhost:3000         # Fallback API URL

# Optional: Feature Flags
VITE_ENABLE_MOCK_DATA=false
```

---

## Installation

### 1. Install dependencies

```bash
cd altair-frontend
npm install
```

### 2. Configure environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 3. Start development server

```bash
npm run dev
```

**Application will be available at:** [`http://localhost:5173`](http://localhost:5173)

---

## Usage

### Development Commands

```bash
# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run type-check

# Lint
npm run lint

# Format code
npm run format
```

---

## Application Structure

```
altair-frontend/
├── public/                       # Static assets
├── src/
│   ├── main.tsx                 # App entry point
│   ├── routes/
│   │   ├── router.tsx          # Route definitions
│   │   └── ProtectedRoute.tsx  # Auth guard (RBAC disabled)
│   ├── context/
│   │   └── AuthContext.tsx     # Auth state management
│   ├── pages/
│   │   ├── landing/            # Public landing pages
│   │   │   ├── Landing.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── Explorer.tsx
│   │   │   └── StarpathSection.tsx
│   │   ├── learner/            # Learner dashboard and features
│   │   │   ├── LearnerDashboard.tsx
│   │   │   ├── LabView.tsx
│   │   │   ├── LabSession.tsx
│   │   │   └── StarpathView.tsx
│   │   ├── creator/            # Creator dashboard and lab creation
│   │   │   ├── CreatorDashboard.tsx
│   │   │   └── CreateLabPage.tsx
│   │   ├── admin/              # Admin dashboard
│   │   │   └── AdminDashboard.tsx
│   │   ├── AuthCallback.tsx    # OAuth callback handler
│   │   └── AppEntry.tsx        # Post-login role resolver
│   ├── layouts/
│   │   ├── LearnerLayout.tsx   # Learner shell
│   │   └── CreatorLayout.tsx   # Creator shell
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   ├── labs/               # Lab-specific components
│   │   │   └── Terminal.tsx    # Mock terminal (not real WebSocket)
│   │   ├── starpath/           # Starpath visualization
│   │   │   └── StarpathWorldCanvas.tsx
│   │   └── user/               # User menu and modals
│   ├── api/
│   │   ├── client.ts           # Typed API client
│   │   └── index.ts            # API exports
│   ├── lib/
│   │   ├── theme.ts            # Design tokens
│   │   ├── apiClient.ts        # Fetch wrapper
│   │   └── refresh.ts          # Token refresh (broken)
│   ├── hooks/
│   │   └── useApi.ts           # API hook with refresh
│   └── contracts/
│       └── labs.ts             # API contracts (outdated)
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── .env
```

---

## Key Features

### 1. Keycloak SSO with PKCE

**Authorization Code + PKCE Flow:**

```tsx
// Login: Generate PKCE and redirect
loginSSO() {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await sha256(codeVerifier);
  
  sessionStorage.setItem('pkce_verifier', codeVerifier);
  sessionStorage.setItem('oauth_state', state);
  
  window.location.href = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth?
    client_id=${CLIENT_ID}
    &redirect_uri=${REDIRECT_URI}
    &response_type=code
    &code_challenge=${codeChallenge}
    &code_challenge_method=S256
    &state=${state}`;
}

// Callback: Exchange code for token
async function handleCallback(code: string) {
  const codeVerifier = sessionStorage.getItem('pkce_verifier');
  
  const response = await fetch(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`, {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      code,
      code_verifier: codeVerifier,
      redirect_uri: REDIRECT_URI
    })
  });
  
  const { access_token } = await response.json();
  sessionStorage.setItem('altair_token', access_token);
}
```

---

### 2. Role-Based Navigation

**AppEntry resolves role and redirects:**

```tsx
// src/pages/AppEntry.tsx
useEffect(() => {
  const fetchUserRole = async () => {
    const response = await fetch(`${VITE_API_URL}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const { role } = await response.json();
    
    switch (role) {
      case 'learner':
        navigate('/learner/dashboard');
        break;
      case 'creator':
        navigate('/creator/dashboard');
        break;
      case 'admin':
        navigate('/admin');
        break;
    }
  };
  
  fetchUserRole();
}, []);
```

**⚠️ Known Issue:** Expects flat response `{ role: "..." }` but Gateway may return `{ data: { role: "..." } }`.

---

### 3. API Client Convention

All backend requests follow this pattern:

```tsx
// Convention: /<service>/<microservice-route>
GET  /labs/labs                    → Labs MS: GET /labs
GET  /labs/labs/:id                → Labs MS: GET /labs/:id
POST /sessions/labs/:id/start      → Sessions MS: POST /labs/:id/start
GET  /users/me                     → Users MS: GET /me
```

**API Client:**

```tsx
// src/api/client.ts
async function request<T>(path: string, options?: RequestOptions): Promise<T> {
  const token = sessionStorage.getItem('altair_token');
  
  const response = await fetch(`${VITE_GATEWAY_URL}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options?.headers
    }
  });
  
  const json = await response.json();
  return json.data; // ⚠️ Expects { data: T } wrapper
}
```

---

### 4. Learner Experience

**Lab Session Flow:**

1. Browse labs on `/learner/dashboard`
2. Click lab → `/learner/labs/:id` (LabView)
3. Click "Start Lab" → POST `/sessions/labs/:id/start`
4. Navigate to `/learner/labs/:id/session` (LabSession)
5. **Mock Terminal displayed** (not real WebSocket)

**⚠️ Known Limitation:** Terminal is a local simulator. Real WebSocket integration not implemented.

---

### 5. Creator Experience

**Lab Creation Flow (UI Demo):**

1. Navigate to `/creator/dashboard`
2. Click "Create Lab"
3. Modal-based wizard (AI-assisted UI mockup)
4. **Not connected to backend** (pure UI demo)

**⚠️ Known Limitation:** CreateLabPage is a mockup with setTimeout delays. No real backend integration.

---

### 6. Starpath Visualization

**Interactive Canvas:**

- Pan/zoom with Framer Motion
- Generative background
- Lab nodes rendered as interactive elements
- **Mock data only** (not connected to Starpaths MS)

```tsx
// src/components/starpath/StarpathWorldCanvas.tsx
<motion.div
  drag
  dragConstraints= left: -2000, right: 2000, top: -2000, bottom: 2000 
  style= scale, x, y 
>
  {labs.map(lab => (
    <LabNode key={lab.id} {...lab} />
  ))}
</motion.div>
```

---

## Routing

### Public Routes

| Route | Component | Description |
| --- | --- | --- |
| `/` | Landing | Marketing landing page |
| `/auth/callback` | AuthCallback | OAuth callback handler |

### Protected Routes (Token Required)

| Route | Component | Role | Description |
| --- | --- | --- | --- |
| `/app` | AppEntry | Any | Role resolver and redirector |
| `/learner/dashboard` | LearnerDashboard | Learner | Lab catalog and progress |
| `/learner/labs/:id` | LabView | Learner | Lab details |
| `/learner/labs/:id/session` | LabSession | Learner | Active lab session |
| `/learner/starpaths/:id` | StarpathView | Learner | Starpath visualization |
| `/creator/dashboard` | CreatorDashboard | Creator | Creator dashboard |
| `/creator/labs/create` | CreateLabPage | Creator | Lab creation wizard |
| `/admin` | AdminDashboard | Admin | Admin dashboard |

**⚠️ Note:** Role-based protection is disabled in code. All protected routes accessible with any valid token.

---

## Known Issues & Limitations

### 🔴 Critical Issues

- **Build errors** – Missing imports (`@/api/mock`, type exports) prevent compilation
- **Route /login not defined** – Multiple redirects to `/login` but route doesn't exist
- **RBAC disabled** – `ProtectedRoute` ignores `allowed` roles parameter
- **Refresh token broken** – Inconsistent storage keys and missing implementation

### 🟡 Operational Gaps

- **Contract mismatch** – `src/contracts/labs.ts` doesn't match actual Labs MS schema
- **No WebSocket terminal** – Lab sessions use mock terminal instead of real WebShell
- **SessionStorage only** – Auth doesn't persist across browser restarts
- **No logout cleanup** – Token not always removed on logout

### 🟡 Business Logic Limitations

- **Mock Starpath data** – Not connected to Starpaths MS
- **Mock Creator flow** – Lab creation is UI demo only
- **No progress tracking** – Dashboard progress components use mock data
- **No group features** – Group UI exists but not connected to Groups MS

---

## API Contract Issues

### Labs API Mismatch

**Frontend expects** (in `src/contracts/labs.ts`):

```tsx
interface Lab {
  organization_id: string;
  scenario_id: string;
  validated: boolean;
  version: string;
  // ... other fields
}
```

**Backend returns** (Labs MS):

```tsx
interface Lab {
  lab_id: string;
  name: string;
  template_path: string;
  lab_type: string;
  difficulty: string;
  // ... different fields
}
```

**Resolution needed:** Update `src/contracts/labs.ts` to match actual Labs MS schema.

---

## Deployment

### Cloudflare Pages

```bash
# Build for production
npm run build

# Output directory: dist/

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist
```

**Configuration:**

- **Build command:** `npm run build`
- **Build output:** `dist`
- **Environment variables:** Set in Cloudflare Pages dashboard

### SPA Routing Configuration

**Required:** Configure rewrite rule for SPA routing

```toml
# _redirects file in public/
/*    /index.html   200
```

Or in Cloudflare Pages dashboard:

- **Rule:** `/*`
- **Target:** `/index.html`
- **Status:** `200`

---

## TODO / Roadmap

### High Priority (MVP → Production)

- [ ]  **Fix build errors** (missing imports, type exports)
- [ ]  **Define /login route** or replace all redirects with `/`
- [ ]  **Fix refresh token** (align storage keys, implement refresh logic)
- [ ]  **Update API contracts** (align with actual microservice schemas)

### Medium Priority (Production Hardening)

- [ ]  **Re-enable RBAC** (role-based route protection)
- [ ]  **Add WebSocket terminal** (real lab session terminal)
- [ ]  **Add persistent auth** (localStorage + refresh token)
- [ ]  **Connect Starpath data** (fetch from Starpaths MS)

### Low Priority (Future Enhancements)

- [ ]  **Connect Creator flow** (real lab creation backend calls)
- [ ]  **Add progress tracking** (fetch real user progress)
- [ ]  **Add group features** (connect to Groups MS)
- [ ]  **Add search** (lab and starpath search)

---

## Project Status

**⚠️ Current Status: MVP (Build Errors)**

This frontend is **functional for demo purposes** after fixing critical build errors. Core authentication and navigation are operational but several features use mock data.

**Known limitations to address for production:**

1. Fix missing imports preventing build
2. Update API contracts to match backend
3. Fix refresh token implementation
4. Re-enable role-based route protection
5. Connect WebSocket for real lab terminals
6. Replace mock data with real API calls

**Maintainers:** Altaïr Platform Team

---

## Notes

- **Vite dev server** – Port 5173 by default
- **No keycloak-js** – OAuth implemented manually with fetch
- **Token in SessionStorage** – Cleared on tab close
- **RBAC disabled** – Backend must enforce all authorization
- **Mock terminal** – Not connected to real WebShell

---

## License

Internal Altaïr Platform Frontend – Not licensed for external use.
