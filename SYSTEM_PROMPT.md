# SYSTEM_PROMPT.md
AI Development System Prompt  
Case Management System

This file defines the **system-level instructions** for AI agents working on this repository.

The goal is to guide AI tools to generate consistent, maintainable, and production-ready code.

---

# 1. Project Context

This repository contains a **Case Management System** web application.

The system allows users to:

- create and manage cases
- track events in a timeline
- upload attachments (documents, photos)
- search cases and events

The application is intentionally **lightweight** and designed as an **MVP product**.

Target scale:

- < 500 cases
- < 5000 attachments

Avoid overengineering.

---

# 2. Technology Stack

Frontend:

- React
- Vite
- TailwindCSS

Backend:

- Supabase (BaaS)

Database:

- PostgreSQL (Supabase)

Storage:

- Supabase Storage

Deployment:

- Vercel

The system should **avoid creating a custom backend server unless absolutely necessary**.

Prefer using Supabase APIs.

---

# 3. Development Principles

AI agents should follow these principles.

### 3.1 Simplicity First

Prefer simple implementations.

Avoid:

- complex architecture
- unnecessary abstraction
- microservices

---

### 3.2 Maintainable Code

Generated code should be:

- readable
- modular
- documented
- easy to extend

---

### 3.3 React Best Practices

Use:

- functional components
- hooks
- component-based architecture

Avoid:

- class components
- deeply nested components
- unnecessary state management libraries

---

### 3.4 Tailwind Usage

Use TailwindCSS for styling.

Guidelines:

- prefer utility classes
- keep styles inline in JSX
- avoid creating separate CSS files unless necessary

---

# 4. UI Design Principles

The UI should prioritize:

- clarity
- simplicity
- minimal design

Primary layout:

Case List  
→ Case Detail  
→ Timeline + Attachments

Pages should be responsive but primarily optimized for **desktop usage**.

---

# 5. Core Features

The MVP must implement the following features.

### Case Management

Users can:

- create case
- edit case
- delete case
- view case

---

### Event Timeline

Each case contains multiple events.

Events should display chronologically.

Example:

2025-01-01  
Case created

2025-01-05  
Meeting notes

2025-01-10  
Evidence uploaded

---

### Attachments

Users can upload files.

Supported types:

- images
- pdf
- documents

Files must be stored in **Supabase Storage**.

---

### Search

Search must support keyword search across:

- case name
- title
- summary
- description
- event description

MVP implementation:

PostgreSQL ILIKE.

---

# 6. Database Model

Tables:

cases

fields:

- id (uuid)
- name
- title
- summary
- description
- status
- created_at
- updated_at

---

events

fields:

- id
- case_id
- title
- description
- event_date
- created_at

relationship:

events.case_id → cases.id

---

attachments

fields:

- id
- case_id
- event_id
- file_name
- file_url
- file_type
- created_at

---

# 7. Repository Structure

Recommended structure:

src/

pages/
- CaseList
- CaseDetail
- CaseCreate

components/
- CaseCard
- Timeline
- EventItem
- AttachmentList
- SearchBar

services/
- supabaseClient
- caseService

hooks/
utils/

---

# 8. File Upload Flow

File upload process:

1. user selects file
2. frontend uploads file to Supabase Storage
3. receive file URL
4. insert metadata into attachments table

---

# 9. Timeline Rendering

Timeline should be rendered on frontend.

Steps:

1. fetch events for case
2. sort by event_date
3. render timeline UI

---

# 10. Security

Use Supabase Auth for authentication.

Use Row Level Security (RLS) to protect database tables.

Use signed URLs when accessing private files.

---

# 11. Coding Style

Use:

- clear naming conventions
- descriptive variable names
- small reusable components

Avoid:

- global state unless necessary
- unnecessary libraries
- complex patterns

---

# 12. Future Extensions

AI agents should design code so the system can later support:

- AI case summaries
- OCR for uploaded documents
- tagging system
- advanced search
- multi-user collaboration

---

# 13. AI Agent Behavior

When generating code:

1. Read PRD.md and TechDesign.md first.
2. Follow the architecture defined in TechDesign.md.
3. Do not introduce new frameworks without justification.
4. Prefer incremental improvements over large rewrites.

If uncertain:

choose the **simplest solution**.

---

# 14. Development Priority

Focus on implementing:

1. Case CRUD
2. Event CRUD
3. File upload
4. Case search
5. Timeline UI

Everything else is secondary.