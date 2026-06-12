import { router } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    CheckCircle2,
    ClipboardCheck,
    Droplets,
    FlaskConical,
    X,
} from 'lucide-react';

import {
    catatanPengolahanLimbahAirApproveMonthlyChecklist,
    catatanPengolahanLimbahAirIndex,
    catatanPengolahanLimbahAirLogShow,
} from '@/actions/App/Http/Controllers/Web/DashboardController';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { IpalMonthlyDetailPayload } from '@/modules/dashboard/types';

type CatatanPengolahanLimbahAirMonthlyDetailProps = {
    flash: {
        success?: string | null;
        error?: string | null;
    };
    monthlyDetail: IpalMonthlyDetailPayload;
    userId: string;
};

export function CatatanPengolahanLimbahAirMonthlyDetail({
    flash,
    monthlyDetail,
    userId,
}: CatatanPengolahanLimbahAirMonthlyDetailProps) {
    const approveChecklist = () => {
        router.post(
            catatanPengolahanLimbahAirApproveMonthlyChecklist.url(
                {
                    year: monthlyDetail.period.year,
                    month: monthlyDetail.period.month,
                },
                { query: { user_id: userId } },
            ),
            {},
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <div className="min-h-screen w-full max-w-full min-w-0 overflow-x-hidden bg-[radial-gradient(circle_at_top_left,hsl(var(--muted))_0%,hsl(var(--background))_46%)] px-3 py-5 sm:px-4 lg:px-6 lg:py-8">
            <div className="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-5 lg:gap-6">
                <Card className="min-w-0 border-none bg-[linear-gradient(135deg,hsl(var(--background))_0%,hsl(var(--muted))_100%)] shadow-sm ring-1 ring-border/60">
                    <CardHeader className="gap-4">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div className="min-w-0 space-y-2">
                                <Badge variant="outline">
                                    Periode {monthlyDetail.period.label}
                                </Badge>
                                <CardTitle className="text-xl sm:text-2xl">
                                    {monthlyDetail.module.title}
                                </CardTitle>
                                <CardDescription>
                                    {monthlyDetail.module.subtitle}
                                </CardDescription>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <Button
                                    nativeButton={false}
                                    variant="outline"
                                    render={
                                        <a
                                            href={catatanPengolahanLimbahAirIndex.url(
                                                {
                                                    query: {
                                                        user_id: userId,
                                                        year: monthlyDetail
                                                            .period.year,
                                                    },
                                                },
                                            )}
                                        />
                                    }
                                >
                                    <ArrowLeft className="size-4" />
                                    Kembali ke Listing
                                </Button>
                                {monthlyDetail.capabilities
                                    .approve_checklist ? (
                                    <Button
                                        type="button"
                                        onClick={approveChecklist}
                                    >
                                        <CheckCircle2 className="size-4" />
                                        Approve Checklist Bulanan
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {flash.success ? (
                    <Alert>
                        <AlertTitle>Berhasil</AlertTitle>
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                ) : null}

                {flash.error ? (
                    <Alert variant="destructive">
                        <AlertTitle>Gagal</AlertTitle>
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                ) : null}

                <div className="grid gap-3 md:grid-cols-4">
                    <SummaryCard
                        label="Checklist Terisi"
                        value={`${monthlyDetail.summary.checklist_days_count} hari`}
                    />
                    <SummaryCard
                        label="Catatan Proses"
                        value={`${monthlyDetail.summary.process_logs_count} log`}
                    />
                    <SummaryCard
                        label="Batch Mixing"
                        value={`${monthlyDetail.summary.batch_mixing_logs_count} log`}
                    />
                    <SummaryCard
                        label="Approval Checklist"
                        value={
                            monthlyDetail.approval.status === 'APPROVED'
                                ? 'Approved'
                                : 'Belum Approved'
                        }
                    />
                </div>

                <Card className="min-w-0 border-none shadow-sm ring-1 ring-border/60">
                    <CardHeader>
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <ClipboardCheck className="size-4 text-primary" />
                                    Checklist Pemeriksaan Unit
                                </CardTitle>
                                <CardDescription>
                                    Matrix status harian untuk periode{' '}
                                    {monthlyDetail.period.label}.
                                </CardDescription>
                            </div>
                            <div className="max-w-full text-sm text-muted-foreground lg:max-w-md lg:text-right">
                                {monthlyDetail.approval.status ===
                                'APPROVED' ? (
                                    <span>
                                        Approved oleh{' '}
                                        {monthlyDetail.approval.approved_by
                                            .name ?? 'HSE Dept Head'}{' '}
                                        pada{' '}
                                        {monthlyDetail.approval.approved_at ??
                                            '-'}
                                    </span>
                                ) : (
                                    <span>Belum approved HSE Dept Head</span>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="w-full max-w-full min-w-0 overflow-x-auto overscroll-x-contain">
                            <Table className="min-w-[920px]">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="sticky left-0 z-10 w-[180px] min-w-[180px] bg-background px-3 whitespace-normal sm:w-[220px] sm:min-w-[220px] sm:px-4">
                                            Perlengkapan
                                        </TableHead>
                                        {monthlyDetail.period.days.map(
                                            (day) => (
                                                <TableHead
                                                    key={day.date}
                                                    className="w-9 min-w-9 px-1 text-center sm:w-10 sm:min-w-10"
                                                >
                                                    {day.day}
                                                </TableHead>
                                            ),
                                        )}
                                        <TableHead className="w-[180px] min-w-[180px] px-3 whitespace-normal sm:w-[220px] sm:min-w-[220px] sm:px-4">
                                            Kondisi Standar
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {monthlyDetail.checklist_matrix.map(
                                        (row) => (
                                            <TableRow key={row.item_id}>
                                                <TableCell className="sticky left-0 z-10 bg-background px-3 font-medium whitespace-normal sm:px-4">
                                                    {row.name}
                                                </TableCell>
                                                {row.cells.map((cell) => (
                                                    <TableCell
                                                        key={`${row.item_id}-${cell.date}`}
                                                        className="px-1 text-center"
                                                        title={[
                                                            cell.status_label,
                                                            ...cell.operators,
                                                            ...cell.notes,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(' | ')}
                                                    >
                                                        <ChecklistCell
                                                            status={cell.status}
                                                        />
                                                    </TableCell>
                                                ))}
                                                <TableCell className="px-3 text-sm whitespace-normal text-muted-foreground sm:px-4">
                                                    {row.standard_condition ??
                                                        '-'}
                                                </TableCell>
                                            </TableRow>
                                        ),
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Card className="min-w-0 border-none shadow-sm ring-1 ring-border/60">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Droplets className="size-4 text-primary" />
                            Catatan Proses Harian
                        </CardTitle>
                        <CardDescription>
                            Daftar catatan proses harian dan indikator batch
                            mixing di periode ini.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 md:hidden">
                        <div className="space-y-3 p-3">
                            {monthlyDetail.process_rows.length > 0 ? (
                                monthlyDetail.process_rows.map((row) => (
                                    <div
                                        key={row.id}
                                        className="rounded-lg border border-border/70 bg-card p-3 shadow-sm"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="font-medium">
                                                    {row.tanggal ?? '-'}
                                                </p>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {row.operator.name ?? '-'} ·{' '}
                                                    {row.operator
                                                        .department_name ??
                                                        row.operator
                                                            .external_id ??
                                                        '-'}
                                                </p>
                                            </div>
                                            <Badge
                                                variant={resolveStatusVariant(
                                                    row.status,
                                                )}
                                            >
                                                {row.status}
                                            </Badge>
                                        </div>
                                        <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
                                            <div className="flex items-center justify-between gap-3">
                                                <span>Batch Mixing</span>
                                                {row.has_batch_mixing ? (
                                                    <Badge variant="secondary">
                                                        <FlaskConical className="size-3" />
                                                        {row.batch_count} batch
                                                    </Badge>
                                                ) : (
                                                    <span>Tidak ada</span>
                                                )}
                                            </div>
                                            <div className="flex items-start justify-between gap-3">
                                                <span>Diperiksa</span>
                                                <span className="text-right">
                                                    {row.checked_by ?? '-'}
                                                    {row.checked_at ? (
                                                        <span className="block">
                                                            {row.checked_at}
                                                        </span>
                                                    ) : null}
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            className="mt-3 w-full"
                                            nativeButton={false}
                                            variant="outline"
                                            size="sm"
                                            render={
                                                <a
                                                    href={catatanPengolahanLimbahAirLogShow.url(
                                                        { log: row.id },
                                                        {
                                                            query: {
                                                                user_id: userId,
                                                            },
                                                        },
                                                    )}
                                                />
                                            }
                                        >
                                            Detail
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="py-10 text-center text-sm text-muted-foreground">
                                    Belum ada catatan proses pada periode ini.
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardContent className="hidden p-0 md:block">
                        <Table className="min-w-[760px]">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="px-4">
                                        Tanggal
                                    </TableHead>
                                    <TableHead>Operator</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Batch Mixing</TableHead>
                                    <TableHead>Diperiksa Oleh</TableHead>
                                    <TableHead className="px-4 text-right">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {monthlyDetail.process_rows.length > 0 ? (
                                    monthlyDetail.process_rows.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell className="px-4 font-medium">
                                                {row.tanggal ?? '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    {row.operator.name ?? '-'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {row.operator
                                                        .department_name ??
                                                        row.operator
                                                            .external_id}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={resolveStatusVariant(
                                                        row.status,
                                                    )}
                                                >
                                                    {row.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {row.has_batch_mixing ? (
                                                    <Badge variant="secondary">
                                                        <FlaskConical className="size-3" />
                                                        {row.batch_count} batch
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        Tidak ada
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {row.checked_by ?? '-'}
                                                {row.checked_at ? (
                                                    <div className="text-xs text-muted-foreground">
                                                        {row.checked_at}
                                                    </div>
                                                ) : null}
                                            </TableCell>
                                            <TableCell className="px-4 text-right">
                                                <Button
                                                    nativeButton={false}
                                                    variant="outline"
                                                    size="sm"
                                                    render={
                                                        <a
                                                            href={catatanPengolahanLimbahAirLogShow.url(
                                                                { log: row.id },
                                                                {
                                                                    query: {
                                                                        user_id:
                                                                            userId,
                                                                    },
                                                                },
                                                            )}
                                                        />
                                                    }
                                                >
                                                    Detail
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="px-4 py-10 text-center text-muted-foreground"
                                        >
                                            Belum ada catatan proses pada
                                            periode ini.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
    return (
        <Card className="border-none shadow-sm ring-1 ring-border/60">
            <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase">
                    {label}
                </p>
                <p className="mt-2 text-lg font-semibold">{value}</p>
            </CardContent>
        </Card>
    );
}

function ChecklistCell({ status }: { status: string | null }) {
    if (status === 'OK') {
        return <Check className="mx-auto size-4 text-emerald-600" strokeWidth={3} />;
    }

    if (status === 'NOT_OK') {
        return <X className="mx-auto size-4 text-destructive" strokeWidth={3} />;
    }

    if (status === 'NA') {
        return <span className="text-xs font-medium text-muted-foreground">NA</span>;
    }

    return <span className="text-muted-foreground">-</span>;
}

function resolveStatusVariant(
    status: string,
): 'default' | 'secondary' | 'outline' {
    if (status === 'APPROVED') {
        return 'default';
    }

    if (status === 'SUBMITTED') {
        return 'secondary';
    }

    return 'outline';
}
