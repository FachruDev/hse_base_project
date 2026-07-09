import { ArrowRight, ClipboardPenLine, FileStack, FileWarning, Sparkles } from 'lucide-react';

import { b3StorageCreate, catatanPengolahanLimbahAirCreate } from '@/actions/App/Http/Controllers/Web/DashboardController';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardFormItem, DashboardPayload } from '@/modules/dashboard/types';

type DashboardFormWorkspaceProps = {
    dashboard: DashboardPayload;
    userId: string;
};

export function DashboardFormWorkspace({ dashboard, userId }: DashboardFormWorkspaceProps) {
    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(var(--muted))_0%,hsl(var(--background))_42%)] px-4 py-6 lg:px-6 lg:py-8">
            <div className="mx-auto flex max-w-6xl flex-col gap-6">
                <section id="dashboard-form">
                    <Card className="overflow-hidden border-none bg-[linear-gradient(135deg,hsl(var(--background))_0%,hsl(var(--muted))_100%)] shadow-sm ring-1 ring-border/60">
                        <CardHeader className="gap-4">
                            <Badge variant="outline" className="w-fit gap-2">
                                <Sparkles className="size-3.5" />
                                Dashboard Workspace
                            </Badge>
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                                <div className="max-w-3xl space-y-2">
                                    <CardTitle className="text-2xl">{dashboard.hero.title}</CardTitle>
                                    <CardDescription className="text-sm text-muted-foreground">
                                        {dashboard.hero.subtitle}
                                    </CardDescription>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[420px]">
                                    <SummaryBox label="Total Form" value={String(dashboard.summary.total_forms)} icon={FileStack} />
                                    <SummaryBox label="Perlu Diisi" value={String(dashboard.summary.due_today)} icon={FileWarning} />
                                    <SummaryBox label="Draft Aktif" value={String(dashboard.summary.draft_active)} icon={ClipboardPenLine} />
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                </section>

                <section id="form-list" className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-semibold">Daftar Form</h2>
                            <p className="text-sm text-muted-foreground">Klik kartu untuk langsung mengisi form hari ini.</p>
                        </div>
                        <Badge variant="outline">{dashboard.hero.today}</Badge>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {dashboard.forms.map((form) => (
                            <FormModuleCard key={form.key} form={form} userId={userId} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

function FormModuleCard({ form, userId }: { form: DashboardFormItem; userId: string }) {
    const href = resolveFormHref(form.key, userId);

    return (
        <Card className="border-none bg-card/95 shadow-sm ring-1 ring-border/60 transition-all hover:-translate-y-0.5 hover:shadow-md">
            <CardContent className="p-0">
                <a href={href} className="flex h-full flex-col gap-5 p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <ClipboardPenLine className="size-5" />
                        </div>
                        <Badge variant={resolveBadgeVariant(form.today_status, form.filled_today)}>{form.action_label}</Badge>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-base font-semibold">{form.title}</h3>
                        <p className="text-sm text-muted-foreground">{form.frequency}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                        <span>{form.filled_today ? `Status ${form.today_status ?? 'DRAFT'}` : 'Belum ada entri hari ini'}</span>
                        <ArrowRight className="size-4" />
                    </div>
                </a>
            </CardContent>
        </Card>
    );
}

function resolveFormHref(formKey: string, userId: string): string {
    if (formKey === 'penyimpanan-limbah-b3') {
        return b3StorageCreate.url({ query: { user_id: userId } });
    }

    return catatanPengolahanLimbahAirCreate.url({ query: { user_id: userId } });
}

function SummaryBox({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: string;
    icon: typeof ClipboardPenLine;
}) {
    return (
        <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="size-4" />
                <span className="text-xs uppercase tracking-[0.18em]">{label}</span>
            </div>
            <p className="mt-3 text-2xl font-semibold">{value}</p>
        </div>
    );
}

function resolveBadgeVariant(
    status: string | null,
    filledToday: boolean,
): 'default' | 'secondary' | 'outline' | 'destructive' {
    if (!filledToday) {
        return 'destructive';
    }

    if (status === 'APPROVED') {
        return 'default';
    }

    if (status === 'SUBMITTED') {
        return 'secondary';
    }

    return 'outline';
}
