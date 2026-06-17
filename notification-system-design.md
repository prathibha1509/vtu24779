# Notification System Design

## Overview

A full-stack Notification Management System built for the AffordMed Campus Evaluation. It integrates with the AffordMed Evaluation Service to fetch and display campus notifications, while also supporting custom local notifications.

---

## Architecture

```
React Frontend (Vite + MUI)
        │
        ▼
  Axios HTTP Client
        │
        ▼
Express Backend (Node.js)
        │
   ┌────┴────┐
   │         │
   ▼         ▼
Routes    loggerMiddleware
   │         │
   ▼         ▼
Controller  AffordMed
   │       Logging API
   ▼
Service
   │
   ▼
Repository
   │
   ▼
AffordMed Evaluation
  Service API
```

---

## Modules

### 1. `logging-middleware`

A reusable standalone npm package that wraps all calls to the AffordMed Logging API.

**Files:**
| File | Purpose |
|---|---|
| `src/config/logger.config.js` | Axios instance with dynamic Bearer token interceptor |
| `src/utils/logger.js` | `log(stack, level, package, message)` function with validation and 48-char truncation |
| `src/middleware/logger.middleware.js` | Express middleware that logs all incoming requests and responses |
| `src/index.js` | Public package entry point |

**Logging Levels Supported:** `debug`, `info`, `warn`, `error`, `fatal`

**Token Auto-Refresh:** The `loggerApi` interceptor reads `process.env.ACCESS_TOKEN` on every request, so the service's token-refresh logic takes effect immediately without restart.

---

### 2. `notification-app-be`

An Express.js REST API backend.

**Files:**
| File | Purpose |
|---|---|
| `src/server.js` | Entry point – loads `.env` and starts HTTP server |
| `src/app.js` | Registers middleware, routes, and error handler |
| `src/middleware/error.middleware.js` | Catches unhandled errors, logs at `FATAL` level |
| `src/routes/notification.routes.js` | Route definitions |
| `src/controllers/notification.controller.js` | Handles requests, validates input, delegates to service |
| `src/services/notification.service.js` | Business logic: token management, merge, state tracking |
| `src/repository/notification.repository.js` | HTTP calls to AffordMed external API |

**REST API Endpoints:**

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/notifications` | Fetch all notifications (external + custom, sorted by date) |
| `POST` | `/api/notifications` | Create a custom local notification |
| `PATCH` | `/api/notifications/:id/read` | Mark a notification as read |
| `DELETE` | `/api/notifications/:id` | Soft-delete a notification |
| `POST` | `/api/logs` | Proxy client-side (frontend) logs securely |

**Logging Rules Applied:**

| Layer | Events | Level |
|---|---|---|
| Middleware | Incoming request / response | `INFO` |
| Middleware | Unhandled exception | `FATAL` |
| Controller | Request received | `INFO` |
| Controller | Success | `INFO` |
| Controller | Validation failure | `WARN` |
| Controller | Exception | `ERROR` |
| Service | External API call | `INFO` |
| Service | Failure | `ERROR` |
| Repository | Failure | `ERROR` |

---

### 3. `notification-app-fe`

A React + Vite + Material UI frontend dashboard.

**Files:**
| File | Purpose |
|---|---|
| `src/main.jsx` | Root React entry point |
| `src/App.jsx` | MUI dark theme provider + app shell |
| `src/api/notifications.js` | Axios API layer + automatic error logging proxy |
| `src/pages/Dashboard.jsx` | Main dashboard: filters, stats, feed, create form |
| `src/components/NotificationCard.jsx` | Individual notification card with read/delete actions |

**Frontend Logging Rules Applied:**

| Event | Level | Package |
|---|---|---|
| Page loaded | `INFO` | `page` |
| API failure | `ERROR` | `api` |

**Features:**
- Fetches live notifications from AffordMed Evaluation Service via backend
- Publish custom notifications (`Event`, `Placement`, `Result`)
- Type, status, and source filters
- Mark as read / soft delete
- Auto-refresh with configurable interval (5s / 10s / 30s / 60s)
- Stats counters (total, unread, by type)
- Dark mode glassmorphism design
- Toast feedback on actions

---

## Authentication Flow

```
1. Registration  →  clientID + clientSecret
2. POST /auth    →  access_token (JWT)
3. Inject token  →  process.env.ACCESS_TOKEN
4. Use token     →  Logging API + Notification API
5. Auto-refresh  →  service.getValidToken() checks expiry,
                     re-authenticates transparently on expiry
```

---

## Data Flow

```
User Action (React)
      │
      ▼
api/notifications.js (Axios)
      │
      ▼
Express Route → Controller → Service → Repository
                    │               │
                    ▼               ▼
               log(INFO)    GET /notifications
                            (AffordMed API)
                    │
                    ▼
              log(SUCCESS/ERROR)
                    │
                    ▼
           Response to Frontend
```

---

## Environment Variables

| Variable | Used In | Purpose |
|---|---|---|
| `PORT` | backend | Express listening port |
| `BASE_URL` | backend | AffordMed evaluation-service base URL |
| `LOG_BASE_URL` | logging-middleware | AffordMed logging endpoint base URL |
| `CLIENT_ID` | backend | AffordMed client ID for auth |
| `CLIENT_SECRET` | backend | AffordMed client secret for auth |
| `ACCESS_TOKEN` | both | Current Bearer JWT token |
