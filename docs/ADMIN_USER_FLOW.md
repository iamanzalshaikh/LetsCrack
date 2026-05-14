# LetsCrack Platform Flow (Admin + User)

This document defines **who does what**, **who uploads questions**, and the complete end-to-end flow for the current system (Writing + Speaking focus).

---

## 1) Roles and Responsibilities

- **Admin**
  - Creates and updates question bank content.
  - Manages users (student/examiner/admin).
  - Publishes final results to students.
- **Examiner** (optional/manual scoring path)
  - Reviews submitted sessions.
  - Applies manual scores/feedback when needed.
- **Student (User)**
  - Starts test sessions.
  - Completes Writing and Speaking tasks.
  - Waits for grading and views results.

### Who uploads questions?
**Admin uploads questions** via admin panel using backend endpoint:
- `POST /api/admin/question`

---

## 2) Backend APIs (Current)

### Admin APIs
- `POST /api/admin/question` -> create/update question entry
- `POST /api/admin/results/publish/:resultId` -> publish result
- `GET /api/admin/users` -> list users
- `DELETE /api/admin/user/:userId` -> delete user

### Examiner APIs
- `GET /api/examiner/submissions`
- `GET /api/examiner/submission/:submissionId/details`
- `POST /api/examiner/score`

### Student APIs
- `GET /api/student/tests`
- `POST /api/student/start-test/:testSetNumber`
- `GET /api/student/result-status/:sessionId`
- `GET /api/student/results/:testSetNumber`
- `GET /api/student/progress`
- `GET /api/student/certificate/:resultId`

### Writing APIs
- `GET /api/writing/task/:setNumber/:taskNumber`
- `POST /api/writing/autosave`
- `GET /api/writing/restore/:setNumber/:taskNumber`
- `POST /api/writing/submit`

### Speaking APIs
- `GET /api/speaking/task/:taskNumber?testSetNumber=:set`
- `POST /api/speaking/save-recording`

### Realtime events (Socket)
- `grading:queued`
- `grading:updated`
- `grading:failed`

---

## 3) Admin Panel Flow (Step-by-step)

## A. Login and access
1. Admin logs in.
2. Backend validates role `admin`.
3. Admin lands on dashboard with modules:
   - Question Bank
   - User Management
   - Results Publishing

## B. Question upload flow (Writing + Speaking)
1. Admin selects:
   - `module` (`writing` or `speaking`)
   - `testSetNumber` (e.g., 1, 2, 3)
   - `taskNumber` (task index)
2. Admin enters content:
   - Writing: scenario/prompt/options/word target
   - Speaking: prompt/image/prep time/speaking time
3. Frontend calls `POST /api/admin/question`.
4. Backend upserts by `{ module, testSetNumber, taskNumber }`.
5. Admin sees success and repeats for all tasks in that set.

## C. Result publishing flow
1. Grading is completed (AI and/or examiner).
2. Admin selects result record.
3. Admin clicks Publish.
4. Frontend calls `POST /api/admin/results/publish/:resultId`.
5. Backend marks `publishedAt`, generates certificate URL, sends email notification.

## D. User management flow
1. Admin opens users list (`GET /api/admin/users`).
2. Filters by role if needed.
3. Can delete user (`DELETE /api/admin/user/:userId`) if required.

---

## 4) Student/User Flow (Step-by-step)

## A. Start test
1. Student logs in.
2. Dashboard loads test library (`GET /api/student/tests`).
3. Student clicks Start/Resume on a test set.
4. Frontend calls `POST /api/student/start-test/:testSetNumber`.
5. Store `sessionId` locally for tracking.

## B. Writing module
1. Load task (`GET /api/writing/task/:set/:task`).
2. Restore draft if available (`GET /api/writing/restore/:set/:task`).
3. Autosave every interval (`POST /api/writing/autosave`).
4. Submit task (`POST /api/writing/submit`).
5. Backend queues AI grading and emits `grading:queued`.

## C. Speaking module
1. Load task prompt/timers (`GET /api/speaking/task/:taskNumber?...`).
2. Record audio on client.
3. Upload recording (`POST /api/speaking/save-recording`).
4. Backend queues grading + emits `grading:queued`.
5. Repeat until all speaking tasks complete.

## D. Grading and status tracking
1. Frontend listens to sockets:
   - `grading:updated` progress
   - `grading:failed` fallback message
2. Frontend also polls `GET /api/student/result-status/:sessionId` as fallback.
3. When status becomes `graded`, move to result screen.

## E. Results
1. Fetch final result (`GET /api/student/results/:testSetNumber`).
2. Show writing, speaking, overall.
3. Show history via `GET /api/student/progress`.
4. Allow certificate download via `GET /api/student/certificate/:resultId`.

---

## 5) Recommended Admin Panel Screens

1. **Question Bank**
   - Filters: module, set, task
   - Add/Edit form
   - Save (upsert)
2. **Test Set Builder**
   - Visual checklist of required tasks per set
   - Completion indicator (missing tasks highlighted)
3. **Results Center**
   - Pending/graded/published tabs
   - Publish action
4. **User Management**
   - Search/filter users by role
   - Delete action

---

## 6) Data/State Lifecycle

1. `in_progress` session starts.
2. Student submissions stored in `TestSession`.
3. Grading queue processes each task.
4. AI outputs normalized bands and analysis.
5. When all tasks graded -> result finalized.
6. Admin publishes result -> student notified.

---

## 7) What is still missing (for production-ready admin panel)

- Bulk question import (CSV/JSON upload).
- Draft vs Published versioning for questions.
- Validation rules per task type (required fields/timers).
- Audit log (who changed what and when).
- Soft delete/archive for questions and users.

---

## 8) Execution Checklist (Team)

1. Build Admin Question Bank UI (single-question upsert).
2. Add Test Set completeness validator.
3. Add Results Publishing screen.
4. Add User Management screen.
5. Add Bulk Import + versioning (next phase).

---

## 9) Final Owner Mapping

- **Question creation/upload** -> **Admin**
- **Scoring moderation/manual override** -> **Examiner/Admin**
- **Result publish to student** -> **Admin**
- **Test attempt + answer submission** -> **Student**

