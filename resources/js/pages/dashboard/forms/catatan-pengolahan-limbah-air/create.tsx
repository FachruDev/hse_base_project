import { Head, usePage } from '@inertiajs/react';

import { DashboardShell } from '@/modules/dashboard/components/dashboard-shell';
import type { CatatanPengolahanLimbahAirEntryPayload } from '@/modules/dashboard/types';
import { CatatanPengolahanLimbahAirEntry } from '@/modules/forms/catatan-pengolahan-limbah-air/components/catatan-pengolahan-limbah-air-entry';
import type { PageProps } from '@/types';

type EntryPageProps = PageProps<{
    flash: {
        success?: string | null;
        error?: string | null;
    };
    entryForm: CatatanPengolahanLimbahAirEntryPayload;
}>;

export default function CatatanPengolahanLimbahAirCreatePage() {
    const { auth, entryForm, flash, name } = usePage<EntryPageProps>().props;

    if (auth.user === null) {
        return null;
    }

    return (
        <>
            <Head title="Isi Form Catatan Pengolahan Limbah Air" />
            <DashboardShell
                appName={name}
                permissions={auth.permissions}
                roles={auth.roles}
                userId={auth.user.external_id}
                userName={auth.user.name}
                departmentName={auth.user.department?.name}
            >
                <CatatanPengolahanLimbahAirEntry flash={flash} entryForm={entryForm} userId={auth.user.external_id} />
            </DashboardShell>
        </>
    );
}
