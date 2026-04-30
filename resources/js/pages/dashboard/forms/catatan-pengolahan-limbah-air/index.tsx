import { Head, usePage } from '@inertiajs/react';

import { DashboardShell } from '@/modules/dashboard/components/dashboard-shell';
import type { CatatanPengolahanLimbahAirListingPayload } from '@/modules/dashboard/types';
import { CatatanPengolahanLimbahAirListing } from '@/modules/forms/catatan-pengolahan-limbah-air/components/catatan-pengolahan-limbah-air-listing';
import type { PageProps } from '@/types';

type ListingPageProps = PageProps<{
    listing: CatatanPengolahanLimbahAirListingPayload;
}>;

export default function CatatanPengolahanLimbahAirListingPage() {
    const { auth, listing, name } = usePage<ListingPageProps>().props;

    if (auth.user === null) {
        return null;
    }

    return (
        <>
            <Head title="Form Catatan Pengolahan Limbah Air" />
            <DashboardShell
                appName={name}
                permissions={auth.permissions}
                roles={auth.roles}
                userId={auth.user.external_id}
                userName={auth.user.name}
                departmentName={auth.user.department?.name}
            >
                <CatatanPengolahanLimbahAirListing listing={listing} userId={auth.user.external_id} />
            </DashboardShell>
        </>
    );
}
