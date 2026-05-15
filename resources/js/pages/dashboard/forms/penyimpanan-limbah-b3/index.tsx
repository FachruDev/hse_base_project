import { Head, usePage } from '@inertiajs/react';

import { DashboardShell } from '@/modules/dashboard/components/dashboard-shell';
import type { B3StorageLogListingPayload } from '@/modules/dashboard/types';
import { PenyimpananLimbahB3Listing } from '@/modules/forms/penyimpanan-limbah-b3/components/penyimpanan-limbah-b3-listing';
import type { PageProps } from '@/types';

type ListingPageProps = PageProps<{
    listing: B3StorageLogListingPayload;
}>;

export default function PenyimpananLimbahB3ListingPage() {
    const { auth, listing, name } = usePage<ListingPageProps>().props;

    if (auth.user === null) {
        return null;
    }

    return (
        <>
            <Head title="Form Penyimpanan Limbah B3" />
            <DashboardShell
                appName={name}
                permissions={auth.permissions}
                roles={auth.roles}
                userId={auth.user.external_id}
                userName={auth.user.name}
                departmentName={auth.user.department?.name}
            >
                <PenyimpananLimbahB3Listing listing={listing} userId={auth.user.external_id} />
            </DashboardShell>
        </>
    );
}
