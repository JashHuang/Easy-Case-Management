# PRD.md
Case Management System – Product Requirements Document

Version: 1.0  
Date: 2026-03-05

---

# 1. Product Overview

The Case Management System is a lightweight web application designed to help users record and manage cases, track events, and store related evidence or documents.

The system provides a centralized place to manage:

- case information
- event timelines
- attachments
- searchable records

---

# 2. Product Goals

Primary goals:

1. Organize case information in a structured way
2. Track case developments using a timeline
3. Store evidence and documents
4. Enable fast case retrieval via search

---

# 3. Target Users

Primary users include:

- investigators
- case managers
- researchers
- administrators

Typical user needs:

- record case details
- track chronological events
- store evidence
- search historical records

---

# 4. User Scenarios

## Scenario 1: Create Case

User creates a new case and enters:

- case name
- title
- summary
- description

System stores the case and assigns an ID.

---

## Scenario 2: Add Event

User adds an event to a case.

Example:

Case A  
  - 2025-01-01 Case created  
  - 2025-01-05 Meeting record  
  - 2025-01-10 Evidence added

---

## Scenario 3: Upload Attachments

User uploads files such as:

- PDF
- images
- documents

Files are linked to a case or event.

---

## Scenario 4: Search Case

User enters a keyword.

System searches across:

- case name
- title
- summary
- description
- event content

---

## Scenario 5: View Timeline

System displays events chronologically in a timeline view.

---

# 5. Core Features

## Case Management

Users can:

- create case
- edit case
- delete case
- view case

---

## Event Management

Users can:

- add event
- edit event
- delete event

Events belong to a case.

---

## Attachment Management

Supported file types:

- PDF
- DOC
- JPG
- PNG

Users can:

- upload
- download
- preview
- delete

---

## Search

Search must support keyword queries across case and event content.

---

## Timeline

Events must be displayed in chronological order.

---

# 6. Non-Functional Requirements

Performance:

- page load < 2 seconds
- search < 1 second

Usability:

- simple UI
- desktop browser support

Security:

- user authentication
- controlled file access

---

# 7. MVP Scope

Included:

- case CRUD
- event CRUD
- attachment upload
- case search
- timeline view

Excluded:

- AI features
- OCR
- advanced permissions
- workflow automation

---

# 8. Success Metrics

The MVP is successful if users can:

- create and manage cases
- track events
- upload evidence
- retrieve cases via search