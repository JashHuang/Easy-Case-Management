# AI Workflow Integration

Version: 1.1  
Last Updated: 2026-03-06

## 1. Purpose

This document is retained for future reference. AI workflow integration is currently disabled while the architecture is being redesigned.

## 2. Relationship Between AI Documents

- `AI Agent Workflow.md`: defines target workflow, contracts, and guardrails
- `AI Implementation Plan.md`: defines executable tasks and delivery phases
- `AI Workflow Integration.md` (this file): explains where and how those tasks attach to current system modules

## 3. Gap Analysis Against Current System

Current system capabilities:
- Case/event/attachment CRUD exists
- Attachment upload/download uses Cloudflare R2 (private) via Edge Functions
- Timeline rendering exists
- Role/status auth model exists

Missing capabilities for AI workflow:
- attachment AI lifecycle statuses
- `ai_results` persistence layer
- AI parser/extractor backend service
- review/approval UI for AI-generated events
- retry/failure observability for AI jobs

## 4. Integration Mapping

| Target Capability | Existing Anchor | Required New Work |
|---|---|---|
| Trigger AI on attachment | `FileUploader`, `CaseDetail` | add analysis action + async status refresh |
| Save draft AI output | Supabase DB | add `ai_results` table + RLS |
| Review AI timeline | `Timeline`/event UI patterns | add draft review component and editor |
| Commit approved events | existing `events` insert flow | add approval action + transactional write path |
| Failure/retry handling | current error UI patterns | add status badges, retry button, error details |

## 5. Suggested Integration Sequence

1. DB migration (`attachments` status fields + `ai_results`)
2. Backend parsing/extraction/validation pipeline
3. Frontend status display and AI trigger action
4. Review/approval UI and event write-back
5. End-to-end and security verification

## 6. Data and Security Alignment

- Continue using Supabase auth + RLS as source of authorization truth
- Keep AI provider secrets server-side only
- Treat model output as untrusted data until validated
- Preserve manual review gate in MVP

## 7. Completion Definition

Integration is complete only when:
- user can run AI analysis from attachment context
- system stores and displays draft output for review
- approved items become real rows in `events`
- failures are visible and retryable
- tests cover success and failure paths
