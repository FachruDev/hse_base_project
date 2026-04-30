import type { LucideIcon } from 'lucide-react';
import { ClipboardPenLine, LayoutGrid, LockKeyhole, ShieldCheck, Users2 } from 'lucide-react';

export type DashboardNavItem = {
    key: string;
    label: string;
    icon: LucideIcon;
    target: 'dashboard' | 'catatan-pengolahan-limbah-air';
};

export type DashboardManagementItem = {
    key: string;
    label: string;
    icon: LucideIcon;
    sectionId: string;
    permission?: string;
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
