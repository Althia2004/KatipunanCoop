export interface AnnualMeetingKeyPoint {
    id: number;
    annual_meeting_id: number;
    type: 'discussion_point' | 'challenge';
    content: string;
}

export interface AnnualMeetingActionItem {
    id: number;
    annual_meeting_id: number;
    assignee_name: string;
    task: string;
}

export interface AnnualMeetingNextStep {
    id: number;
    annual_meeting_id: number;
    content: string;
}

export interface AnnualMeetingParticipant {
    id: number;
    annual_meeting_id: number;
    name: string;
    role: string;
}

export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled' | 'overdue';

export interface AnnualMeeting {
    id: number;
    topic: string;
    host: string;
    date: string;
    time_start: string;
    time_end: string | null;
    status: MeetingStatus;
    overview: string | null;
    is_pinned: boolean;
    key_points?: AnnualMeetingKeyPoint[];
    action_items?: AnnualMeetingActionItem[];
    next_steps?: AnnualMeetingNextStep[];
    participants?: AnnualMeetingParticipant[];
}

export interface AnnualMeetingStats {
    total: number;
    avgDuration: number | null;
    attendancePct: number;
    engagementPct: number;
}

export interface ChartDataPoint {
    week: string;
    meetings: number;
}
