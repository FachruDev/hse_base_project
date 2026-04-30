export type DashboardFormItem = {
    key: string;
    title: string;
    description: string;
    frequency: 'HARIAN' | 'MINGGUAN' | 'BULANAN' | string;
    filled_today: boolean;
    today_status: string | null;
    today_log_id: number | null;
    action_label: string;
};

export type DashboardPayload = {
    hero: {
        title: string;
        subtitle: string;
        today: string;
    };
    summary: {
        total_forms: number;
        due_today: number;
        draft_active: number;
        latest_status: string | null;
    };
    forms: DashboardFormItem[];
    viewer: {
        external_id: string | null | undefined;
        name: string | null | undefined;
    };
};

export type ListingPaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type ListingPaginationMeta = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: ListingPaginationLink[];
};

export type CatatanPengolahanLimbahAirListingRow = {
    id: number;
    tanggal: string | null;
    status: string;
    created_at: string | null;
    submitted_at: string | null;
};

export type CatatanPengolahanLimbahAirListingPayload = {
    module: {
        title: string;
        subtitle: string;
    };
    today_entry: {
        filled_today: boolean;
        status: string | null;
        log_id: number | null;
        action_label: string;
    };
    filters: {
        search: string;
        status: string;
        per_page: number;
    };
    table: {
        data: CatatanPengolahanLimbahAirListingRow[];
        meta: ListingPaginationMeta;
    };
};

export type ChecklistField = {
    id: number;
    name: string;
    category: string | null;
    standard_condition: string | null;
    status: string | null;
    note: string | null;
};

export type ProcessField = {
    id: number;
    name: string;
    standard_condition: string | null;
    input_type: string;
    value_text: string | null;
    value_number: number | null;
    note: string | null;
};

export type ProcessSectionField = {
    id: number;
    name: string;
    items: ProcessField[];
};

export type BatchField = {
    id: number;
    name: string;
    input_type: string;
};

export type BatchGroupValue = {
    item_id: number;
    value_text: string | null;
    value_number: number | null;
};

export type BatchGroup = {
    batch_no: number;
    values: BatchGroupValue[];
};

export type CatatanPengolahanLimbahAirEntryPayload = {
    module: {
        title: string;
        subtitle: string;
    };
    entry: {
        tanggal: string;
        operator: {
            name: string;
            external_id: string;
            department_name?: string | null;
        };
        mode: 'baru' | 'draft' | 'lihat' | string;
        status: string | null;
        log_id: number | null;
        action_label: string;
        read_only: boolean;
    };
    checklist: {
        template_id: number | null;
        template_name: string | null;
        items: ChecklistField[];
    };
    process: {
        template_id: number | null;
        template_name: string | null;
        sections: ProcessSectionField[];
    };
    batch: {
        items: BatchField[];
        groups: BatchGroup[];
    };
};
