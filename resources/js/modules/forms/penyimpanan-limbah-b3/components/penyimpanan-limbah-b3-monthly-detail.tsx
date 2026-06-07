import { router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, FileImage, Scale } from 'lucide-react';

import {
    b3StorageApproveMonthly,
    b3StorageIndex,
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
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { B3StorageMonthlyDetailPayload } from '@/modules/dashboard/types';

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
            },
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
                                    variant="outline"
                                    render={
                                        <a
                                            href={b3StorageIndex.url({
                                                query: {
                                                    user_id: userId,
                                                    year: monthlyDetail.period
                                                        .year,
                                                },
                                            })}
                                        />
                                    }
                                >
                                    <ArrowLeft className="size-4" />
                                    Kembali ke Listing
                                </Button>
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

                <div className="grid gap-3 md:grid-cols-5">
                    <SummaryCard
                        label="Total Log"
                        value={`${monthlyDetail.summary.total_logs_count} log`}
                    />
                    <SummaryCard
                        label="Masuk"
                        value={`${monthlyDetail.summary.incoming_logs_count} log`}
                    />
                    <SummaryCard
                        label="Keluar"
                        value={`${monthlyDetail.summary.outgoing_logs_count} log`}
                    />
                    <SummaryCard
                        label="Total Berat"
                        value={`${formatWeight(monthlyDetail.summary.total_weight_kg)} kg`}
                    />
                    <SummaryCard
                        label="Approval"
                        value={monthlyDetail.approval.status_label}
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
                                    periode {monthlyDetail.period.label}.
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
                            <Table className="min-w-[1280px]">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="sticky left-0 z-10 w-12 min-w-12 bg-background px-3 text-center">
                                            No
                                        </TableHead>
                                        <TableHead className="min-w-[110px]">
                                            Masuk
                                        </TableHead>
                                        <TableHead className="min-w-[110px]">
                                            Keluar
                                        </TableHead>
                                        {monthlyDetail.columns.waste_types.map(
                                            (column) => (
                                                <TableHead
                                                    key={column.id}
                                                    className="min-w-[120px] text-center whitespace-normal"
                                                >
                                                    {column.name}
                                                </TableHead>
                                            ),
                                        )}
                                        {monthlyDetail.columns.has_other_column ? (
                                            <TableHead className="min-w-[120px] text-center">
                                                Yang Lain
                                            </TableHead>
                                        ) : null}
                                        <TableHead className="min-w-[160px]">
                                            No. Dokumen
                                        </TableHead>
                                        <TableHead className="min-w-[150px]">
                                            Dept. Inisiator
                                        </TableHead>
                                        <TableHead className="min-w-[150px]">
                                            Operator TPS LB3
                                        </TableHead>
                                        <TableHead className="min-w-[100px]">
                                            Foto
                                        </TableHead>
                                        <TableHead className="min-w-[180px]">
                                            Catatan
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {monthlyDetail.rows.length > 0 ? (
                                        monthlyDetail.rows.map((row) => (
                                            <TableRow key={row.id}>
                                                <TableCell className="sticky left-0 z-10 bg-background px-3 text-center font-medium">
                                                    {row.no}
                                                </TableCell>
                                                <TableCell>
                                                    {row.tanggal_masuk ?? '-'}
                                                    {row.tanggal_masuk &&
                                                    row.jam ? (
                                                        <span className="block text-xs text-muted-foreground">
                                                            {row.jam}
                                                        </span>
                                                    ) : null}
                                                </TableCell>
                                                <TableCell>
                                                    {row.tanggal_keluar ?? '-'}
                                                    {row.tanggal_keluar &&
                                                    row.jam ? (
                                                        <span className="block text-xs text-muted-foreground">
                                                            {row.jam}
                                                        </span>
                                                    ) : null}
                                                </TableCell>
                                                {monthlyDetail.columns.waste_types.map(
                                                    (column) => (
                                                        <TableCell
                                                            key={`${row.id}-${column.id}`}
                                                            className="text-center"
                                                        >
                                                            {formatNullableWeight(
                                                                row
                                                                    .weights_by_waste_type[
                                                                    String(
                                                                        column.id,
                                                                    )
                                                                ],
                                                            )}
                                                        </TableCell>
                                                    ),
                                                )}
                                                {monthlyDetail.columns
                                                    .has_other_column ? (
                                                    <TableCell
                                                        className="text-center"
                                                        title={
                                                            row.waste_type_other ??
                                                            undefined
                                                        }
                                                    >
                                                        {formatNullableWeight(
                                                            row.weight_other,
                                                        )}
                                                    </TableCell>
                                                ) : null}
                                                <TableCell>
                                                    {row.document_number}
                                                </TableCell>
                                                <TableCell>
                                                    {row.initiator_department ??
                                                        '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {row.operator_name ?? '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {row.photo_path ? (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            render={
                                                                <a
                                                                    href={b3StoragePhoto.url(
                                                                        {
                                                                            log: row.id,
                                                                        },
                                                                        {
                                                                            query: {
                                                                                user_id:
                                                                                    userId,
                                                                            },
                                                                        },
                                                                    )}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                />
                                                            }
                                                        >
                                                            <FileImage className="size-4" />
                                                            Foto
                                                        </Button>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </TableCell>
                                                <TableCell className="whitespace-normal">
                                                    {row.note ?? '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={
                                                    10 +
                                                    monthlyDetail.columns
                                                        .waste_types.length
                                                }
                                                className="px-4 py-10 text-center text-muted-foreground"
                                            >
                                                Belum ada log B3 pada periode
                                                ini.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TableCell
                                            colSpan={3}
                                            className="sticky left-0 z-10 bg-muted px-3 font-semibold"
                                        >
                                            Total
                                        </TableCell>
                                        {monthlyDetail.columns.waste_types.map(
                                            (column) => (
                                                <TableCell
                                                    key={`total-${column.id}`}
                                                    className="text-center font-semibold"
                                                >
                                                    {formatWeight(
                                                        monthlyDetail.totals
                                                            .by_waste_type[
                                                            String(column.id)
                                                        ] ?? 0,
                                                    )}
                                                </TableCell>
                                            ),
                                        )}
                                        {monthlyDetail.columns.has_other_column ? (
                                            <TableCell className="text-center font-semibold">
                                                {formatWeight(
                                                    monthlyDetail.totals.other,
                                                )}
                                            </TableCell>
                                        ) : null}
                                        <TableCell
                                            colSpan={5}
                                            className="font-semibold"
                                        >
                                            Overall:{' '}
                                            {formatWeight(
                                                monthlyDetail.totals.overall,
                                            )}{' '}
                                            kg
                                        </TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </div>
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

function formatNullableWeight(value: string | number | null): string {
    if (value === null || value === '') {
        return '-';
    }

    return formatWeight(value);
}

function formatWeight(value: string | number): string {
    return new Intl.NumberFormat('id-ID', {
        maximumFractionDigits: 3,
    }).format(Number(value));
}
