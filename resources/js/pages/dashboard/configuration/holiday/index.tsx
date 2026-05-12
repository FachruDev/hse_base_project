import { Head, usePage } from '@inertiajs/react';

import { HolidayConfigurationPage } from '@/modules/configuration/components/holiday-configuration-page';
import type { HolidayConfigurationPayload } from '@/modules/configuration/types';
import { DashboardShell } from '@/modules/dashboard/components/dashboard-shell';
import type { PageProps } from '@/types';

type HolidayConfigurationIndexPageProps = PageProps<{
    holidayConfiguration: HolidayConfigurationPayload;
}>;

export default function HolidayConfigurationIndexPage() {
    const { auth, flash, holidayConfiguration, name } = usePage<HolidayConfigurationIndexPageProps>().props;

    if (auth.user === null) {
        return null;
    }

    return (
        <>
            <Head title="Konfigurasi Holiday" />
            <DashboardShell
                appName={name}
                permissions={auth.permissions}
                roles={auth.roles}
                userId={auth.user.external_id}
                userName={auth.user.name}
                departmentName={auth.user.department?.name}
            >
                <HolidayConfigurationPage flash={flash} holidayConfiguration={holidayConfiguration} userId={auth.user.external_id} />
            </DashboardShell>
        </>
    );
}
