import type { PropsWithChildren } from 'react';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/modules/dashboard/components/dashboard-sidebar';
import { DashboardTopbar } from '@/modules/dashboard/components/dashboard-topbar';

type DashboardShellProps = PropsWithChildren<{
    appName: string;
    permissions: string[];
    roles: string[];
    userId: string;
    userName: string;
    departmentName?: string | null;
}>;

export function DashboardShell({
    appName,
    permissions,
    roles,
    userId,
    userName,
    departmentName,
    children,
}: DashboardShellProps) {
    return (
        <SidebarProvider>
            <DashboardSidebar appName={appName} permissions={permissions} userId={userId} />
            <SidebarInset>
                <DashboardTopbar appName={appName} userName={userName} departmentName={departmentName} roles={roles} />
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
