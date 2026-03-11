export interface Case {
    id: string;
    name: string;
    title: string;
    summary: string;
    description: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface CaseEvent {
    id: string;
    case_id: string;
    title: string;
    description: string;
    event_date: string;
    created_at: string;
}

export type AttachmentAIStatus =
    | 'uploaded'
    | 'pending_ai'
    | 'processing'
    | 'review_ready'
    | 'approved'
    | 'rejected'
    | 'failed';

export interface Attachment {
    id: string;
    case_id: string;
    event_id?: string;
    file_name: string;
    file_url: string;
    file_type: string;
    storage_provider?: string;
    storage_key?: string | null;
    status?: AttachmentAIStatus;
    ai_processed_at?: string | null;
    ai_error?: string | null;
    created_at: string;
}

export type UserRole = 'admin' | 'user';
export type UserStatus = 'pending' | 'active' | 'rejected';

export interface Profile {
    id: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    created_at: string;
}

export type AIReviewStatus = 'pending' | 'approved' | 'rejected';

export interface AIExtractedEvent {
    event_date: string;
    title: string;
    description: string;
    source_ref?: string;
    confidence?: number;
    needs_review?: boolean;
}

export interface AIResult {
    id: string;
    attachment_id: string;
    case_id: string;
    raw_output: Record<string, unknown>;
    normalized_output: {
        summary?: string;
        events?: AIExtractedEvent[];
    };
    review_status: AIReviewStatus;
    model_name?: string | null;
    avg_confidence?: number | null;
    error_message?: string | null;
    created_at: string;
    updated_at: string;
}
