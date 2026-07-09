import type { LucideIcon } from 'lucide-react';
import {
    CalendarCog,
    CalendarDays,
    ClipboardCheck,
    ClipboardPenLine,
    Database,
    FileStack,
    Layers3,
    LayoutGrid,
    ListTodo,
    LockKeyhole,
    ShieldCheck,
    Users2,
    Workflow,
} from 'lucide-react';

export type DashboardNavTarget = 'dashboard' | 'catatan-pengolahan-limbah-air';
export type FormNavTarget =
    | 'catatan-pengolahan-limbah-air-create'
    | 'penyimpanan-limbah-b3-create'
    | 'catatan-pengolahan-limbah-air-index'
    | 'penyimpanan-limbah-b3-index';

export type DashboardNavItem = {
    key: string;
    label: string;
    icon: LucideIcon;
    target: DashboardNavTarget;
};

export type FormNavItem = {
    key: string;
    label: string;
    icon: LucideIcon;
    target: FormNavTarget;
    permission: string;
};

export type DashboardManagementItem = {
    key: string;
    label: string;
    icon: LucideIcon;
    module: string;
    permission?: string;
};

export type MasterDataNavItem = {
    key: string;
    label: string;
    icon: LucideIcon;
    module: string;
    permission: string;
};

export type ConfigurationNavItem = {
    key: string;
    label: string;
    icon: LucideIcon;
    target: 'configuration-weekend' | 'configuration-holiday';
    permission: string;
};

export const dashboardNavigation: DashboardNavItem[] = [
    {
        key: 'overview',
        label: 'Dashboard',
        icon: LayoutGrid,
        target: 'dashboard',
    },
];

export const formEntryNavigation: FormNavItem[] = [
    {
        key: 'catatan-pengolahan-limbah-air-create',
        label: 'Form IPAL Hari Ini',
        icon: ClipboardPenLine,
        target: 'catatan-pengolahan-limbah-air-create',
        permission: 'ipal.logs.create',
    },
    {
        key: 'penyimpanan-limbah-b3-create',
        label: 'Form B3 Hari Ini',
        icon: ClipboardPenLine,
        target: 'penyimpanan-limbah-b3-create',
        permission: 'b3storage.logs.create',
    },
];

export const formManagementNavigation: FormNavItem[] = [
    {
        key: 'catatan-pengolahan-limbah-air-index',
        label: 'Manage IPAL',
        icon: FileStack,
        target: 'catatan-pengolahan-limbah-air-index',
        permission: 'ipal.logs.view',
    },
    {
        key: 'penyimpanan-limbah-b3-index',
        label: 'Manage B3',
        icon: FileStack,
        target: 'penyimpanan-limbah-b3-index',
        permission: 'b3storage.monthly-report.view',
    },
];

export const masterDataNavigation: MasterDataNavItem[] = [
    {
        key: 'checklist-templates',
        label: 'Template Checklist',
        icon: ClipboardCheck,
        module: 'checklist-templates',
        permission: 'master.checklist.view',
    },
    {
        key: 'checklist-items',
        label: 'Item Checklist',
        icon: ListTodo,
        module: 'checklist-items',
        permission: 'master.checklist.view',
    },
    {
        key: 'process-templates',
        label: 'Template Proses',
        icon: Workflow,
        module: 'process-templates',
        permission: 'master.process.view',
    },
    {
        key: 'process-sections',
        label: 'Section Proses',
        icon: Layers3,
        module: 'process-sections',
        permission: 'master.process.view',
    },
    {
        key: 'process-items',
        label: 'Item Proses',
        icon: Database,
        module: 'process-items',
        permission: 'master.process.view',
    },
    {
        key: 'batch-sections',
        label: 'Section Batch',
        icon: Layers3,
        module: 'batch-sections',
        permission: 'master.batch.view',
    },
    {
        key: 'batch-items',
        label: 'Item Batch',
        icon: Database,
        module: 'batch-items',
        permission: 'master.batch.view',
    },
    {
        key: 'b3-waste-types',
        label: 'Jenis Limbah B3',
        icon: Database,
        module: 'b3-waste-types',
        permission: 'b3storage.master.view',
    },
    {
        key: 'b3-initiator-departments',
        label: 'Dept Inisiator B3',
        icon: Database,
        module: 'b3-initiator-departments',
        permission: 'b3storage.master.view',
    },
];

export const managementNavigation: DashboardManagementItem[] = [
    {
        key: 'users',
        label: 'User',
        icon: Users2,
        module: 'users',
        permission: 'admin.users.view',
    },
    {
        key: 'roles',
        label: 'Role',
        icon: ShieldCheck,
        module: 'roles',
        permission: 'admin.roles.view',
    },
    {
        key: 'permissions',
        label: 'Permission',
        icon: LockKeyhole,
        module: 'permissions',
        permission: 'admin.permissions.view',
    },
    {
        key: 'departments',
        label: 'Departemen',
        icon: LayoutGrid,
        module: 'departments',
        permission: 'admin.departments.view',
    },
];

export const configurationNavigation: ConfigurationNavItem[] = [
    {
        key: 'configuration-weekend',
        label: 'Edit Weekend',
        icon: CalendarCog,
        target: 'configuration-weekend',
        permission: 'config.weekend.view',
    },
    {
        key: 'configuration-holiday',
        label: 'Holiday',
        icon: CalendarDays,
        target: 'configuration-holiday',
        permission: 'config.holiday.view',
    },
];
