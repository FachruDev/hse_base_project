import { router } from '@inertiajs/react';
import {
    CalendarDays,
    CheckCircle2,
    ClipboardCheck,
    Droplets,
    Filter,
    Plus,
    RotateCcw,
    Search,
} from 'lucide-react';
import * as React from 'react';

import {
    catatanPengolahanLimbahAirApproveMonthlyProcess,
    catatanPengolahanLimbahAirCreate,
    catatanPengolahanLimbahAirIndex,
    catatanPengolahanLimbahAirMonthlyShow,
} from '@/actions/App/Http/Controllers/Web/DashboardController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type {
    CatatanPengolahanLimbahAirListingPayload,
    CatatanPengolahanLimbahAirMonthlyRow,
} from '@/modules/dashboard/types';

type CatatanPengolahanLimbahAirListingProps = {
    listing: CatatanPengolahanLimbahAirListingPayload;
    userId: string;
};

export function CatatanPengolahanLimbahAirListing({
    listing,
    userId,
}: CatatanPengolahanLimbahAirListingProps) {
    const [search, setSearch] = React.useState(listing.filters.search);
    const [status, setStatus] = React.useState(listing.filters.status || 'ALL');
    const [year, setYear] = React.useState(String(listing.filters.year));
    const statusItems = [
        { value: 'ALL', label: 'Semua status' },
        { value: 'DRAFT', label: 'Ada draft' },
        { value: 'SUBMITTED', label: 'Menunggu approval' },
        { value: 'APPROVED', label: 'Approved' },
    ];

    const submitFilters = (
        nextSearch: string,
        nextStatus: string,
        nextYear: string,
    ) => {
        router.get(
            catatanPengolahanLimbahAirIndex.url({ query: { user_id: userId } }),
            {
                search: nextSearch || undefined,
                status: nextStatus === 'ALL' ? undefined : nextStatus,
                year: Number(nextYear),
            },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(var(--muted))_0%,hsl(var(--background))_46%)] px-4 py-6 lg:px-6 lg:py-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-6">
                <Card className="border-none bg-[linear-gradient(135deg,hsl(var(--background))_0%,hsl(var(--muted))_100%)] shadow-sm ring-1 ring-border/60">
                    <CardHeader className="gap-4">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                            <div className="space-y-2">
                                <Badge variant="outline">
                                    Rekap Bulanan IPAL
                                </Badge>
                                <CardTitle className="text-2xl">
                                    {listing.module.title}
                                </CardTitle>
                                <CardDescription>
                                    {listing.module.subtitle}
                                </CardDescription>
                            </div>
                            <Button
                                nativeButton={false}
                                render={
                                    <a
                                        href={catatanPengolahanLimbahAirCreate.url(
                                            { query: { user_id: userId } },
                                        )}
                                    />
                                }
                            >
                                <Plus className="size-4" />
                                {listing.today_entry.action_label}
                            </Button>
                        </div>
                    </CardHeader>
                </Card>

                <div className="grid gap-4 md:grid-cols-4">
                    <SummaryCard
                        icon={<CalendarDays className="size-4" />}
                        label="Periode Ditampilkan"
                        value={`${listing.table.data.length} bulan`}
                    />
                    <SummaryCard
                        icon={<ClipboardCheck className="size-4" />}
                        label="Checklist Terisi"
                        value={`${sumRows(listing.table.data, 'checklist_days_count')} hari`}
                    />
                    <SummaryCard
                        icon={<Droplets className="size-4" />}
                        label="Catatan Proses"
                        value={`${sumRows(listing.table.data, 'process_logs_count')} log`}
                    />
                    <SummaryCard
                        icon={<CheckCircle2 className="size-4" />}
                        label="Checklist Approved"
                        value={`${listing.table.data.filter((row) => row.checklist_approval_status === 'APPROVED').length} bulan`}
                    />
                </div>

                <Card className="border-none shadow-sm ring-1 ring-border/60">
                    <CardHeader className="gap-4 border-b border-border/60 bg-muted/20">
                        <div className="flex items-center gap-2">
                            <Filter className="size-4 text-muted-foreground" />
                            <CardTitle className="text-base">
                                Filter Listing
                            </CardTitle>
                        </div>
                        <form
                            className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_140px_auto_auto]"
                            onSubmit={(event) => {
                                event.preventDefault();
                                submitFilters(search, status, year);
                            }}
                        >
                            <div className="relative">
                                <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Cari bulan atau periode"
                                    className="pl-8"
                                />
                            </div>

                            <Select
                                items={statusItems}
                                value={status}
                                onValueChange={(value) => {
                                    const nextValue = value ?? 'ALL';
                                    setStatus(nextValue);
                                    submitFilters(search, nextValue, year);
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Semua status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">
                                        Semua status
                                    </SelectItem>
                                    <SelectItem value="DRAFT">
                                        Ada draft
                                    </SelectItem>
                                    <SelectItem value="SUBMITTED">
                                        Menunggu approval
                                    </SelectItem>
                                    <SelectItem value="APPROVED">
                                        Approved
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Input
                                value={year}
                                onChange={(event) =>
                                    setYear(event.target.value)
                                }
                                type="number"
                                min={2000}
                                max={2100}
                                placeholder="Tahun"
                            />

                            <Button type="submit">Cari</Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    const currentYear = String(
                                        new Date().getFullYear(),
                                    );
                                    setSearch('');
                                    setStatus('ALL');
                                    setYear(currentYear);
                                    router.get(
                                        catatanPengolahanLimbahAirIndex.url({
                                            query: { user_id: userId },
                                        }),
                                    );
                                }}
                            >
                                <RotateCcw className="size-4" />
                                Reset
                            </Button>
                        </form>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="px-4">
                                        Periode
                                    </TableHead>
                                    <TableHead>Checklist</TableHead>
                                    <TableHead>Catatan Proses</TableHead>
                                    <TableHead>Batch Mixing</TableHead>
                                    <TableHead>Status Checklist</TableHead>
                                    <TableHead className="px-4 text-right">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {listing.table.data.length > 0 ? (
                                    listing.table.data.map((row) => (
                                        <TableRow
                                            key={`${row.year}-${row.month}`}
                                        >
                                            <TableCell className="px-4 font-medium">
                                                {row.period_label}
                                            </TableCell>
                                            <TableCell>
                                                {row.checklist_days_count} hari
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1.5">
                                                    <Badge variant="outline">
                                                        {row.process_logs_count}{' '}
                                                        log
                                                    </Badge>
                                                    <Badge variant="secondary">
                                                        {
                                                            row.process_draft_count
                                                        }{' '}
                                                        draft
                                                    </Badge>
                                                    <Badge variant="outline">
                                                        {
                                                            row.process_pending_count
                                                        }{' '}
                                                        menunggu
                                                    </Badge>
                                                    <Badge variant="default">
                                                        {
                                                            row.process_approved_count
                                                        }{' '}
                                                        approved
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {row.batch_mixing_days_count}{' '}
                                                hari
                                            </TableCell>
                                            <TableCell>
                                                <ChecklistApprovalBadge
                                                    row={row}
                                                />
                                            </TableCell>
                                            <TableCell className="px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {listing.capabilities
                                                        .can_approve_process_monthly &&
                                                    row.can_approve_period &&
                                                    row.process_pending_count >
                                                        0 ? (
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            className="bg-emerald-600 text-white hover:bg-emerald-700"
                                                            onClick={() => {
                                                                router.post(
                                                                    catatanPengolahanLimbahAirApproveMonthlyProcess.url(
                                                                        {
                                                                            year: row.year,
                                                                            month: row.month,
                                                                        },
                                                                        {
                                                                            query: {
                                                                                user_id:
                                                                                    userId,
                                                                            },
                                                                        },
                                                                    ),
                                                                    {},
                                                                );
                                                            }}
                                                        >
                                                            Approve Bulanan
                                                        </Button>
                                                    ) : null}
                                                    <Button
                                                        nativeButton={false}
                                                        variant="outline"
                                                        render={
                                                            <a
                                                                href={catatanPengolahanLimbahAirMonthlyShow.url(
                                                                    {
                                                                        year: row.year,
                                                                        month: row.month,
                                                                    },
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
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="px-4 py-10 text-center text-muted-foreground"
                                        >
                                            Belum ada data untuk filter yang
                                            dipilih.
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

type SummaryCardProps = {
    icon: React.ReactNode;
    label: string;
    value: string;
};

function SummaryCard({ icon, label, value }: SummaryCardProps) {
    return (
        <Card className="border-none shadow-sm ring-1 ring-border/60">
            <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                    {icon}
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-lg font-semibold">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function ChecklistApprovalBadge({
    row,
}: {
    row: CatatanPengolahanLimbahAirMonthlyRow;
}) {
    if (row.checklist_approval_status === 'APPROVED') {
        return (
            <div className="flex flex-col gap-1">
                <Badge variant="default">Approved</Badge>
                <span className="text-xs text-muted-foreground">
                    {row.checklist_approved_by ?? 'HSE Dept Head'}{' '}
                    {row.checklist_approved_at
                        ? `- ${row.checklist_approved_at}`
                        : ''}
                </span>
            </div>
        );
    }

    return <Badge variant="secondary">Belum Approved</Badge>;
}

function sumRows(
    rows: CatatanPengolahanLimbahAirMonthlyRow[],
    key: keyof CatatanPengolahanLimbahAirMonthlyRow,
): number {
    return rows.reduce((total, row) => {
        const value = row[key];

        return typeof value === 'number' ? total + value : total;
    }, 0);
}
