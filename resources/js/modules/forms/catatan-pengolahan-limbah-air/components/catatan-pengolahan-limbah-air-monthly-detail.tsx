import { router } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    CheckCircle2,
    ClipboardCheck,
    Droplets,
    FlaskConical,
    Paperclip,
    Printer,
    type LucideIcon,
    X,
} from 'lucide-react';
import * as React from 'react';

import {
    catatanPengolahanLimbahAirApproveMonthlyChecklist,
    catatanPengolahanLimbahAirIndex,
    catatanPengolahanLimbahAirLogShow,
    catatanPengolahanLimbahAirMonthlyBatchMixingPdf,
    catatanPengolahanLimbahAirMonthlyChecklistPdf,
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
import type { IpalMonthlyDetailPayload } from '@/modules/dashboard/types';

type SelectedChecklistCell = {
    itemName: string;
    standardCondition: string | null;
    cell: IpalMonthlyDetailPayload['checklist_matrix'][number]['cells'][number];
};

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
    const [selectedChecklistCell, setSelectedChecklistCell] =
        React.useState<SelectedChecklistCell | null>(null);

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
        <div className="print-content min-h-screen w-full max-w-full min-w-0 overflow-x-hidden bg-[radial-gradient(circle_at_top_left,hsl(var(--muted))_0%,hsl(var(--background))_46%)] px-3 py-5 sm:px-4 lg:px-6 lg:py-8">
            <div className="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-5 lg:gap-6">
                <Card className="min-w-0 border-none bg-[linear-gradient(135deg,hsl(var(--background))_0%,hsl(var(--muted))_100%)] shadow-sm ring-1 ring-border/60">
                    <CardHeader className="gap-4">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div className="min-w-0 space-y-2">
                                <Badge variant="outline">
                                    Periode {monthlyDetail.period.label}
                                </Badge>
                                <Badge variant="secondary">
                                    {monthlyDetail.period.date_from} s/d{' '}
                                    {monthlyDetail.period.date_to}
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
                                    className="no-print"
                                    render={
                                        <a
                                            href={catatanPengolahanLimbahAirIndex.url(
                                                {
                                                    query: {
                                                        user_id: userId,
                                                        year: monthlyDetail
                                                            .period.year,
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
                                    <ArrowLeft className="size-4" />
                                    Kembali ke Listing
                                </Button>
                                <Button
                                    nativeButton={false}
                                    variant="outline"
                                    className="no-print"
                                    render={
                                        <a
                                            href={catatanPengolahanLimbahAirMonthlyChecklistPdf.url(
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
                                    Checklist PDF
                                </Button>
                                <Button
                                    nativeButton={false}
                                    variant="outline"
                                    className="no-print"
                                    render={
                                        <a
                                            href={catatanPengolahanLimbahAirMonthlyBatchMixingPdf.url(
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
                                    Batch Mixing PDF
                                </Button>
                                {monthlyDetail.capabilities
                                    .approve_checklist ? (
                                    <Button
                                        type="button"
                                        className="no-print"
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
                        icon={ClipboardCheck}
                        tone="sky"
                    />
                    <SummaryCard
                        label="Catatan Proses"
                        value={`${monthlyDetail.summary.process_logs_count} log`}
                        icon={Droplets}
                        tone="emerald"
                    />
                    <SummaryCard
                        label="Batch Mixing"
                        value={`${monthlyDetail.summary.batch_mixing_logs_count} log`}
                        icon={FlaskConical}
                        tone="amber"
                    />
                    <SummaryCard
                        label="Approval Checklist"
                        value={
                            monthlyDetail.approval.status === 'APPROVED'
                                ? 'Approved'
                                : 'Belum Approved'
                        }
                        icon={CheckCircle2}
                        tone="violet"
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
                                                    className={[
                                                        'w-9 min-w-9 px-1 text-center sm:w-10 sm:min-w-10',
                                                        isWeekend(day.date)
                                                            ? 'bg-rose-50 dark:bg-rose-950/30'
                                                            : '',
                                                    ].join(' ')}
                                                >
                                                    <span className="block leading-none font-bold">
                                                        {day.day}
                                                    </span>
                                                    <span
                                                        className={[
                                                            'block text-[10px] leading-tight font-normal',
                                                            isWeekend(day.date)
                                                                ? 'text-rose-500'
                                                                : 'text-muted-foreground',
                                                        ].join(' ')}
                                                    >
                                                        {getDayName(day.date)}
                                                    </span>
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
                                                {row.cells.map((cell) => {
                                                    const hasCellDetails =
                                                        cell.notes.length > 0 ||
                                                        cell.details.some(
                                                            (detail) =>
                                                                detail.attachment_url !==
                                                                null,
                                                        );

                                                    return (
                                                        <TableCell
                                                            key={`${row.item_id}-${cell.date}`}
                                                            className={[
                                                                'px-1 text-center',
                                                                isWeekend(
                                                                    cell.date,
                                                                )
                                                                    ? 'bg-rose-50/50 dark:bg-rose-950/10'
                                                                    : '',
                                                            ].join(' ')}
                                                            title={[
                                                                cell.status_label,
                                                                ...cell.operators,
                                                                ...cell.notes,
                                                            ]
                                                                .filter(Boolean)
                                                                .join(' | ')}
                                                        >
                                                            <ChecklistCell
                                                                status={
                                                                    cell.status
                                                                }
                                                                hasNotes={
                                                                    cell.notes
                                                                        .length >
                                                                    0
                                                                }
                                                                hasAttachments={cell.details.some(
                                                                    (detail) =>
                                                                        detail.attachment_url !==
                                                                        null,
                                                                )}
                                                                onOpen={
                                                                    hasCellDetails
                                                                        ? () =>
                                                                              setSelectedChecklistCell(
                                                                                  {
                                                                                      itemName:
                                                                                          row.name,
                                                                                      standardCondition:
                                                                                          row.standard_condition,
                                                                                      cell,
                                                                                  },
                                                                              )
                                                                        : undefined
                                                                }
                                                            />
                                                        </TableCell>
                                                    );
                                                })}
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
                                        <TableRow
                                            className="transition-colors odd:bg-primary/10 hover:bg-primary/15"
                                            key={row.id}
                                        >
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
            <ChecklistDetailDrawer
                selected={selectedChecklistCell}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedChecklistCell(null);
                    }
                }}
            />
        </div>
    );
}

type SummaryTone = 'sky' | 'emerald' | 'amber' | 'violet';

function SummaryCard({
    label,
    value,
    icon: Icon,
    tone,
}: {
    label: string;
    value: string;
    icon: LucideIcon;
    tone: SummaryTone;
}) {
    const toneClass: Record<SummaryTone, string> = {
        sky: 'bg-sky-50 text-sky-700 ring-sky-100 dark:bg-sky-950/30 dark:text-sky-300 dark:ring-sky-900/40',
        emerald:
            'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300 dark:ring-emerald-900/40',
        amber: 'bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-950/30 dark:text-amber-300 dark:ring-amber-900/40',
        violet: 'bg-violet-50 text-violet-700 ring-violet-100 dark:bg-violet-950/30 dark:text-violet-300 dark:ring-violet-900/40',
    };

    return (
        <Card className={`${toneClass[tone]} border-none shadow-sm ring-1`}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-medium uppercase opacity-75">
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

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'] as const;

function getDayName(date: string): string {
    return DAY_NAMES[new Date(date).getDay()];
}

function isWeekend(date: string): boolean {
    const dow = new Date(date).getDay();
    return dow === 0 || dow === 6;
}

function ChecklistCell({
    status,
    hasNotes,
    hasAttachments,
    onOpen,
}: {
    status: string | null;
    hasNotes: boolean;
    hasAttachments: boolean;
    onOpen?: () => void;
}) {
    const content = (
        <>
            {status === 'OK' && (
                <Check className="size-4 text-emerald-600" strokeWidth={3} />
            )}
            {status === 'NOT_OK' && (
                <X className="size-4 text-destructive" strokeWidth={3} />
            )}
            {status === 'NA' && (
                <span className="text-xs font-medium text-muted-foreground">
                    NA
                </span>
            )}
            {status === null && (
                <span className="text-muted-foreground">-</span>
            )}
            {(hasNotes || hasAttachments) && (
                <span className="absolute -top-1 -right-2 inline-flex size-3 items-center justify-center rounded-full bg-amber-500 text-[8px] leading-none font-bold text-white">
                    !
                </span>
            )}
        </>
    );

    if (onOpen) {
        return (
            <button
                type="button"
                className="relative inline-flex size-7 items-center justify-center rounded-md transition-colors hover:bg-amber-100 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none dark:hover:bg-amber-950/40"
                onClick={onOpen}
                aria-label="Lihat detail checklist"
            >
                {content}
            </button>
        );
    }

    return (
        <span className="relative inline-flex size-7 items-center justify-center">
            {content}
        </span>
    );
}

function ChecklistDetailDrawer({
    selected,
    onOpenChange,
}: {
    selected: SelectedChecklistCell | null;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <Drawer
            direction="right"
            open={selected !== null}
            onOpenChange={onOpenChange}
        >
            <DrawerContent className="overflow-hidden sm:max-w-md">
                <DrawerHeader className="border-b border-border/70">
                    <DrawerTitle>Detail Checklist</DrawerTitle>
                    <DrawerDescription>
                        {selected
                            ? `${selected.itemName} - ${selected.cell.date}`
                            : 'Detail catatan dan lampiran checklist.'}
                    </DrawerDescription>
                </DrawerHeader>

                {selected ? (
                    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
                        <div className="rounded-lg border border-border/70 p-3">
                            <p className="text-xs font-medium text-muted-foreground uppercase">
                                Kondisi standar
                            </p>
                            <p className="mt-1 text-sm">
                                {selected.standardCondition ?? '-'}
                            </p>
                        </div>

                        <div className="space-y-3">
                            {selected.cell.details.length > 0 ? (
                                selected.cell.details.map((detail, index) => (
                                    <div
                                        key={`${detail.operator ?? 'operator'}-${index}`}
                                        className="rounded-lg border border-border/70 bg-card p-3 shadow-sm"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-medium">
                                                    {detail.operator ?? '-'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {detail.status_label ??
                                                        detail.status ??
                                                        '-'}
                                                </p>
                                            </div>
                                            <Badge variant="outline">
                                                {detail.status ?? '-'}
                                            </Badge>
                                        </div>

                                        <div className="mt-3 space-y-2">
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground uppercase">
                                                    Catatan
                                                </p>
                                                <p className="mt-1 text-sm">
                                                    {detail.note &&
                                                    detail.note.trim() !== ''
                                                        ? detail.note
                                                        : '-'}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground uppercase">
                                                    Lampiran
                                                </p>
                                                {detail.attachment_url ? (
                                                    <Button
                                                        nativeButton={false}
                                                        variant="outline"
                                                        size="sm"
                                                        className="mt-2"
                                                        render={
                                                            <a
                                                                href={
                                                                    detail.attachment_url
                                                                }
                                                                target="_blank"
                                                                rel="noreferrer"
                                                            />
                                                        }
                                                    >
                                                        <Paperclip className="size-4" />
                                                        {detail.attachment_original_name ??
                                                            'Lihat lampiran'}
                                                    </Button>
                                                ) : (
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        Tidak ada lampiran.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                                    Tidak ada catatan atau lampiran pada cell
                                    ini.
                                </div>
                            )}
                        </div>
                    </div>
                ) : null}
            </DrawerContent>
        </Drawer>
    );
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
