export type DashboardStat = {
    label: string;
    value: number;
    description: string;
};

export type DashboardModuleSummary = {
    title: string;
    count: number;
    caption: string;
    permission: string;
};

export type DashboardLog = {
    id: number;
    tanggal: string | null;
    operator: string | null;
    operator_external_id: string | null;
    status: string;
    submitted_at: string | null;
};

export type DashboardPayload = {
    hero: {
        title: string;
        subtitle: string;
        today: string;
    };
    stats: DashboardStat[];
    moduleSummary: DashboardModuleSummary[];
    latestLogs: DashboardLog[];
    viewer: {
        external_id: string | null | undefined;
        name: string | null | undefined;
    };
};
