export interface Participant {
    id: number;
    name: string;
    email: string;
    attended: boolean;
    attended_at?: string; // Optional field
}

export interface Seminar {
    id: number;
    title: string;
    description?: string;
    speaker_name?: string;
    scheduled_at: string;
    location: string;
    capacity: number;
    registered: number;
    status: 'draft' | 'upcoming' | 'ongoing' | 'completed';
    participants?: Participant[];
}