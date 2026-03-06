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

export interface Attachment {
    id: string;
    case_id: string;
    event_id?: string;
    file_name: string;
    file_url: string;
    file_type: string;
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
