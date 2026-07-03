export type ManagementModuleMenuItem = {
    key: string;
    title: string;
    short_label: string;
    view_permission: string;
};

export type ManagementColumn = {
    key: string;
    label: string;
};

export type ManagementRow = {
    id: number;
    values: Record<string, string>;
};

export type ManagementPaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type ManagementFieldOption = {
    label: string;
    value: string | number | boolean;
    group?: string;
};

export type ManagementField = {
    name: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'boolean-select' | 'multi-checkbox';
    required: boolean;
    options?: ManagementFieldOption[];
};

export type ManagementFormValue = string | number | boolean | null | string[];

export type ManagementPayload = {
    module: {
        key: string;
        title: string;
        description: string;
        singular_label: string;
        search_placeholder: string;
    };
    modules: ManagementModuleMenuItem[];
    capabilities: {
        create: boolean;
        update: boolean;
        delete: boolean;
    };
    filters: {
        search: string;
        per_page: number;
        edit: number | null;
    };
    table: {
        columns: ManagementColumn[];
        rows: ManagementRow[];
        meta: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
            from: number | null;
            to: number | null;
            links: ManagementPaginationLink[];
        };
    };
    form: {
        mode: 'create' | 'edit';
        editing_id: number | null;
        title: string;
        description: string;
        submit_label: string;
        cancel_edit: boolean;
        fields: ManagementField[];
        values: Record<string, ManagementFormValue>;
    };
};
