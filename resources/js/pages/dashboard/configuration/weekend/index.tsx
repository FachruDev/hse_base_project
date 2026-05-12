import { Head, usePage } from '@inertiajs/react';

import { WeekendConfigurationPage } from '@/modules/configuration/components/weekend-configuration-page';
import type { WeekendConfigurationPayload } from '@/modules/configuration/types';
import { DashboardShell } from '@/modules/dashboard/components/dashboard-shell';
import type { PageProps } from '@/types';

type WeekendConfigurationIndexPageProps = PageProps<{
    weekendConfiguration: WeekendConfigurationPayload;
}>;

export default function WeekendConfigurationIndexPage() {
    const { auth, name, weekendConfiguration } = usePage<WeekendConfigurationIndexPageProps>().props;

    if (auth.user === null) {
        return null;
    }

    return (
        <>
            <Head title="Konfigurasi Weekend" />
            <DashboardShell
                appName={name}
                permissions={auth.permissions}
                roles={auth.roles}
                userId={auth.user.external_id}
                userName={auth.user.name}
                departmentName={auth.user.department?.name}
            >
                <WeekendConfigurationPage weekendConfiguration={weekendConfiguration} userId={auth.user.external_id} />
            </DashboardShell>
        </>
    );
}
