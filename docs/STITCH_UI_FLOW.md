# End-to-end UI flow (Google Stitch / design handoff)

Use this document to build every screen in Stitch. Each block = one frame or variant set.

---

## Design system (apply globally)

- **Tone:** CELPIP-style practice test — clean, calm, exam-like (not playful).
- **Typography:** Clear hierarchy — eyebrow / title / body / legal.
- **Colors:** White/slate surfaces, one accent (blue) for primary actions, amber for warnings, red for timer danger.
- **Density:** Generous padding on test runner; compact on lists.
- **Accessibility:** Min tap targets 44px; timer always visible during timed tasks.

---

## User journeys (pick one per prototype)

1. **Student — first time:** Landing → Register → Login → Dashboard → Test registration → Instructions → Writing → Speaking → Grading → Results.
2. **Student — returning:** Login → Dashboard → Resume test OR new attempt → …
3. **Admin:** Login → Admin dashboard → Question bank → Upload media → Publish test set.

---

## Screen map (build in this order)

| # | Screen ID | Route (concept) | Notes |
|---|-----------|-----------------|--------|
| 1 | `landing` | `/` | Marketing home |
| 2 | `auth_login` | `/login` | |
| 3 | `auth_register` | `/register` | Account creation |
| 4 | `celpip_registration` | `/celpip-registration` | **Optional** — exam profile after signup |
| 5 | `student_dashboard` | `/dashboard` | Library + history + live grading widget |
| 6 | `test_registration` | `/test/:setNumber/register` | **Pre-test** — confirm test + mode |
| 7 | `test_instructions` | `/test/:setNumber/instructions` | Important note + format |
| 8 | `writing_player` | `/test/writing/:set/:task` | Split: prompt / editor |
| 9 | `speaking_player` | `/test/speaking/:set/:task` | Prep → record → upload |
| 10 | `grading_wait` | `/test/:setNumber/grading` | AI evaluating |
| 11 | `results` | `/results/:setNumber` | Bands + breakdown |
| 12 | `admin_dashboard` | `/admin` | Tiles to sub-areas |
| 13 | `admin_question_form` | `/admin/questions` | Single task upsert |
| 14 | `admin_media_upload` | `/admin/media` | Upload + attach |
| 15 | `admin_users` | `/admin/users` | List + delete |
| 16 | `admin_publish` | `/admin/results` | Publish results |

---

## 1 — Landing (`landing`)

**Purpose:** Explain product; drive to Register / Login.

**Sections (top → bottom):**
- Nav: logo, Login, Get started
- Hero: headline, subcopy, CTA primary “Start practice”, secondary “Sign in”
- Feature strip (3 cards): Writing AI, Speaking AI, Realistic timing
- Social proof / stats (optional)
- Footer: links

**States:** Default only (no empty).

---

## 2 — Login (`auth_login`)

**Components:**
- Email field
- Password field
- Primary button “Sign in”
- Link “Create account”
- Optional: “Forgot password” (disabled if not built)

**States:**
- Default
- Error inline (invalid credentials)
- Loading (button disabled + spinner)

---

## 3 — Register (`auth_register`)

**Components:**
- First name, Last name
- Email, Password
- Optional: Country
- Primary “Create account”
- Link “Already have an account?”

**States:** Default, validation errors, loading, success → redirect dashboard.

---

## 4 — CELPIP registration (`celpip_registration`) — *optional but matches “celpip-registration” idea*

**Purpose:** Collect exam intent *after* account exists (like a profile step).

**Fields (suggested):**
- Test type: General / LS (if product supports)
- Target band (slider or select)
- Test date (date picker)
- Checkbox: “I agree to practice test rules”

**Actions:**
- Primary “Save and continue” → Dashboard
- Secondary “Skip for now” → Dashboard

**States:** Default, validation, loading.

---

## 5 — Student dashboard (`student_dashboard`)

**Layout:** Header + main 2-column (desktop) / stacked (mobile).

**Header:**
- Logo + nav tabs: Practice | History (optional)
- User avatar + Logout

**Hero row:**
- Greeting + short line
- Primary CTA “Quick start” (first available test)

**Stats row (4 tiles):** Tests taken, Hours, Avg band, Rank — *use placeholder numbers or “—” until data*

**Left column — Recent activity:**
- List of past attempts: set number, date, chevron → results
- Empty state: illustration + “Start your first test”

**Left column — Practice library:**
- Grid of cards: title, module count, estimated time, button “Take test” / “Resume”

**Right column — Live grading status card:**
- Badge: In progress / Grading / Graded
- Progress lines: Writing X/Y, Speaking X/Y, Overall X/Y
- Optional warning banner (grading failed retry)

**States:**
- Loading skeleton for library
- Empty library
- Active grading (animated subtle pulse on badge)

---

## 6 — Test registration (`test_registration`)

**Purpose:** Before instructions — user confirms *which test* and *mode*.

**Components:**
- Breadcrumb: Dashboard › Test Set N
- Title: “Practice Test Set N”
- Summary: duration, modules included (Writing + Speaking)
- **Mode selector:**
  - Practice: “You can review before final submit”
  - Simulation: “Section lock; stricter timing”
- Primary “Continue to instructions”
- Secondary “Back to dashboard”

**States:** Default, loading test meta.

---

## 7 — Test instructions (`test_instructions`)

**Purpose:** Paragon-style “Important note” + format overview.

**Components:**
- Title “Before you begin”
- Scrollable legal-style note (3–5 bullets): timing, no back in simulation, media rules placeholder
- Checkbox “I understand”
- Primary “Start test” → Writing task 1
- Link “Back”

**States:** Checkbox unchecked → primary disabled.

---

## 8 — Writing player (`writing_player`)

**Layout:** Full viewport height. **Split 50/50** desktop; stacked mobile.

**Top bar (sticky):**
- Back (confirm dialog if dirty)
- Test label “Set N · Writing Task X”
- Timer (large, turns red &lt; 2 min)
- Autosave indicator “Saved” / “Saving…”

**Left panel — Prompt:**
- Eyebrow “Context”
- Scenario title
- Background paragraph (long text)
- Bullet instructions
- If Task 2: two option cards (A / B) read-only

**Right panel — Answer:**
- Large textarea
- Footer: word count, target range, primary “Submit task”

**Modal:** Confirm submit (cannot edit after — in simulation)

**States:**
- Loading task
- Task not found (error + back)
- Timer expired (textarea disabled + submit disabled)
- Submitting

---

## 9 — Speaking player (`speaking_player`)

**Layout:** Centered content, calm background.

**Top bar:**
- Back
- “Speaking Task X of Y” (Y from config, not hardcoded 8)
- Phase badge: Preparation | Recording | Uploading

**Center:**
- Large prompt text
- Optional image (if `imageUrl`)
- Visualizer circle (volume) — optional polish

**Bottom / overlay:**
- Countdown (huge)
- Recording: primary “Stop early” optional
- Uploading: spinner + “Uploading…”

**States:**
- Mic permission denied (error card + retry)
- Prep countdown
- Recording countdown
- Uploading
- Success auto-advance (design as transition frame)

---

## 10 — Grading wait (`grading_wait`)

**Purpose:** Bridge after final submit until AI finishes.

**Components:**
- Illustration or simple animation
- Title “We’re scoring your test”
- Progress: Writing / Speaking / Overall (three mini progress bars)
- Subtext “Usually under 1–2 minutes”
- Secondary “Back to dashboard” (does not cancel grading)

**States:**
- Grading in progress
- Partial failure banner (retry) — optional
- Complete → auto navigate to Results

---

## 11 — Results (`results`)

**Layout:** Header + 2-column.

**Header:**
- Back to dashboard
- Title “Results · Set N”
- Submitted date
- Secondary “Download PDF” (if available)

**Left — Score card:**
- Large overall band
- Two smaller tiles: Writing, Speaking
- Status chip “AI scored”

**Right — Breakdown:**
- Section “Writing feedback” — criteria rows (coherence, vocab, etc.) with bars
- Section “Speaking feedback” — same pattern
- Tip card at bottom

**Empty / processing state:**
- “Still processing” + Refresh button + same live grading widget as dashboard

---

## 12 — Admin dashboard (`admin_dashboard`)

**Tiles (2x2 or list):**
- Question bank
- Media library
- Users
- Publish results

Each tile: icon, title, one line, chevron.

---

## 13 — Admin question form (`admin_question_form`)

**Purpose:** One screen to create/update one task.

**Fields:**
- Module: Writing | Speaking
- Test set number
- Task number
- Writing: scenario JSON-like sections (subheading, background, instructions[], optionA/B, wordCountTarget)
- Speaking: prompt, image URL, prep seconds, speak seconds

**Actions:** Save draft, Preview (opens read-only student view in modal), Publish set (if you add versioning later)

**States:** Validation errors, success toast.

---

## 14 — Admin media upload (`admin_media_upload`)

**Components:**
- Dropzone or file picker
- After upload: file name, duration (if video/audio), URL display
- “Attach to task” dropdown: Set N / Task M

**States:** Uploading, success, error.

---

## 15 — Admin users (`admin_users`)

**Table:** Name, email, role, actions (delete icon with confirm modal).

**States:** Empty, loading, error.

---

## 16 — Admin publish results (`admin_publish`)

**List:** Student, set, status (pending / ready / published), button Publish.

**Confirm modal** before publish.

---

## Navigation graph (for Stitch links)

```
Landing ──► Register ──► CELPIP registration (opt) ──► Dashboard
Landing ──► Login ───────────────────────────────────► Dashboard

Dashboard ──► Test registration ──► Instructions ──► Writing T1 ──► Writing T2 ──► Speaking T1… ──► Grading wait ──► Results
Dashboard ──► Results (from history row)

Admin dashboard ──► Question form | Media | Users | Publish
```

---

## Stitch tips

1. Create **one component set** for: buttons, inputs, cards, timer, badges.
2. Use **variants** for: Writing vs Speaking top bar, Grading states, Empty vs Filled lists.
3. Name frames: `01_landing`, `05_dashboard_default`, `05_dashboard_empty`, etc.
4. Export this file path for dev handoff: `docs/STITCH_UI_FLOW.md`

---

## Optional frames (polish)

- 404 page
- Offline / reconnect banner on test player
- Session expired modal (mid-test)
