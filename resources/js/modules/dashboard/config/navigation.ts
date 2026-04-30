import type { LucideIcon } from 'lucide-react';
import {
    ClipboardCheck,
    ClipboardPenLine,
    Database,
    Layers3,
    LayoutGrid,
    ListTodo,
    LockKeyhole,
    ShieldCheck,
    Users2,
    Workflow,
} from 'lucide-react';

export type DashboardNavTarget = 'dashboard' | 'catatan-pengolahan-limbah-air';

export type DashboardNavItem = {
    key: string;
    label: string;
    icon: LucideIcon;
    target: DashboardNavTarget;
};

export type DashboardManagementItem = {
    key: string;
    label: string;
    icon: LucideIcon;
    sectionId: string;
    permission?: string;
};

export type MasterDataNavItem = {
    key: string;
    label: string;
    icon: LucideIcon;
    module: string;
    permission: string;
};

export const dashboardNavigation: DashboardNavItem[] = [
    {
        key: 'overview',
        label: 'Dashboard',
        icon: LayoutGrid,
        target: 'dashboard',
    },
    {
        key: 'forms',
        label: 'Form',
        icon: ClipboardPenLine,
        target: 'catatan-pengolahan-limbah-air',
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
        key: 'batch-items',
        label: 'Item Batch',
        icon: Database,
        module: 'batch-items',
        permission: 'master.batch.view',
    },
];

export const managementNavigation: DashboardManagementItem[] = [
    {
        key: 'users',
        label: 'User',
        icon: Users2,
        sectionId: 'management-user',
        permission: 'admin.users.view',
    },
    {
        key: 'roles',
        label: 'Role',
        icon: ShieldCheck,
        sectionId: 'management-role',
        permission: 'admin.roles.view',
    },
    {
        key: 'permissions',
        label: 'Permission',
        icon: LockKeyhole,
        sectionId: 'management-permission',
        permission: 'admin.permissions.view',
    },
    {
        key: 'departments',
        label: 'Departemen',
        icon: LayoutGrid,
        sectionId: 'management-departemen',
        permission: 'admin.users.view',
    },
];
