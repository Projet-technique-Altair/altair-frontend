# Altair Frontend — Development Guide

This README explains how to run and test the **Altair Frontend** locally, step by step.

---

## 1. Prerequisites

Make sure you have the following installed:

- **Node.js** ≥ 18
- **npm** ≥ 9
- A running **Altair Gateway** (backend)
- (Optional but recommended) **Docker** for backend services

Check versions:

```bash
node -v
npm -v
````

---

## 2. Environment variables

The frontend communicates only with the **API Gateway**.

Create a `.env` file at the root of the frontend project:

```env
VITE_GATEWAY_URL=http://localhost:3000
```

> This URL must point to the running Gateway, **not** directly to a microservice.

---

## 3. Install dependencies

From the frontend root directory:

```bash
npm install
```

---

## 4. Start the frontend (development mode)

```bash
npm run dev
```

Expected output:

```text
VITE ready in XXX ms
Local: http://localhost:5173/
```

Open the app in your browser:

```
http://localhost:5173
```

---

## 5. Backend requirement (important)

The frontend **requires the Gateway to be running**.

From the backend / infra repository:

```bash
docker compose up gateway
```

(or `docker compose up` if the gateway is part of a larger stack)

Verify the gateway is running:

```bash
docker ps
```

---

## 6. Authentication (Keycloak)

The frontend expects a JWT token stored in sessionStorage:

```
sessionStorage["altair_token"]
```

This token is normally set after a successful login via Keycloak.

To inspect it:

* Open DevTools
* Application → Session Storage
* Look for `altair_token`

---

## 7. Testing the `/labs` endpoint (manual)

### Test the Gateway directly (recommended)

```bash
curl http://localhost:3000/labs \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -H "Content-Type: application/json"
```

Expected response when no labs exist:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "request_id": "...",
    "timestamp": "..."
  }
}
```

---

## 8. Testing from the frontend

Toujours lancer dans cet ordre :

1. `altair-infra` (docker compose)
2. `altair-gateway` (cargo run)
3. Start the frontend:

   ```bash
   npm run dev
   ```

4. Navigate directly to:

   ```
   http://localhost:5173/learner/dashboard
   ```

5. Open DevTools → Network tab
   You should see:

   * `GET /labs`
   * Status `200`
   * Response `[]` (if no labs exist)

The UI must:

* Render without crashing
* Display an empty or neutral state
* Not throw JavaScript errors

---


---

## 12. Development philosophy

* The frontend talks **only** to the Gateway
* No direct microservice access
* No hardcoded URLs
* API shapes come from `contracts/`
* UI state is derived, not invented

---

You are now ready to work on the Altair Frontend.

```
```
