import { Head, usePage } from '@inertiajs/react';

import { DashboardShell } from '@/modules/dashboard/components/dashboard-shell';
import { MasterDataPage } from '@/modules/master-data/components/master-data-page';
import type { MasterDataPayload } from '@/modules/master-data/types';
import type { PageProps } from '@/types';

type MasterDataIndexPageProps = PageProps<{
    masterData: MasterDataPayload;
}>;

export default function MasterDataIndexPage() {
    const { auth, flash, masterData, name } = usePage<MasterDataIndexPageProps>().props;

    if (auth.user === null) {
        return null;
    }

    return (
        <>
            <Head title={masterData.module.title} />
            <DashboardShell
                appName={name}
                permissions={auth.permissions}
                roles={auth.roles}
                userId={auth.user.external_id}
                userName={auth.user.name}
                departmentName={auth.user.department?.name}
            >
                <MasterDataPage flash={flash} masterData={masterData} userId={auth.user.external_id} />
            </DashboardShell>
        </>
    );
}
