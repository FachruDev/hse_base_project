import { Head, usePage } from '@inertiajs/react';

import { DashboardOverview } from '@/modules/dashboard/components/dashboard-overview';
import { DashboardShell } from '@/modules/dashboard/components/dashboard-shell';
import type { DashboardPayload } from '@/modules/dashboard/types';
import type { PageProps } from '@/types';

type DashboardPageProps = PageProps<{
    dashboard: DashboardPayload;
}>;

export default function DashboardPage() {
    const { auth, dashboard, name } = usePage<DashboardPageProps>().props;

    if (auth.user === null) {
        return null;
    }

    return (
        <>
            <Head title="Dashboard" />
            <DashboardShell
                appName={name}
                permissions={auth.permissions}
                roles={auth.roles}
                userId={auth.user.external_id}
                userName={auth.user.name}
                departmentName={auth.user.department?.name}
            >
                <DashboardOverview dashboard={dashboard} permissions={auth.permissions} />
            </DashboardShell>
        </>
    );
}
