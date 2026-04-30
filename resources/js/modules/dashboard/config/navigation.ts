import type { LucideIcon } from 'lucide-react';
import { ClipboardList, Gauge, ShieldCheck, SlidersHorizontal, Users2 } from 'lucide-react';

export type DashboardNavItem = {
    key: string;
    label: string;
    description: string;
    icon: LucideIcon;
    permission?: string;
    sectionId: string;
};

export const dashboardNavigation: DashboardNavItem[] = [
    {
        key: 'overview',
        label: 'Dashboard',
        description: 'Ringkasan operasional dan status terkini.',
        icon: Gauge,
        sectionId: 'overview',
    },
    {
        key: 'ipal',
        label: 'Log IPAL',
        description: 'Input dan monitoring log harian IPAL.',
        icon: ClipboardList,
        permission: 'ipal.logs.view',
        sectionId: 'operasi-terkini',
    },
    {
        key: 'master',
        label: 'Master Data',
        description: 'Template checklist, proses, dan batch.',
        icon: SlidersHorizontal,
        permission: 'master.process.view',
        sectionId: 'akses-modul',
    },
    {
        key: 'approval',
        label: 'Approval',
        description: 'Persetujuan supervisor untuk log submitted.',
        icon: ShieldCheck,
        permission: 'ipal.logs.approve',
        sectionId: 'approval',
    },
    {
        key: 'admin',
        label: 'Administrasi',
        description: 'Pengaturan user, role, dan permission.',
        icon: Users2,
        permission: 'admin.users.view',
        sectionId: 'administrasi',
    },
];
