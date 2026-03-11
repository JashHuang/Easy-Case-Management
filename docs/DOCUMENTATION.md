# Documentation Index

## Core Documents

### 1. **PRD.md** - Product Requirements Document
- Product goals and scope
- User scenarios and core features
- MVP boundary (current baseline)

### 2. **TechDesign.md** - Technical Design
- Current architecture and stack
- Database/storage design
- Security model (Auth + RLS)

### 3. **TASKS.md** - MVP Development Tasks
- TASK-001 to TASK-040
- Implemented baseline capabilities

## AI Documents

### 4. **AI Agent Workflow.md** - AI Workflow Specification
- Target AI processing flow
- Agent/service responsibilities
- Data contracts and review gate
- Security and observability requirements

### 5. **AI Implementation Plan.md** - AI Delivery Plan
- Planned phase-by-phase execution
- Task list for schema/backend/frontend/testing
- MVP exit criteria for AI features

### 6. **AI Workflow Integration.md** - Integration Guide
- Gap analysis vs current codebase
- Mapping from target capability to implementation anchors
- Suggested sequencing and completion definition

### 7. **R2_MIGRATION_GUIDE.md** - R2 遷移操作指南
- 遷移策略（保留舊檔 / 完整切換）
- 建議流程與回滾策略


## Quick Reference

### Current System Flow (Implemented)

```text
Frontend (React + Vite)
  -> Supabase SDK + Edge Functions
  -> Supabase Auth / Postgres
  -> Cloudflare R2 (Private Storage)
```

### AI Workflow (Disabled)

AI workflow is currently disabled while architecture changes are underway.

## Recommended Reading Order

1. `PRD.md`
2. `TechDesign.md`
3. `TASKS.md`
4. `AI Agent Workflow.md`
5. `AI Implementation Plan.md`
6. `AI Workflow Integration.md`
