import { router } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowDownToLine,
    ArrowUpFromLine,
    CheckCircle2,
    ClipboardList,
    Eye,
    FileImage,
    FileSpreadsheet,
    Plus,
    Printer,
    Scale,
    ShieldCheck,
} from 'lucide-react';
import * as React from 'react';

import {
    b3StorageApproveMonthly,
    b3StorageCreate,
    b3StorageIndex,
    b3StorageLogPdf,
    b3StorageMonthlyExcel,
    b3StorageMonthlyPdf,
    b3StoragePhoto,
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
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type {
    B3StorageMonthlyDetailPayload,
    B3StorageMonthlyReportRow,
} from '@/modules/dashboard/types';

type PenyimpananLimbahB3MonthlyDetailProps = {
    flash: {
        success?: string | null;
        error?: string | null;
    };
    monthlyDetail: B3StorageMonthlyDetailPayload;
    userId: string;
};

export function PenyimpananLimbahB3MonthlyDetail({
    flash,
    monthlyDetail,
    userId,
}: PenyimpananLimbahB3MonthlyDetailProps) {
    const [selectedRow, setSelectedRow] =
        React.useState<B3StorageMonthlyReportRow | null>(null);

    const approveMonthly = () => {
        if (monthlyDetail.capabilities.next_approval_role === null) {
            return;
        }

        router.post(
            b3StorageApproveMonthly.url(
                {
                    year: monthlyDetail.period.year,
                    month: monthlyDetail.period.month,
                },
                { query: { user_id: userId } },
            ),
            {
                approval_role: monthlyDetail.capabilities.next_approval_role,
                date_from: monthlyDetail.filters.date_from || undefined,
                date_to: monthlyDetail.filters.date_to || undefined,
            },
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <div className="print-content min-h-screen w-full max-w-full min-w-0 overflow-x-hidden bg-[radial-gradient(circle_at_top_left,hsl(var(--muted))_0%,hsl(var(--background))_46%)] px-3 py-5 sm:px-4 lg:px-6 lg:py-8">
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
                                {monthlyDetail.capabilities.approve_monthly &&
                                monthlyDetail.capabilities
                                    .next_approval_label ? (
                                    <Button type="button" onClick={approveMonthly}>
                                        <CheckCircle2 className="size-4" />
                                        {
                                            monthlyDetail.capabilities
                                                .next_approval_label
                                        }
                                    </Button>
                                ) : monthlyDetail.capabilities
                                      .approval_blocked_reason ? (
                                    <Badge variant="secondary">
                                        {
                                            monthlyDetail.capabilities
                                                .approval_blocked_reason
                                        }
                                    </Badge>
                                ) : null}
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <Button
                                    variant="outline"
                                    className="no-print"
                                    render={
                                        <a
                                            href={b3StorageIndex.url({
                                                query: {
                                                    user_id: userId,
                                                    year: monthlyDetail.period
                                                        .year,
                                                    date_from:
                                                        monthlyDetail.filters
                                                            .date_from ||
                                                        undefined,
                                                    date_to:
                                                        monthlyDetail.filters
                                                            .date_to ||
                                                        undefined,
                                                },
                                            })}
                                        />
                                    }
                                >
                                    <ArrowLeft className="size-4" />
                                    Kembali ke Listing
                                </Button>
                                <Button
                                    variant="outline"
                                    className="no-print"
                                    render={
                                        <a
                                            href={b3StorageMonthlyPdf.url(
                                                {
                                                    year: monthlyDetail.period
                                                        .year,
                                                    month: monthlyDetail.period
                                                        .month,
                                                },
                                                {
                                                    query: {
                                                        user_id: userId,
                                                        date_from:
                                                            monthlyDetail
                                                                .filters
                                                                .date_from ||
                                                            undefined,
                                                        date_to:
                                                            monthlyDetail
                                                                .filters
                                                                .date_to ||
                                                            undefined,
                                                    },
                                                },
                                            )}
                                            target="_blank"
                                            rel="noreferrer"
                                        />
                                    }
                                >
                                    <Printer className="size-4" />
                                    FM038 PDF
                                </Button>
                                <Button
                                    variant="outline"
                                    className="no-print"
                                    render={
                                        <a
                                            href={b3StorageMonthlyExcel.url(
                                                {
                                                    year: monthlyDetail.period
                                                        .year,
                                                    month: monthlyDetail.period
                                                        .month,
                                                },
                                                {
                                                    query: {
                                                        user_id: userId,
                                                        date_from:
                                                            monthlyDetail
                                                                .filters
                                                                .date_from ||
                                                            undefined,
                                                        date_to:
                                                            monthlyDetail
                                                                .filters
                                                                .date_to ||
                                                            undefined,
                                                    },
                                                },
                                            )}
                                        />
                                    }
                                >
                                    <FileSpreadsheet className="size-4" />
                                    FM038 Excel
                                </Button>
                                <Button
                                    className="no-print"
                                    render={
                                        <a
                                            href={b3StorageCreate.url({
                                                query: { user_id: userId },
                                            })}
                                        />
                                    }
                                >
                                    <Plus className="size-4" />
                                    Tambah Entri
                                </Button>
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

                <div className="grid gap-3 md:grid-cols-5">
                    <SummaryCard
                        label="Total Log"
                        value={`${monthlyDetail.summary.total_logs_count} log`}
                        icon={ClipboardList}
                        tone="sky"
                    />
                    <SummaryCard
                        label="Masuk"
                        value={`${monthlyDetail.summary.incoming_logs_count} log`}
                        icon={ArrowDownToLine}
                        tone="emerald"
                    />
                    <SummaryCard
                        label="Keluar"
                        value={`${monthlyDetail.summary.outgoing_logs_count} log`}
                        icon={ArrowUpFromLine}
                        tone="rose"
                    />
                    <SummaryCard
                        label="Total Berat"
                        value={`${formatWeight(monthlyDetail.summary.total_weight_kg)} kg`}
                        icon={Scale}
                        tone="amber"
                    />
                    <SummaryCard
                        label="Approval"
                        value={monthlyDetail.approval.status_label}
                        icon={ShieldCheck}
                        tone="violet"
                    />
                </div>

                <Card className="min-w-0 border-none shadow-sm ring-1 ring-border/60">
                    <CardHeader>
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Scale className="size-4 text-primary" />
                                    Laporan Penyimpanan Limbah B3
                                </CardTitle>
                                <CardDescription>
                                    Rekap berat limbah per jenis dan dokumen pada
                                    periode {monthlyDetail.period.label}
                                    {monthlyDetail.period.date_from !==
                                        monthlyDetail.period.date_to
                                        ? ` (${monthlyDetail.period.date_from} s/d ${monthlyDetail.period.date_to})`
                                        : ''}.
                                </CardDescription>
                            </div>
                            <div className="text-sm text-muted-foreground lg:text-right">
                                <p>
                                    Environment SPV:{' '}
                                    {monthlyDetail.approval.environment_supervisor
                                        .name ?? '-'}{' '}
                                    {monthlyDetail.approval.environment_supervisor
                                        .signed_at
                                        ? `(${monthlyDetail.approval.environment_supervisor.signed_at})`
                                        : ''}
                                </p>
                                <p>
                                    HSE Dept Head:{' '}
                                    {monthlyDetail.approval.hse_department_head
                                        .name ?? '-'}{' '}
                                    {monthlyDetail.approval.hse_department_head
                                        .signed_at
                                        ? `(${monthlyDetail.approval.hse_department_head.signed_at})`
                                        : ''}
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="w-full max-w-full min-w-0 overflow-x-auto overscroll-x-contain">
                            <Table className="w-full table-fixed">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="sticky left-0 z-10 w-[17%] bg-background px-3 py-3">
                                            No / No. Dokumen
                                        </TableHead>
                                        <TableHead className="w-[13%] px-3 py-3">
                                            Tipe Pergerakan
                                        </TableHead>
                                        <TableHead className="w-[14%] px-3 py-3">
                                            Tanggal &amp; Waktu
                                        </TableHead>
                                        <TableHead className="w-[17%] px-3 py-3">
                                            Jenis Limbah
                                        </TableHead>
                                        <TableHead className="w-[10%] px-3 py-3 text-right">
                                            Berat
                                        </TableHead>
                                        <TableHead className="w-[16%] px-3 py-3">
                                            Dept. Inisiator
                                        </TableHead>
                                        <TableHead className="w-[10%] px-3 py-3">
                                            Operator
                                        </TableHead>
                                        <TableHead className="w-[72px] px-3 py-3 text-right">
                                            Action
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {monthlyDetail.rows.length > 0 ? (
                                        monthlyDetail.rows.map((row) => (
                                            <TableRow className='transition-colors odd:bg-primary/10 hover:bg-primary/15' key={row.id}>
                                                <TableCell className="sticky left-0 z-10 bg-background px-3 py-3 align-top">
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-semibold text-muted-foreground">
                                                            #{row.no}
                                                        </p>
                                                        <p className="break-words font-medium">
                                                            {row.document_number}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-3 py-3 align-top">
                                                    <span
                                                        className={
                                                            row.movement_type ===
                                                            'MASUK'
                                                                ? 'inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                                : 'inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                                        }
                                                    >
                                                        {row.movement_type}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-3 py-3 align-top">
                                                    <div className="space-y-0.5">
                                                        <p className="font-medium">
                                                            {row.movement_date ?? '-'}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatTime(row.jam)}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-3 py-3 align-top whitespace-normal">
                                                    {row.waste_type_name ?? '-'}
                                                </TableCell>
                                                <TableCell className="px-3 py-3 text-right align-top font-medium">
                                                    {formatWeight(row.weight_kg)} kg
                                                </TableCell>
                                                <TableCell className="px-3 py-3 align-top whitespace-normal">
                                                    <div className="space-y-0.5">
                                                        <p className="break-words font-medium">
                                                            {row.initiator_department ?? '-'}
                                                        </p>
                                                        {row.initiator_user_name ? (
                                                            <p className="break-words text-xs text-muted-foreground">
                                                                ({row.initiator_user_name})
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-3 py-3 align-top whitespace-normal">
                                                    {row.operator_name ?? '-'}
                                                </TableCell>
                                                <TableCell className="px-3 py-3 text-right align-top">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon-sm"
                                                        aria-label={`Lihat detail ${row.document_number}`}
                                                        onClick={() =>
                                                            setSelectedRow(row)
                                                        }
                                                    >
                                                        <Eye className="size-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={8}
                                                className="px-4 py-10 text-center text-muted-foreground"
                                            >
                                                Belum ada log B3 pada periode
                                                ini.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <B3StorageLogDetailDrawer
                row={selectedRow}
                userId={userId}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedRow(null);
                    }
                }}
            />
        </div>
    );
}

function B3StorageLogDetailDrawer({
    row,
    userId,
    onOpenChange,
}: {
    row: B3StorageMonthlyReportRow | null;
    userId: string;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <Drawer
            direction="right"
            open={row !== null}
            onOpenChange={onOpenChange}
        >
            <DrawerContent className="overflow-hidden sm:max-w-lg">
                <DrawerHeader className="border-b border-border/70">
                    <DrawerTitle>Detail Limbah B3</DrawerTitle>
                    <DrawerDescription>
                        {row?.document_number ?? 'Detail form penyimpanan limbah B3'}
                    </DrawerDescription>
                </DrawerHeader>

                {row ? (
                    <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto p-4">
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                render={
                                    <a
                                        href={b3StorageLogPdf.url(
                                            { log: row.id },
                                            { query: { user_id: userId } },
                                        )}
                                        target="_blank"
                                        rel="noreferrer"
                                    />
                                }
                            >
                                <Printer className="size-4" />
                                PDF Form
                            </Button>
                            {row.photo_path ? (
                                <Button
                                    variant="outline"
                                    render={
                                        <a
                                            href={b3StoragePhoto.url(
                                                { log: row.id },
                                                { query: { user_id: userId } },
                                            )}
                                            target="_blank"
                                            rel="noreferrer"
                                        />
                                    }
                                >
                                    <FileImage className="size-4" />
                                    Lihat Foto
                                </Button>
                            ) : null}
                        </div>

                        <div className="grid gap-2">
                            <DetailField
                                label="Tipe Pergerakan"
                                value={row.movement_type}
                            />
                            <DetailField
                                label="Tanggal"
                                value={row.movement_date}
                            />
                            <DetailField label="Jam" value={formatTime(row.jam)} />
                            <DetailField
                                label="Jenis Limbah"
                                value={row.waste_type_name}
                            />
                            <DetailField
                                label="Berat (Kg)"
                                value={`${formatWeight(row.weight_kg)} kg`}
                            />
                            <DetailField
                                label="No. Dokumen"
                                value={row.document_number}
                            />
                            <DetailField
                                label="Dept. Inisiator"
                                value={row.initiator_department}
                            />
                            <DetailField
                                label="Petugas Dept. Inisiator"
                                value={row.initiator_user_name}
                            />
                            <DetailField
                                label="Operator TPS LB3"
                                value={row.operator_name}
                            />
                            <DetailField label="Catatan" value={row.note} />
                            <DetailField
                                label="Dibuat Pada"
                                value={row.created_at}
                            />
                        </div>

                        <div className="grid gap-2 border-t border-border/70 pt-4">
                            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                Paraf / Tanda Tangan
                            </p>
                            <SignatureField
                                label="Petugas Dept. Inisiator"
                                name={row.initiator_user_name}
                                fallback="Belum tercatat"
                                verificationLabel="Terverifikasi Sistem"
                            />
                            <SignatureField
                                label="Operator TPS LB3"
                                name={row.operator_name}
                                fallback="Belum tercatat"
                                verificationLabel="Login Operator"
                            />
                        </div>
                    </div>
                ) : null}
            </DrawerContent>
        </Drawer>
    );
}

function DetailField({
    label,
    value,
}: {
    label: string;
    value: string | number | null | undefined;
}) {
    return (
        <div className="rounded-md border border-border/70 p-3">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-medium whitespace-pre-wrap">
                {value ?? '-'}
            </p>
        </div>
    );
}

function SignatureField({
    label,
    name,
    fallback,
    verificationLabel,
}: {
    label: string;
    name: string | null | undefined;
    fallback: string;
    verificationLabel?: string;
}) {
    return (
        <div className="rounded-md border border-border/70 p-3">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <div className="mt-3 flex min-h-16 items-end justify-center border-b border-dashed border-border/80 pb-2 text-center">
                <div>
                    <span className="text-sm font-semibold">{name ?? fallback}</span>
                    {name && verificationLabel ? (
                        <p className="mt-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                            {verificationLabel}
                        </p>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

type SummaryTone = 'sky' | 'emerald' | 'rose' | 'amber' | 'violet';

function SummaryCard({
    label,
    value,
    icon: Icon,
    tone,
}: {
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    tone: SummaryTone;
}) {
    const toneClass: Record<SummaryTone, string> = {
        sky: 'bg-sky-50 text-sky-700 ring-sky-100 dark:bg-sky-950/30 dark:text-sky-300 dark:ring-sky-900/40',
        emerald:
            'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300 dark:ring-emerald-900/40',
        rose: 'bg-rose-50 text-rose-700 ring-rose-100 dark:bg-rose-950/30 dark:text-rose-300 dark:ring-rose-900/40',
        amber: 'bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-950/30 dark:text-amber-300 dark:ring-amber-900/40',
        violet:
            'bg-violet-50 text-violet-700 ring-violet-100 dark:bg-violet-950/30 dark:text-violet-300 dark:ring-violet-900/40',
    };

    return (
        <Card className={`${toneClass[tone]} border-none shadow-sm ring-1`}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-medium opacity-75 uppercase">
                            {label}
                        </p>
                        <p className="mt-2 text-lg font-semibold">{value}</p>
                    </div>
                    <span className="inline-flex size-9 items-center justify-center rounded-md bg-white/70 shadow-sm dark:bg-white/10">
                        <Icon className="size-4" />
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

function formatWeight(value: string | number): string {
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value));
}

function formatTime(value: string | null | undefined): string {
    if (!value) {
        return '-';
    }

    const match = value.match(/^(\d{2}):(\d{2})/);

    if (match) {
        return `${match[1]}:${match[2]}`;
    }

    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
        return new Intl.DateTimeFormat('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    }

    return value;
}
