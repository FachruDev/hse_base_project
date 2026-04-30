export type MasterDataModuleMenuItem = {
    key: string;
    title: string;
    short_label: string;
    view_permission: string;
};

export type MasterDataColumn = {
    key: string;
    label: string;
};

export type MasterDataRow = {
    id: number;
    values: Record<string, string>;
};

export type MasterDataPaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type MasterDataFieldOption = {
    label: string;
    value: string | number | boolean;
};

export type MasterDataField = {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'select' | 'boolean-select';
    required: boolean;
    placeholder?: string;
    options?: MasterDataFieldOption[];
};

export type MasterDataPayload = {
    module: {
        key: string;
        title: string;
        description: string;
        singular_label: string;
        search_placeholder: string;
    };
    modules: MasterDataModuleMenuItem[];
    capabilities: {
        manage: boolean;
    };
    filters: {
        search: string;
        per_page: number;
        edit: number | null;
    };
    table: {
        columns: MasterDataColumn[];
        rows: MasterDataRow[];
        meta: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
            from: number | null;
            to: number | null;
            links: MasterDataPaginationLink[];
        };
    };
    form: {
        mode: 'create' | 'edit';
        editing_id: number | null;
        title: string;
        description: string;
        submit_label: string;
        cancel_edit: boolean;
        fields: MasterDataField[];
        values: Record<string, string | number | boolean | null>;
    };
};
