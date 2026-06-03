import { Head, usePage } from '@inertiajs/react';

import { DashboardShell } from '@/modules/dashboard/components/dashboard-shell';
import type { IpalMonthlyDetailPayload } from '@/modules/dashboard/types';
import { CatatanPengolahanLimbahAirMonthlyDetail } from '@/modules/forms/catatan-pengolahan-limbah-air/components/catatan-pengolahan-limbah-air-monthly-detail';
import type { PageProps } from '@/types';

type MonthlyPageProps = PageProps<{
    flash: {
        success?: string | null;
        error?: string | null;
    };
    monthlyDetail: IpalMonthlyDetailPayload;
}>;

export default function CatatanPengolahanLimbahAirMonthlyPage() {
    const { auth, flash, monthlyDetail, name } = usePage<MonthlyPageProps>().props;

    if (auth.user === null) {
        return null;
    }

    return (
        <>
            <Head title={`Detail IPAL ${monthlyDetail.period.label}`} />
            <DashboardShell
                appName={name}
                permissions={auth.permissions}
                roles={auth.roles}
                userId={auth.user.external_id}
                userName={auth.user.name}
                departmentName={auth.user.department?.name}
            >
                <CatatanPengolahanLimbahAirMonthlyDetail flash={flash} monthlyDetail={monthlyDetail} userId={auth.user.external_id} />
            </DashboardShell>
        </>
    );
}
