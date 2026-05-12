export type WeekendConfigurationRow = {
    id: number;
    day_of_week_iso: number;
    day_name: string;
    is_off: boolean;
};

export type WeekendConfigurationPayload = {
    module: {
        title: string;
        description: string;
    };
    capabilities: {
        manage: boolean;
    };
    rows: WeekendConfigurationRow[];
};

export type HolidayConfigurationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type HolidayConfigurationPayload = {
    module: {
        title: string;
        description: string;
    };
    capabilities: {
        manage: boolean;
    };
    filters: {
        search: string;
        per_page: number;
        edit: number | null;
    };
    table: {
        rows: Array<{
            id: number;
            holiday_date: string | null;
            name: string;
            description: string | null;
            status: string;
            is_active: boolean;
        }>;
        meta: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
            from: number | null;
            to: number | null;
            links: HolidayConfigurationLink[];
        };
    };
    form: {
        mode: 'create' | 'edit';
        editing_id: number | null;
        title: string;
        submit_label: string;
        cancel_edit: boolean;
        values: {
            holiday_date: string;
            name: string;
            description: string;
            is_active: boolean;
        };
    };
};
