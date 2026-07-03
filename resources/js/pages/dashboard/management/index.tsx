import { Head, usePage } from '@inertiajs/react';

import { DashboardShell } from '@/modules/dashboard/components/dashboard-shell';
import { ManagementPage } from '@/modules/management/components/management-page';
import type { ManagementPayload } from '@/modules/management/types';
import type { PageProps } from '@/types';

type ManagementIndexPageProps = PageProps<{
    management: ManagementPayload;
}>;

export default function ManagementIndexPage() {
    const { auth, flash, management, name } = usePage<ManagementIndexPageProps>().props;

    if (auth.user === null) {
        return null;
    }

    return (
        <>
            <Head title={management.module.title} />
            <DashboardShell
                appName={name}
                permissions={auth.permissions}
                roles={auth.roles}
                userId={auth.user.external_id}
                userName={auth.user.name}
                departmentName={auth.user.department?.name}
            >
                <ManagementPage flash={flash} management={management} userId={auth.user.external_id} />
            </DashboardShell>
        </>
    );
}
