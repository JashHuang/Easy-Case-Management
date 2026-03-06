# AGENT.md
Case Management System – AI Development Guide

This document provides context and rules for AI coding agents working on this repository.

The goal is to help the AI understand the system architecture, product requirements, and coding standards.

---

# 1. Project Overview

This project is a **Case Management System** designed to manage and track cases, events, and related attachments.

Core capabilities include:

- Case management
- Event timeline tracking
- File attachments (documents, photos)
- Keyword search
- Timeline visualization

The system is designed as a **lightweight web application**.

Target usage:

- incident tracking
- investigation records
- legal case documentation
- project event tracking

---

# 2. System Architecture

The system uses a **Frontend + BaaS architecture**.

Frontend:
- React
- Vite
- TailwindCSS

Backend:
- Supabase (BaaS)

Database:
- PostgreSQL (Supabase)

Storage:
- Supabase Object Storage

Deployment:
- Vercel (frontend)

Architecture overview:

Browser
  ↓
React Web App
  ↓
Supabase SDK
  ↓
Supabase Platform
  ├ Database (PostgreSQL)
  └ Storage

---

# 3. Core Data Models

## Case

Fields:

- id (uuid)
- name
- title
- summary
- description
- status
- created_at
- updated_at

---

## Event

Fields:

- id
- case_id
- title
- description
- event_date
- created_at

Relationship:

event.case_id → case.id

---

## Attachment

Fields:

- id
- case_id
- event_id (optional)
- file_name
- file_url
- file_type
- created_at

Attachments can belong to:

- a case
- an event

---

# 4. Main Features

## Case Management

Users can:

- create case
- edit case
- delete case
- view case

---

## Event Timeline

Each case contains multiple events.

Events should be displayed in **chronological order**.

Timeline example:

2025-01-01  
Case created

2025-01-05  
Meeting record

2025-01-10  
Evidence uploaded

---

## Attachments

Users can upload:

- documents
- photos
- other files

Files are stored in **Supabase Storage**.

---

## Search

Search should support:

- case name
- title
- summary
- description
- event description

Implementation (MVP):

PostgreSQL ILIKE.

---

# 5. Frontend Structure

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

# 6. Coding Guidelines

General principles:

1. Keep code simple.
2. Prefer reusable React components.
3. Avoid unnecessary abstraction.
4. Follow consistent naming conventions.

---

# 7. Development Priorities

The MVP should focus on:

1. Case CRUD
2. Event CRUD
3. Attachment upload
4. Case search
5. Timeline UI

Do NOT implement advanced features initially.

---

# 8. Future Extensions

Possible future features:

- AI case summary
- OCR for documents
- tagging system
- advanced search
- multi-user permissions

Agents should design code to allow future extensibility.

---

# 9. Constraints

System scale:

- cases < 500
- attachments < 5000

Therefore:

- simple architecture is preferred
- avoid microservices
- avoid heavy infrastructure

---

# 10. Agent Instructions

When generating code:

- follow React + Vite conventions
- use functional components
- use TailwindCSS for styling
- interact with Supabase via official SDK

Always prefer:

clarity > complexity