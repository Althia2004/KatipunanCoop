export type UserRole = 'admin_staff' | 'board_of_directors';

export const ROLE_LABELS: Record<UserRole, string> = {
    admin_staff: 'Admin Staff',
    board_of_directors: 'Board of Directors',
};

export type User = {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
