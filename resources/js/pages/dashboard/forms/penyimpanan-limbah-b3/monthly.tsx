import { Head, usePage } from '@inertiajs/react';

import { DashboardShell } from '@/modules/dashboard/components/dashboard-shell';
import type { B3StorageMonthlyDetailPayload } from '@/modules/dashboard/types';
import { PenyimpananLimbahB3MonthlyDetail } from '@/modules/forms/penyimpanan-limbah-b3/components/penyimpanan-limbah-b3-monthly-detail';
import type { PageProps } from '@/types';

type MonthlyPageProps = PageProps<{
    monthlyDetail: B3StorageMonthlyDetailPayload;
}>;

export default function PenyimpananLimbahB3MonthlyPage() {
    const { auth, flash, monthlyDetail, name } =
        usePage<MonthlyPageProps>().props;

    if (auth.user === null) {
        return null;
    }

    return (
        <>
            <Head title={`Detail B3 ${monthlyDetail.period.label}`} />
            <DashboardShell
                appName={name}
                permissions={auth.permissions}
                roles={auth.roles}
                userId={auth.user.external_id}
                userName={auth.user.name}
                departmentName={auth.user.department?.name}
            >
                <PenyimpananLimbahB3MonthlyDetail
                    flash={flash}
                    monthlyDetail={monthlyDetail}
                    userId={auth.user.external_id}
                />
            </DashboardShell>
        </>
    );
}
