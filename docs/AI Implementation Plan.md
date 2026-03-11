# AI Agent Workflow Implementation Plan

Version: 1.1  
Last Updated: 2026-03-06
Status: Deferred

## 1. Goal

Implement AI-assisted event extraction on top of the current Easy Case Management baseline, with mandatory human review before writing to `events`.

Note: AI workflow is currently disabled while the architecture is being redesigned.

## 2. Current Baseline (Already Exists)

- Case/Event/Attachment core CRUD in frontend
- Cloudflare R2 private storage upload/download flow
- Auth with role/status model in `profiles`
- Case detail page already displays events and attachments

## 3. Implementation Strategy

Use incremental delivery with verifiable checkpoints:
- Phase A: schema + trigger plumbing
- Phase B: parsing/extraction backend
- Phase C: review UI + approval write-back
- Phase D: quality, security, observability

## 4. Planned Tasks

## Phase A - Data Model and Trigger

### TASK-AI-001 Add AI status fields to `attachments`
- Add columns: `status`, `ai_processed_at`, `ai_error`
- Backfill default status for existing rows

### TASK-AI-002 Create `ai_results` table
- Store raw model output, normalized draft, review status, metadata
- Add indexes on `attachment_id`, `case_id`, `review_status`

### TASK-AI-003 RLS policies for AI tables/columns
- Ensure only authorized users can read/write AI draft data
- Admin/service role rules for worker updates

### TASK-AI-004 Trigger entrypoint design
- Define how AI job starts: manual button first, async trigger second
- Keep UI responsive (non-blocking)

## Phase B - AI Processing Backend

### TASK-AI-005 Implement document parser service
- PDF/image/doc/text parsing
- Output normalized text segments

### TASK-AI-006 Implement extraction service
- LLM prompt + strict JSON schema response
- Retry and timeout handling

### TASK-AI-007 Implement normalization + validation service
- Date normalization
- Required-field validation
- Duplicate detection hints
- Confidence threshold policy

### TASK-AI-008 Persist draft result
- Save parser/extractor output into `ai_results`
- Update `attachments.status` to `review_ready` or `failed`

## Phase C - Frontend Review and Approval

### TASK-AI-009 Add AI actions in case detail attachment section
- Trigger analysis
- Show processing/review/failed status badges

### TASK-AI-010 Build AI timeline review component
- Render candidate events from `ai_results.normalized_output`
- Edit/delete candidate events before approval

### TASK-AI-011 Approval write-back
- On approve, write selected events into `events`
- Mark `ai_results.review_status = approved`
- Update `attachments.status = approved`

### TASK-AI-012 Reject/Retry workflow
- Reject keeps draft history but blocks insert
- Retry restarts processing and writes new draft version

## Phase D - Quality and Operations

### TASK-AI-013 End-to-end tests
- File upload -> analysis -> review -> approve -> event inserted
- Failure scenarios (invalid output, parse failure)

### TASK-AI-014 Security tests
- Verify RLS boundaries for non-owner/non-admin access
- Verify no client-side access to model secrets

### TASK-AI-015 Observability metrics
- Processing duration
- Error/retry rate
- Manual correction ratio

## 5. Integration Points with Existing Code

- Existing page: `src/pages/CaseDetail.tsx`
- Existing uploader: `src/components/FileUploader.tsx`
- Existing timeline/event model: `src/components/Timeline.tsx`, `src/types/database.ts`
- Existing auth/role guard: `src/context/AuthContext.tsx`

AI UI and actions should be integrated into current case detail flow first, not introduced as a separate top-level module.

## 6. Deployment Notes

Recommended:
- Server-side AI execution via Supabase Edge Functions or dedicated backend worker
- Keep model/provider keys in server runtime only
- Start with single worker, then scale concurrency if needed

## 7. MVP Exit Criteria

MVP completes when all are true:
- AI draft can be generated from uploaded attachments
- User can review/edit before approval
- Approved results are persisted to `events`
- Failure/retry path is visible and usable
- Security constraints validated
