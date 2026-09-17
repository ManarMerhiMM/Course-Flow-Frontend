# 🎓 RHU CourseFlow — Smart Course Registration Assistant

An automated course registration assistant for RHU students: fill out your information once, receive an AI-generated course plan, review it, request changes if needed, and send the approved plan through the advisor approval workflow.

Built with React, TypeScript, Vite, and n8n — with AI-powered course planning and automated feedback and approval workflows.

## 🤖 Overview

Every semester, RHU students face the same headache: piecing together a course plan, checking for schedule conflicts, contacting their advisor, and going through multiple rounds of revisions before reaching a final schedule.

**RHU CourseFlow** turns that process into a guided workflow.

Students fill out an RHU-branded form with their personal information, major, study plan, course offerings, email addresses, and scheduling preferences. The form sends this information to an n8n webhook, where the course-planning workflow generates a personalized proposed schedule.

The student can then review the plan and either approve it or request changes with a reason. Change requests are automatically sent back through n8n, which generates a revised plan and returns it to the review screen.

Once the student approves the plan, it is forwarded to the advisor workflow for approval. After the required approvals, the workflow can continue with the final registration process, including sending the completed registration form to the student and confirming that they have been unblocked on SIS.

Instead of repeated emails and meetings, CourseFlow provides a single loop:

```text
Submit → Generate → Review → Revise if needed → Student Approves → Advisor Decision → Finalize
```

## ✨ Features

* **RHU registration form** — Collects student information, degree track, major, semester, study plan, course offerings, emails, and scheduling preferences
* **AI-generated course plans** — Student information and uploaded documents are sent through n8n to generate a personalized proposed schedule
* **Schedule review** — Proposed courses are displayed with course code, title, days, time, instructor, room, and credits
* **Change request loop** — Students can select a reason for changes and provide additional feedback without restarting the registration process
* **Automatic plan revisions** — Change requests are sent back through n8n and a new proposed plan is returned to the student
* **Student approval** — Students explicitly approve the exact plan they want to continue with
* **Advisor workflow** — Approved plans are forwarded to the advisor workflow for the next stage of registration
* **File uploads** — Study plans and course offerings are submitted directly with the initial request
* **Form validation** — Required fields, student IDs, academic years, mobile numbers, and RHU email addresses are validated before submission
* **Preference support** — Students can specify preferred times, days to avoid, desired courses, and additional scheduling requirements
* **Three webhook workflows** — Separate n8n endpoints handle initial submission, change requests, and approval

## 🛠️ Tech Stack

* React
* TypeScript
* Vite
* CSS
* n8n
* AI-powered course planning workflow
* HTTP webhooks
* `multipart/form-data` for the initial submission
* JSON for plan revisions and approval

## 🗂️ Project Structure

```text
.
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env                       # n8n webhook URLs
├── README.md
│
└── src/
    ├── components/
    │   └── CourseFlowForm.tsx  # form, validation, API calls + review flow
    │
    ├── CourseFlowForm.css      # CourseFlow UI styling
    │
    └── ...
```

## 🔌 n8n Integration

CourseFlow communicates with three separate n8n webhook workflows.

### Submit

The initial registration request uses `multipart/form-data` because the student uploads both a study plan and course offerings.

```text
React
  │
  │ multipart/form-data
  ▼
n8n Submit Webhook
  │
  │ student information
  │ uploaded files
  │ courses + preferences
  ▼
AI Course Planning Workflow
  │
  ▼
ProposedPlan
  │
  ▼
React Review
```

The request contains:

```text
action
fullName
studentId
mobile
degreeTrack
major
college
semester
year
email
advisorEmail
courses
preferredTimes
daysToAvoid
otherPreferences
submittedAt
studyPlan
courseOfferings
```

The workflow returns a proposed plan using the shared `ProposedPlan` structure:

```ts
interface PlanCourse {
  code: string;
  title: string;
  days: string;
  time: string;
  instructor: string;
  room: string;
  credits: number;
}

interface ProposedPlan {
  courses: PlanCourse[];
  totalCredits: number;
}
```

### Request Changes

If the student does not approve the proposed schedule, the current plan and their feedback are sent to the change-request webhook as JSON.

```json
{
  "action": "request_changes",
  "plan": {
    "courses": [],
    "totalCredits": 17
  },
  "feedback": "There is a time conflict."
}
```

The n8n workflow processes the feedback and returns a **new `ProposedPlan`**.

React replaces the previous plan and displays the new version on the review screen.

### Approve

When the student approves the proposed schedule, the complete approved plan is sent to the approval webhook.

```json
{
  "action": "approve",
  "plan": {
    "courses": [],
    "totalCredits": 17
  }
}
```

The approval workflow can then continue with the advisor approval and final registration process.

## 🔄 Registration Flow

```text
┌──────────────────────┐
│        React         │
│    CourseFlow Form   │
└──────────┬───────────┘
           │
           │ Submit
           ▼
┌──────────────────────┐
│         n8n          │
│  Course Planning AI  │
└──────────┬───────────┘
           │
           │ ProposedPlan
           ▼
┌──────────────────────┐
│    Student Review    │
│                      │◀──────────────────┐
│ ✓ Approve            │                   │
│ × Request Changes    │                   │
└──────────┬───────────┘                   │
           │                               │
      ┌────┴────┐                          │
      │         │                          │
   Approve   Changes                       │
      │         │                          │
      │         └─────n8n Edited Plan──────┘
      │         
      │       
      │         
      │         
      │         
      │   
      │         
      │         
      │         
      └──────── 
              │
              ▼
      Advisor n8n Workflow
              │
              ▼
       Final Feedback to student
```

## ⚙️ Environment Variables
`.env:`
```env
VITE_N8N_SUBMIT_WEBHOOK_URL=
VITE_N8N_REQUEST_CHANGES_WEBHOOK_URL=
VITE_N8N_APPROVE_WEBHOOK_URL=
```

## 🚀 Getting Started

**Prerequisites:** Node.js and an accessible n8n instance with the required workflows configured.

1. **Clone or download** this repository.

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create a `.env` file** and add the three n8n webhook URLs:

   ```env
   VITE_N8N_SUBMIT_WEBHOOK_URL=...
   VITE_N8N_REQUEST_CHANGES_WEBHOOK_URL=...
   VITE_N8N_APPROVE_WEBHOOK_URL=...
   ```

4. **Start the development server:**

   ```bash
   npm run dev
   ```

5. **Open the local Vite URL** shown in the terminal.

6. **Fill out the CourseFlow form** and submit it to begin the registration workflow.

7. **Review the generated plan**, then approve it or request changes.

## 🛡️ Validation

Before the initial request is sent, the frontend validates:

* Required student information
* Student ID format
* Mobile number format
* Degree track
* Major
* Semester
* Academic year
* Both uploaded files
* Student RHU email format
* Advisor RHU email format


## 📄 License

© 2026 Manar Merhi, Adel lhussein, Aseel Ghaith, and Limar Al Asadi
