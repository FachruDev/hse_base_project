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

export type CatatanPengolahanLimbahAirMonthlyRow = {
    month: number;
    year: number;
    period_label: string;
    checklist_days_count: number;
    process_logs_count: number;
    process_draft_count: number;
    process_pending_count: number;
    process_approved_count: number;
    batch_mixing_days_count: number;
    checklist_approval_status: 'APPROVED' | 'NOT_APPROVED' | string;
    checklist_approved_at: string | null;
    checklist_approved_by: string | null;
    process_approval_status: 'APPROVED' | 'NOT_APPROVED' | string;
    process_approved_at: string | null;
    process_approved_by: string | null;
    can_approve_period: boolean;
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
        year: number;
        per_page: number;
        date_from: string;
        date_to: string;
    };
    capabilities: {
        can_approve_process_monthly: boolean;
        can_reopen_process_monthly: boolean;
    };
    table: {
        data: CatatanPengolahanLimbahAirMonthlyRow[];
    };
};

export type ChecklistField = {
    id: number;
    name: string;
    category: string | null;
    standard_condition: string | null;
    status: string | null;
    status_label: string | null;
    note: string | null;
    attachment_url?: string | null;
    attachment_original_name?: string | null;
};

export type ProcessField = {
    id: number;
    name: string;
    standard_condition: string | null;
    input_type: string;
    value_text: string | null;
    value_number: number | null;
    note: string | null;
    attachment_url?: string | null;
    attachment_original_name?: string | null;
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

export type BatchSectionField = {
    id: number;
    name: string;
    items: BatchField[];
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
        read_only: boolean;
        items: ChecklistField[];
    };
    process: {
        template_id: number | null;
        template_name: string | null;
        read_only: boolean;
        sections: ProcessSectionField[];
    };
    batch: {
        max_batch_no: number;
        sections: BatchSectionField[];
        groups: BatchGroup[];
    };
    capabilities: {
        approve_daily_process: boolean;
        reopen_daily_process?: boolean;
    };
};

export type IpalMonthlyChecklistCell = {
    date: string;
    day: number;
    status: string | null;
    status_label: string | null;
    operators: string[];
    notes: string[];
    details: Array<{
        operator: string | null;
        status: string | null;
        status_label: string | null;
        note: string | null;
        attachment_url: string | null;
        attachment_original_name: string | null;
    }>;
};

export type IpalMonthlyChecklistRow = {
    item_id: number;
    name: string;
    standard_condition: string | null;
    cells: IpalMonthlyChecklistCell[];
};

export type IpalMonthlyProcessRow = {
    id: number;
    tanggal: string | null;
    operator: {
        name: string | null;
        external_id: string | null;
        department_name: string | null;
    };
    status: string;
    submitted_at: string | null;
    checked_by: string | null;
    checked_at: string | null;
    has_batch_mixing: boolean;
    batch_count: number;
};

export type IpalMonthlyDetailPayload = {
    module: {
        title: string;
        subtitle: string;
    };
    period: {
        month: number;
        year: number;
        label: string;
        days: Array<{
            date: string;
            day: number;
        }>;
    };
    summary: {
        checklist_days_count: number;
        process_logs_count: number;
        batch_mixing_logs_count: number;
        checklist_approval_status: string;
    };
    checklist_matrix: IpalMonthlyChecklistRow[];
    process_rows: IpalMonthlyProcessRow[];
    approval: {
        status: string;
        approved_at: string | null;
        approved_by: {
            id: number | null;
            name: string | null;
            external_id: string | null;
            role_label: string;
        };
    };
    capabilities: {
        approve_checklist: boolean;
        can_approve_period: boolean;
    };
};

export type B3StorageMonthlyListingRow = {
    month: number;
    year: number;
    period_label: string;
    total_logs_count: number;
    incoming_logs_count: number;
    outgoing_logs_count: number;
    total_weight_kg: number;
    waste_types_count: number;
    departments_count: number;
    approval_status: 'NOT_SUBMITTED' | 'PARTIALLY_APPROVED' | 'APPROVED' | string;
    approval_status_label: string;
    environment_supervisor: string | null;
    environment_supervisor_signed_at: string | null;
    hse_department_head: string | null;
    hse_department_head_signed_at: string | null;
    can_approve_period: boolean;
    can_approve_monthly: boolean;
    next_approval_role: 'ENVIRONMENT_SUPERVISOR' | 'HSE_DEPARTMENT_HEAD' | null;
    next_approval_label: string | null;
    approval_blocked_label: string | null;
};

export type B3StorageLogListingPayload = {
    module: {
        title: string;
        subtitle: string;
    };
    filters: {
        search: string;
        status: string;
        year: number;
        date_from: string;
        date_to: string;
    };
    capabilities: {
        create_log: boolean;
        can_approve_b3_monthly: boolean;
    };
    table: {
        data: B3StorageMonthlyListingRow[];
    };
};

export type B3StorageMonthlyReportRow = {
    no: number;
    id: number;
    movement_type: 'MASUK' | 'KELUAR';
    movement_date: string | null;
    tanggal_masuk: string | null;
    tanggal_keluar: string | null;
    jam: string | null;
    waste_type_name: string | null;
    weight_kg: string | number;
    weights_by_waste_type: Record<string, string | number | null>;
    weight_other: string | number | null;
    waste_type_other: string | null;
    document_number: string;
    initiator_department: string | null;
    initiator_user_id: number | null;
    initiator_user_name: string | null;
    operator_name: string | null;
    photo_path: string | null;
    note: string | null;
    created_at: string | null;
};

export type B3StorageMonthlyDetailPayload = {
    module: {
        title: string;
        subtitle: string;
    };
    period: {
        month: number;
        year: number;
        label: string;
        date_from: string;
        date_to: string;
    };
    filters: {
        date_from: string;
        date_to: string;
    };
    summary: {
        total_logs_count: number;
        incoming_logs_count: number;
        outgoing_logs_count: number;
        total_weight_kg: string | number;
        departments_count: number;
    };
    columns: {
        waste_types: Array<{
            id: number;
            name: string;
            order_no: number;
        }>;
        has_other_column: boolean;
    };
    rows: B3StorageMonthlyReportRow[];
    totals: {
        by_waste_type: Record<string, string | number>;
        other: string | number;
        overall: string | number;
    };
    approval: {
        status: string;
        status_label: string;
        environment_supervisor: {
            id: number | null;
            name: string | null;
            signed_at: string | null;
        };
        hse_department_head: {
            id: number | null;
            name: string | null;
            signed_at: string | null;
        };
        note: string | null;
    };
    capabilities: {
        can_approve_period: boolean;
        approve_monthly: boolean;
        next_approval_role: 'ENVIRONMENT_SUPERVISOR' | 'HSE_DEPARTMENT_HEAD' | null;
        next_approval_label: string | null;
        approval_blocked_reason: string | null;
    };
};

export type B3StorageOption = {
    value: string | number;
    label: string;
};

export type B3StorageEntryPayload = {
    module: {
        title: string;
        subtitle: string;
    };
    entry: {
        tanggal_default: string;
        jam_default: string;
        operator: {
            name: string;
            external_id: string;
            department_name?: string | null;
        };
    };
    options: {
        movement_types: B3StorageOption[];
        waste_types: B3StorageOption[];
        initiator_departments: B3StorageOption[];
    };
};
