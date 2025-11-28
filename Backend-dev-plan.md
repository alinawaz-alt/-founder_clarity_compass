# Backend Development Plan - Founder Clarity Compass

## 1️⃣ Executive Summary
This project builds the backend for **Founder Clarity Compass**, a diagnostic tool for founders. The system captures user details, records diagnostic answers, and generates a personalized report via email and on-screen display.

**Constraints & Tech Stack:**
*   **Framework:** FastAPI (Python 3.13, async)
*   **Database:** MongoDB Atlas (Motor, Pydantic v2)
*   **Git:** Single branch `main`
*   **No Docker, No Complex Queues:** Use FastAPI `BackgroundTasks` for email.
*   **Testing:** Manual verification via Frontend UI after every task.
*   **Scope:** Only features explicitly visible in the current Frontend MVP.

**Sprint Strategy:**
*   **S0:** Setup & Environment
*   **S1:** Diagnostic Core (Capture, Logic, Report)
*   **S2:** Email Delivery & Analytics

---

## 2️⃣ In-Scope & Success Criteria

**In-Scope Features:**
*   **Landing Page:** Server serves as API host (Frontend is SPA).
*   **User Capture:** Store Name, Email, Company Size.
*   **Diagnostic Flow:** Validate session, receive answers.
*   **Report Generation:** "AI" Logic (heuristic/rule-based) to generate Mindset/Focus/Next Step.
*   **Email System:** Send report to user's email.
*   **Tracking:** Log start, completion, and CTA clicks.

**Success Criteria:**
*   Frontend `DiagnosticContext` successfully communicates with Backend APIs.
*   User can complete the full flow: Start -> Answer -> View Report -> Receive Email.
*   Data is correctly persisted in MongoDB Atlas.

---

## 3️⃣ API Design
**Base Path:** `/api/v1`

| Method | Path | Purpose | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/healthz` | Health check & DB Ping | - | `{"status": "ok", "db": "connected"}` |
| **POST** | `/diagnostic/start` | Create user & session | `{name, email, companySize}` | `{"sessionId": "uuid", "userId": "uuid"}` |
| **POST** | `/diagnostic/{sessionId}/complete` | Submit answers & get report | `{answers: [{questionId, response}]}` | `{report: {mindsetShift, operationalFocus, nextMove, fullReportText}}` |
| **POST** | `/tracking/event` | Log CTA clicks/Drop-offs | `{sessionId, eventType, metadata}` | `{"success": true}` |

**Notes:**
*   **Error Envelope:** `{"error": "Detailed message"}`
*   **Validation:** Use Pydantic v2 models for all bodies.

---

## 4️⃣ Data Model (MongoDB Atlas)

**Collection: `users`**
*   `_id` (ObjectId)
*   `name` (String)
*   `email` (String)
*   `company_size` (String: "15-35", "36-60", "61-95", "96-200")
*   `created_at` (DateTime)

**Collection: `sessions`**
*   `_id` (ObjectId)
*   `user_id` (ObjectId, ref: users)
*   `session_uuid` (String, unique public ID)
*   `answers` (Array of Objects: `{question_id: str, response: str/int}`)
*   `report` (Object, optional: `{mindset_shift, operational_focus, next_move, text}`)
*   `status` (String: "started", "completed")
*   `created_at` (DateTime)
*   `completed_at` (DateTime, optional)

**Collection: `events`** (For analytics)
*   `session_id` (String)
*   `event_type` (String: "cta_click", "drop_off")
*   `metadata` (Object)
*   `timestamp` (DateTime)

---

## 5️⃣ Frontend Audit & Feature Map

| Component/Page | Frontend State | Backend Need |
| :--- | :--- | :--- |
| **DiagnosticContext** | Manages `user`, `session`, `answers` locally. | Needs to call API `start` and `complete` instead of just setting state. |
| **DiagnosticPage** | Uses local `mockReport`. | Needs to display real report returned from `complete` API. |
| **ReportPage** | Displays report from Context. | No change needed if Context is updated correctly. |
| **ReportPage (CTA)** | Console logs events. | Call `/tracking/event` API. |

---

## 6️⃣ Configuration & ENV Vars
*   `APP_ENV`: "development"
*   `PORT`: 8000
*   `MONGODB_URI`: Connection string (Atlas)
*   `CORS_ORIGINS`: "http://localhost:5173,http://localhost:3000"
*   `SMTP_HOST`: (Optional mock for MVP)
*   `SMTP_PORT`: (Optional mock for MVP)
*   `SMTP_USER`: (Optional mock for MVP)
*   `SMTP_PASSWORD`: (Optional mock for MVP)
*   `FROM_EMAIL`: "noreply@foundercompass.com"

---

## 7️⃣ Background Work
*   **Email Sending:** Triggered via `BackgroundTasks` on `/diagnostic/{sessionId}/complete`.
*   **Mechanism:** Async function that formats and sends the email (or logs it if SMTP not configured).

---

## 8️⃣ Integrations
*   **Email:** Standard SMTP. If credentials missing, log the email body to console (Mock Mode) to ensure flow is testable.

---

## 9️⃣ Testing Strategy
*   **Manual Only:** All validation is done by running the backend and interacting with the Frontend.
*   **Process:**
    1.  Implement Task.
    2.  Start Backend (`uvicorn main:app --reload`).
    3.  Start Frontend (`npm run dev`).
    4.  Perform "Manual Test Step".
    5.  Fix if fails.
    6.  Commit & Push.

---

## 🔟 Dynamic Sprint Plan & Backlog

### 🧱 S0 – Environment Setup & Core Skeleton

**Objectives:**
*   Initialize FastAPI project.
*   Connect to MongoDB Atlas.
*   Setup CORS.
*   **Crucial:** Create a `services/` folder for business logic.

**Tasks:**
*   **Init Project & Git**
    *   Create `requirements.txt` (fastapi, uvicorn, motor, pydantic, pydantic-settings, python-dotenv, email-validator).
    *   Create `.gitignore` (Python standard).
    *   Init Git repo.
    *   Manual Test Step: Run `git status` to see clean state.
    *   User Test Prompt: "Check that the git repo is initialized."

*   **FastAPI Skeleton & DB**
    *   Create `main.py`, `config.py`, `database.py`.
    *   Implement `GET /api/v1/healthz` checking Mongo connection.
    *   Manual Test Step: Visit `http://localhost:8000/api/v1/healthz`.
    *   User Test Prompt: "Start the backend and verify the health endpoint returns DB status connected."

*   **CORS Configuration**
    *   Allow localhost:5173 (Vite default).
    *   Manual Test Step: Check headers or use browser console from frontend.
    *   User Test Prompt: "Ensure no CORS errors in browser console when frontend tries to connect."

*   **Definition of Done:** Backend running, DB connected, Health endpoint reachable.
*   **Post-Sprint:** Commit & Push to `main`.

---

### 🧩 S1 – Diagnostic Core & Report Logic

**Objectives:**
*   Capture User & Start Session.
*   Process Answers & Generate Report.
*   Connect Frontend `DiagnosticContext` to Real API.

**Tasks:**
*   **Endpoint: Start Diagnostic**
    *   Create `models.py` (User, Session).
    *   Impl `POST /api/v1/diagnostic/start`.
    *   Logic: Create User, Create Session, Return UUIDs.
    *   Manual Test Step: Use Swagger UI (`/docs`) to POST dummy data; check MongoDB Atlas for new document.
    *   User Test Prompt: "Create a session via Swagger and verify it appears in the database."

*   **Service: Report Generator (Heuristic)**
    *   Create `services/report_generator.py`.
    *   Impl simple logic: Map `companySize` + random answer choice to a specific "Mindset Shift" (hardcoded variations for MVP).
    *   Manual Test Step: Call function via python shell or temporary endpoint.
    *   User Test Prompt: "Verify the report logic returns text based on inputs."

*   **Endpoint: Complete Diagnostic**
    *   Impl `POST /api/v1/diagnostic/{sessionId}/complete`.
    *   Accept answers list.
    *   Save answers to Session.
    *   Call `ReportGenerator`.
    *   Save Report to Session.
    *   Return Report JSON.
    *   Manual Test Step: Use Swagger to submit answers for the created session; verify response contains report fields.
    *   User Test Prompt: "Submit answers via Swagger and confirm a full report is returned."

*   **Frontend Integration: Connect API**
    *   **Edit `frontend/src/context/DiagnosticContext.tsx`**:
        *   `startDiagnostic`: Call `/start` endpoint, save IDs to state.
        *   `completeDiagnostic`: Call `/complete` endpoint with answers, update state with returned report.
    *   Manual Test Step: Run full Frontend flow. Start -> Answer -> Submit.
    *   User Test Prompt: "Go through the app in the browser. Confirm that after the last question, you see the Report Page with dynamic data."

*   **Definition of Done:** Full User Journey works with real DB storage.
*   **Post-Sprint:** Commit & Push.

---

### 📧 S2 – Email Delivery & Analytics

**Objectives:**
*   Send Report via Email.
*   Track CTA Clicks.

**Tasks:**
*   **Email Service (Background Task)**
    *   Create `services/email_service.py`.
    *   Use `fastapi.BackgroundTasks`.
    *   Impl `send_report_email(to_email, report_content)`.
    *   If SMTP env vars missing, just `print(f"MOCK EMAIL TO {to_email}: ...")`.
    *   Hook into `/complete` endpoint.
    *   Manual Test Step: Complete diagnostic in UI; check terminal console for "MOCK EMAIL" log or real inbox.
    *   User Test Prompt: "Complete the diagnostic and check the backend terminal for the email log."

*   **Endpoint: Tracking Events**
    *   Impl `POST /api/v1/tracking/event`.
    *   Store in `events` collection.
    *   **Edit `frontend/src/pages/ReportPage.tsx`**: Update CTA handlers to call this API.
    *   Manual Test Step: Click "Book Consult" in UI; check MongoDB `events` collection.
    *   User Test Prompt: "Click the CTA button and verify the event is logged in the database."

*   **Definition of Done:** Emails are triggered (mock/real) and analytics are captured.
*   **Post-Sprint:** Commit & Push.