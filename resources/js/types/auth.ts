export type User = {
    id: number;
    external_id: string;
    name: string;
    department?: {
        id: number;
        name: string;
    } | null;
    is_active: boolean;
    created_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User | null;
    roles: string[];
    permissions: string[];
};
