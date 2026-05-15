import { Head, usePage } from '@inertiajs/react';

import { DashboardShell } from '@/modules/dashboard/components/dashboard-shell';
import type { B3StorageEntryPayload } from '@/modules/dashboard/types';
import { PenyimpananLimbahB3Entry } from '@/modules/forms/penyimpanan-limbah-b3/components/penyimpanan-limbah-b3-entry';
import type { PageProps } from '@/types';

type EntryPageProps = PageProps<{
    entryForm: B3StorageEntryPayload;
}>;

export default function PenyimpananLimbahB3CreatePage() {
    const { auth, entryForm, flash, name } = usePage<EntryPageProps>().props;

    if (auth.user === null) {
        return null;
    }

    return (
        <>
            <Head title="Isi Form Penyimpanan Limbah B3" />
            <DashboardShell
                appName={name}
                permissions={auth.permissions}
                roles={auth.roles}
                userId={auth.user.external_id}
                userName={auth.user.name}
                departmentName={auth.user.department?.name}
            >
                <PenyimpananLimbahB3Entry flash={flash} entryForm={entryForm} userId={auth.user.external_id} />
            </DashboardShell>
        </>
    );
}
