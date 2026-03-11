# TASKS.md
Case Management System – Development Tasks

This document defines the step-by-step tasks required to build the MVP.

AI agents should complete tasks sequentially.

Each task should produce working code before moving to the next one.

---

# Phase 1 — Project Setup

Goal: create the base project and ensure it runs locally.

---

## TASK-001 Create Vite React Project [DONE]

Create a new project using:

Vite + React

Command example:

npm create vite@latest case-management-system

Use:

React + TypeScript (recommended)

---

## TASK-002 Install Core Dependencies [DONE]

Install dependencies:

- TailwindCSS
- Supabase JS SDK
- React Router
- date-fns (for timeline)

Example:

npm install @supabase/supabase-js react-router-dom date-fns

---

## TASK-003 Setup TailwindCSS [DONE] (Using Tailwind v4)

Configure TailwindCSS.

Steps:

- install tailwind
- configure tailwind.config.js
- import Tailwind in main.css

Test by rendering a styled component.

---

## TASK-004 Setup Project Folder Structure [DONE]

Create the following folders:

src/

pages/
components/
services/
hooks/
utils/

---

## TASK-005 Setup React Router [DONE]

Create routing structure.

Routes:

/cases  
/cases/:id  
/cases/new

---

# Phase 2 — Supabase Setup

Goal: connect frontend to Supabase backend.

---

## TASK-006 Create Supabase Project [DONE]

Create a Supabase project.

Enable:

- Database
- Storage
- Auth

Save:

SUPABASE_URL  
SUPABASE_ANON_KEY

---

## TASK-007 Create Supabase Client [DONE]

Create:

services/supabaseClient.ts

Initialize Supabase SDK.

Export client instance.

---

## TASK-008 Environment Variables [DONE]

Create `.env` file.

Example:

VITE_SUPABASE_URL=xxx  
VITE_SUPABASE_ANON_KEY=xxx

---

# Phase 3 — Database Schema

Goal: define database tables.

---

## TASK-009 Create cases Table

Fields:

id (uuid primary key)  
name (text)  
title (text)  
summary (text)  
description (text)  
status (text)  
created_at (timestamp)

---

## TASK-010 Create events Table

Fields:

id (uuid)  
case_id (uuid)  
title (text)  
description (text)  
event_date (date)  
created_at (timestamp)

Add foreign key:

events.case_id → cases.id

---

## TASK-011 Create attachments Table

Fields:

id (uuid)  
case_id (uuid)  
event_id (uuid)  
file_name (text)  
file_url (text)  
file_type (text)  
created_at (timestamp)

---

## TASK-012 Enable Row Level Security

Enable RLS for:

cases  
events  
attachments

Add simple policy allowing authenticated users.

---

# Phase 4 — Case Management UI

Goal: implement case CRUD.

---

## TASK-013 Create CaseList Page [DONE]

Page:

/cases

Display list of cases.

Fields:

- case name
- title
- created date

---

## TASK-014 Fetch Cases From Supabase [DONE]

Implement API call:

select * from cases order by created_at desc

Render in CaseList.

---

## TASK-015 Create CaseCard Component [DONE]

Component:

CaseCard

Displays:

- case name
- title
- summary

Clickable → open case detail.

---

## TASK-016 Create CaseCreate Page [DONE]

Page:

/cases/new

Form fields:

- name
- title
- summary
- description

---

## TASK-017 Implement Create Case API [DONE]

Insert record into:

cases table

After creation redirect to:

/cases/:id

---

## TASK-018 Create CaseDetail Page [DONE]

Page:

/cases/:id

Display:

- case information
- events
- attachments

---

# Phase 5 — Event Timeline

Goal: implement timeline system.

---

## TASK-019 Fetch Case Events [DONE]

Query:

select * from events where case_id = ?

---

## TASK-020 Create EventItem Component [DONE]

Display:

- event date
- title
- description

---

## TASK-021 Create Timeline Component [DONE]

Render event list sorted by:

event_date ascending.

---

## TASK-022 Create Add Event Form [DONE]

Fields:

- title
- description
- event_date

Insert into:

events table.

---

## TASK-023 Update Timeline After Event Creation [DONE]

After event creation:

reload events list.

---

# Phase 6 — Attachments

Goal: file upload support.

---

## TASK-024 Create R2 Bucket [DONE]

Create bucket:

case-files (R2 private)

---

## TASK-025 Create Attachment Upload Component [DONE]

Component:

FileUploader

Allow selecting files.

---

## TASK-026 Upload File To Storage [DONE]

Upload using:

- signed PUT URL to Cloudflare R2

---

## TASK-027 Save Attachment Metadata [DONE]

Insert into:

attachments table.

Fields:

- case_id
- storage_provider = r2
- storage_key
- file_name

---

## TASK-028 Display Attachment List [DONE]

Component:

AttachmentList

Display:

- file name
- signed download URL from Edge Function

Notes:

- R2 secrets must be configured in Supabase Edge Function environment.
- Edge functions required:
  - `attachments-upload-url`
  - `attachments-download-url`
  - `attachments-delete`

---

## TASK-028A Delete Attachment (R2) [DONE]

- Adds delete action in attachment list
- Uses `attachments-delete` edge function

---

# Phase 7 — Search

Goal: case search.

---

## TASK-029 Create SearchBar Component [DONE]

Input field for keyword search.

---

## TASK-030 Implement Search Query [DONE]

Search cases using:

ILIKE '%keyword%'

Fields:

- name
- title
- summary
- description

---

## TASK-031 Display Search Results [DONE]

Update case list based on search results.

---

# Phase 8 — UI Improvements

Goal: improve usability.

---

## TASK-032 Add Loading States

Show loading spinner when fetching data.

---

## TASK-033 Add Error Handling

Handle:

- API errors
- upload errors

---

## TASK-034 Add Empty State UI

Example:

"No cases found"

---

# Phase 9 — Deployment

Goal: publish application.

---

## TASK-035 Push Code to GitHub

Create repository.

Push project code.

---

## TASK-036 Deploy to Vercel

Connect GitHub repo to Vercel.

Deploy production build.

---

# Phase 10 — Final Testing

---

## TASK-037 Test Case CRUD

Test:

create  
view  
update  
delete

---

## TASK-038 Test Timeline

Add multiple events.

Verify chronological display.

---

## TASK-039 Test File Upload

Upload:

image  
pdf  
document

Verify download.

---

## TASK-040 Test Search

Verify keyword search returns expected results.

---

# MVP Complete

After finishing TASK-001 → TASK-040 the system should support:

- Case management
- Event timeline
- Attachment uploads
- Case search
- Web deployment

---

# Phase 11 — AI Workflow Extension (Paused)

Goal: implement AI-assisted event extraction with mandatory human review.

Current state:

- AI functionality is disabled in the app while architecture changes are underway.
- Previous AI implementation artifacts have been removed from the runtime path.

---

# AI MVP Complete (Deferred)

AI work is deferred while the architecture is being redesigned.
