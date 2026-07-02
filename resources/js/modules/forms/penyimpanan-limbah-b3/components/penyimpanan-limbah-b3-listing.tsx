import { router } from '@inertiajs/react';
import {
    ArrowDownToLine,
    ArrowUpFromLine,
    CalendarDays,
    CheckCircle,
    Eye,
    Filter,
    Plus,
    RotateCcw,
    Scale,
    Search,
    type LucideIcon,
} from 'lucide-react';
import * as React from 'react';

import {
    b3StorageCreate,
    b3StorageIndex,
    b3StorageApproveMonthly,
    b3StorageMonthlyShow,
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
import type { B3StorageLogListingPayload } from '@/modules/dashboard/types';

type PenyimpananLimbahB3ListingProps = {
    listing: B3StorageLogListingPayload;
    userId: string;
};

export function PenyimpananLimbahB3Listing({
    listing,
    userId,
}: PenyimpananLimbahB3ListingProps) {
    const [search, setSearch] = React.useState(listing.filters.search);
    const [status, setStatus] = React.useState(listing.filters.status || 'ALL');
    const [year, setYear] = React.useState(String(listing.filters.year));
    const [dateFrom, setDateFrom] = React.useState(listing.filters.date_from);
    const [dateTo, setDateTo] = React.useState(listing.filters.date_to);
    const statusItems = [
        { value: 'ALL', label: 'Semua status' },
        { value: 'NOT_SUBMITTED', label: 'Belum Approved' },
        { value: 'PARTIALLY_APPROVED', label: 'Menunggu HSE' },
        { value: 'APPROVED', label: 'Approved' },
    ];

    const submitFilters = (
        nextSearch: string,
        nextStatus: string,
        nextYear: string,
        nextDateFrom: string,
        nextDateTo: string,
    ) => {
        router.get(
            b3StorageIndex.url({ query: { user_id: userId } }),
            {
                search: nextSearch || undefined,
                status: nextStatus === 'ALL' ? undefined : nextStatus,
                year: Number(nextYear),
                date_from: nextDateFrom || undefined,
                date_to: nextDateTo || undefined,
            },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <div className="min-h-screen w-full max-w-full min-w-0 overflow-x-hidden bg-[radial-gradient(circle_at_top_left,hsl(var(--muted))_0%,hsl(var(--background))_46%)] px-3 py-5 sm:px-4 lg:px-6 lg:py-8">
            <div className="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-5 lg:gap-6">
                <Card className="min-w-0 border-none bg-[linear-gradient(135deg,hsl(var(--background))_0%,hsl(var(--muted))_100%)] shadow-sm ring-1 ring-border/60">
                    <CardHeader className="gap-4">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                            <div className="min-w-0 space-y-2">
                                <Badge variant="outline">Laporan Bulanan</Badge>
                                <CardTitle className="text-xl sm:text-2xl">
                                    {listing.module.title}
                                </CardTitle>
                                <CardDescription>
                                    {listing.module.subtitle}
                                </CardDescription>
                            </div>
                            {listing.capabilities.create_log ? (
                                <Button
                                    render={
                                        <a
                                            href={b3StorageCreate.url({
                                                query: { user_id: userId },
                                            })}
                                        />
                                    }
                                >
                                    <Plus className="size-4" />
                                    Tambah Entri B3
                                </Button>
                            ) : null}
                        </div>
                    </CardHeader>
                </Card>

                <div className="grid gap-3 md:grid-cols-4">
                    <SummaryCard
                        icon={CalendarDays}
                        tone="sky"
                        label="Total Log"
                        value={`${sumRows(listing.table.data, 'total_logs_count')} log`}
                    />
                    <SummaryCard
                        icon={ArrowDownToLine}
                        tone="emerald"
                        label="Masuk"
                        value={`${sumRows(listing.table.data, 'incoming_logs_count')} log`}
                    />
                    <SummaryCard
                        icon={ArrowUpFromLine}
                        tone="rose"
                        label="Keluar"
                        value={`${sumRows(listing.table.data, 'outgoing_logs_count')} log`}
                    />
                    <SummaryCard
                        icon={Scale}
                        tone="amber"
                        label="Total Berat"
                        value={`${formatWeight(sumRows(listing.table.data, 'total_weight_kg'))} kg`}
                    />
                </div>

                <Card className="min-w-0 border-none shadow-sm ring-1 ring-border/60">
                    <CardHeader className="gap-4 border-b border-border/60 bg-muted/20">
                        <div className="flex items-center gap-2">
                            <Filter className="size-4 text-muted-foreground" />
                            <CardTitle className="text-base">Filter Listing</CardTitle>
                        </div>
                        <form
                            className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_130px_auto_auto]"
                            onSubmit={(event) => {
                                event.preventDefault();
                                submitFilters(search, status, year, dateFrom, dateTo);
                            }}
                        >
                            <div className="relative">
                                <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Cari bulan atau angka bulan"
                                    className="pl-8"
                                />
                            </div>

                            <Select
                                items={statusItems}
                                value={status}
                                onValueChange={(value) => {
                                    const nextValue = value ?? 'ALL';

                                    setStatus(nextValue);
                                    submitFilters(search, nextValue, year, dateFrom, dateTo);
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Semua status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusItems.map((item) => (
                                        <SelectItem
                                            key={item.value}
                                            value={item.value}
                                        >
                                            {item.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Input
                                value={year}
                                onChange={(event) => setYear(event.target.value)}
                                type="number"
                                min={2000}
                                max={2100}
                                placeholder="Tahun"
                            />

                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-muted-foreground">Dari</label>
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(event) =>
                                        setDateFrom(event.target.value)
                                    }
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-muted-foreground">Sampai</label>
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(event) =>
                                        setDateTo(event.target.value)
                                    }
                                />
                            </div>

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
                                    setDateFrom('');
                                    setDateTo('');
                                    router.get(
                                        b3StorageIndex.url({
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
                        <div className="w-full max-w-full min-w-0 overflow-x-auto">
                            <Table className="min-w-[980px]">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="px-4">
                                            Periode
                                        </TableHead>
                                        <TableHead>Masuk</TableHead>
                                        <TableHead>Keluar</TableHead>
                                        <TableHead>Total Berat</TableHead>
                                        <TableHead>Jenis/Dept</TableHead>
                                        <TableHead>Approval</TableHead>
                                        <TableHead className="px-4 text-right">
                                            Aksi
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {listing.table.data.length > 0 ? (
                                        listing.table.data.map((row) => (
                                            <TableRow
                                                className='transition-colors odd:bg-primary/10 hover:bg-primary/15'
                                                key={`${row.year}-${row.month}`}
                                            >
                                                <TableCell className="px-4 font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <CalendarDays className="size-4 text-muted-foreground" />
                                                        {row.period_label}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {row.incoming_logs_count} log
                                                </TableCell>
                                                <TableCell>
                                                    {row.outgoing_logs_count} log
                                                </TableCell>
                                                <TableCell>
                                                    {formatWeight(
                                                        row.total_weight_kg,
                                                    )}{' '}
                                                    kg
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        <Badge variant="outline">
                                                            {
                                                                row.waste_types_count
                                                            }{' '}
                                                            jenis
                                                        </Badge>
                                                        <Badge variant="outline">
                                                            {
                                                                row.departments_count
                                                            }{' '}
                                                            dept
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={resolveStatusVariant(
                                                            row.approval_status,
                                                        )}
                                                    >
                                                        {
                                                            row.approval_status_label
                                                        }
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {row.can_approve_monthly &&
                                                        row.next_approval_role !==
                                                            null ? (
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                className="bg-emerald-600 text-white hover:bg-emerald-700"
                                                                onClick={() => {
                                                                    router.post(
                                                                        b3StorageApproveMonthly.url(
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
                                                                        {
                                                                            approval_role:
                                                                                row.next_approval_role,
                                                                            date_from:
                                                                                dateFrom ||
                                                                                undefined,
                                                                            date_to:
                                                                                dateTo ||
                                                                                undefined,
                                                                        },
                                                                    );
                                                                }}
                                                            >
                                                                <CheckCircle className="mr-2 size-4" />
                                                                {row.next_approval_label}
                                                            </Button>
                                                        ) : row.approval_blocked_label ? (
                                                            <Badge variant="secondary">
                                                                {
                                                                    row.approval_blocked_label
                                                                }
                                                            </Badge>
                                                        ) : null}
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            render={
                                                                <a
                                                                    href={b3StorageMonthlyShow.url(
                                                                        {
                                                                            year: row.year,
                                                                            month: row.month,
                                                                        },
                                                                        {
                                                                            query: {
                                                                                user_id:
                                                                                    userId,
                                                                                date_from:
                                                                                    dateFrom ||
                                                                                    undefined,
                                                                                date_to:
                                                                                    dateTo ||
                                                                                    undefined,
                                                                            },
                                                                        },
                                                                    )}
                                                                />
                                                            }
                                                        >
                                                            <Eye className="size-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                className="px-4 py-10 text-center text-muted-foreground"
                                            >
                                                Belum ada periode untuk filter
                                                yang dipilih.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function formatWeight(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

function resolveStatusVariant(
    status: string,
): 'default' | 'secondary' | 'outline' {
    if (status === 'APPROVED') {
        return 'default';
    }

    if (status === 'PARTIALLY_APPROVED') {
        return 'secondary';
    }

    return 'outline';
}

type SummaryTone = 'sky' | 'emerald' | 'rose' | 'amber';

function SummaryCard({
    icon: Icon,
    tone,
    label,
    value,
}: {
    icon: LucideIcon;
    tone: SummaryTone;
    label: string;
    value: string;
}) {
    const toneClass: Record<SummaryTone, string> = {
        sky: 'bg-sky-50 text-sky-700 ring-sky-100 dark:bg-sky-950/30 dark:text-sky-300 dark:ring-sky-900/40',
        emerald:
            'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300 dark:ring-emerald-900/40',
        rose: 'bg-rose-50 text-rose-700 ring-rose-100 dark:bg-rose-950/30 dark:text-rose-300 dark:ring-rose-900/40',
        amber: 'bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-950/30 dark:text-amber-300 dark:ring-amber-900/40',
    };

    return (
        <Card className={`${toneClass[tone]} border-none shadow-sm ring-1`}>
            <CardContent className="flex items-center justify-between gap-3 p-4">
                <div>
                    <p className="text-xs font-medium opacity-75 uppercase">
                        {label}
                    </p>
                    <p className="text-lg font-semibold">{value}</p>
                </div>
                <span className="inline-flex size-9 items-center justify-center rounded-md bg-white/70 shadow-sm dark:bg-white/10">
                    <Icon className="size-4" />
                </span>
            </CardContent>
        </Card>
    );
}

function sumRows(
    rows: B3StorageLogListingPayload['table']['data'],
    key: keyof B3StorageLogListingPayload['table']['data'][number],
): number {
    return rows.reduce((total, row) => {
        const value = row[key];

        return typeof value === 'number' ? total + value : total;
    }, 0);
}
