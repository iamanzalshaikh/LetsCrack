Final Product Flow (Let’s Crack CELPIP)
1) Entry + Access Flow
Landing page
CELPIP Program page
Login/Register
Subscription check
if active subscriber -> continue
if inactive -> paywall/subscribe page
Dashboard (test library + progress)
2) Test Selection Flow
User sees 25 Practice Tests (Set 1...Set 25)
User selects:
Complete Test (all 4 modules)
or Individual Module (Listening/Reading/Writing/Speaking)
User selects mode:
Practice Mode
Simulation Mode
User enters test instructions screen
User clicks Start Test
3) Mode Rules (Critical)
Practice Mode
flexible navigation allowed
sample responses available
support hints/examples
user can review before final submit
Simulation Mode
exam-like strict behavior
no sample responses
lock after section submit
limited/no revisit depending on module
strict timing
4) Module Execution Flow
Listening
media-driven question flow
timer tracked
simulation rules on replay/seek based on config
Reading
passage + question blocks
timer tracked
submit section -> lock (simulation)
Writing (53 min total)
Task 1: Email writing (formal/informal by prompt)
Task 2: Essay/response writing
left panel = question + instructions
right panel = editor
word count visible
Task 2 option selection (A/B) before writing starts
autosave + final submit
Speaking (8 tasks)
Giving advice
Personal experience
Describe scene (image)
Make predictions (same image, different instruction)
Compare & persuade (2-part; options-based)
Difficult situation
Question-based response
Unusual situation (image)
Per task:

instruction (video/text) + skip option
prep time
recording time
no visible progress bar during recording (background timer only)
upload after each task
Special: Task 5 includes short instruction timer (10s as noted).

5) Grading + Report Flow
After submissions, AI grading starts
Realtime status: queued -> grading -> graded
Report generated:
scores
feedback
improvement suggestions
User can download report
Certificate (final template pending from Anmol)
6) Data Retention / Deletion Flow
Raw response data stored short-term (writing text + audio + transcript)
User prompted with disclaimer:
“Download your report within X time; data auto-deletes.”
After 1-2 days max:
delete raw content/audio/transcript
Keep only long-term analytics:
test set id
module scores
progress history
timestamps
If user downloads report early -> optional immediate purge trigger
7) Admin Flow (Who uploads questions)
Admin owns all question/media upload.

Admin steps
Login as admin
Create/update test set content
Upload module questions
Upload media assets (images/audio/video)
Map task content to set number + task number
Publish test set
Monitor attempts/results
Publish final results/certificates
8) Examiner/Manual Override Flow (if enabled)
Open pending submissions
Review AI output + response
Override scores/feedback if needed
Finalize for publish
9) Dashboard Flow (Student)
show completion progress
show per-set status (not started/in progress/graded)
show latest scores
show active grading widget
resume active session
10) Final “Same-as-Target” UX Sequence
Landing -> CELPIP page -> Auth -> Subscription check -> Test library -> Complete/Individual selection -> Mode selection -> Instructions -> Module runner -> Grading -> Download report -> Auto deletion policy