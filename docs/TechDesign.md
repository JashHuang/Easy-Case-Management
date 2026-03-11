# TechDesign.md
Case Management System – Technical Design

Version: 1.0  
Date: 2026-03-05

---

# 1. Architecture Overview

The system follows a **Frontend + Backend-as-a-Service architecture**.

Frontend:
React + Vite + TailwindCSS

Backend:
Supabase

Database:
PostgreSQL

Storage:
Cloudflare R2 (Private)

Deployment:
Vercel

Architecture flow:

Browser
 ↓
React Frontend
 ↓
Supabase SDK + Edge Functions
 ↓
Supabase Platform (PostgreSQL, Auth)
 ↓
Cloudflare R2 (Private Object Storage)

---

# 2. Frontend Design

Framework:

React + Vite

Styling:

TailwindCSS

---

## Directory Structure

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

utils/

---

# 3. Database Schema

## cases

fields:

id (uuid)  
name (text)  
title (text)  
summary (text)  
description (text)  
status (text)  
created_at (timestamp)  
updated_at (timestamp)

---

## events

fields:

id (uuid)  
case_id (uuid)  
title (text)  
description (text)  
event_date (date)  
created_at (timestamp)

relationship:

events.case_id → cases.id

---

## attachments

fields:

id (uuid)  
case_id (uuid)  
event_id (uuid)  
file_name (text)  
file_url (text)  
file_type (text)  
storage_provider (text)  
storage_key (text)  
created_at (timestamp)

---

# 4. Storage Design

Files stored in Cloudflare R2 (private).

Recommended structure:

case-id/
  uuid/
    file1.jpg
    file2.pdf

---

# 5. Search Implementation

MVP search uses PostgreSQL text matching.

Example:

ILIKE '%keyword%'

Search fields:

- case name
- title
- summary
- description
- event description

---

# 6. Timeline Implementation

Timeline is generated on frontend.

Process:

1. fetch events
2. sort by event_date
3. render timeline UI

---

# 7. File Upload Flow

User uploads file

↓
Frontend requests signed PUT URL from Supabase Edge Function

↓
Frontend uploads to R2 via signed URL

↓
Insert record into attachments table (storage_key + provider)

# 7.1 File Download Flow

User clicks download/open

↓
Frontend requests signed GET URL from Supabase Edge Function

↓
Browser opens or downloads file

---

# 8. Deployment

Frontend deployment:

Vercel

Pipeline:

GitHub → Vercel → Production

Backend:

Supabase Cloud

---

# 9. Security

Authentication:

Supabase Auth

Database protection:

Row Level Security (RLS)

File access:

Signed URL

---

# 10. Future Architecture

Possible upgrades:

Add backend service:

FastAPI / NestJS

Advanced search:

Meilisearch / Elasticsearch

AI features:

- case summary
- document OCR
- AI event extraction
