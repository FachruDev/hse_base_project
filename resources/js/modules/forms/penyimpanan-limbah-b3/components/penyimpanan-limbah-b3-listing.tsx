import { router } from '@inertiajs/react';
import { CalendarDays, Filter, Plus, RotateCcw, Search, CheckCircle, Eye } from 'lucide-react';
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
                                                        {listing.capabilities
                                                            .can_approve_b3_monthly &&
                                                        row.can_approve_period &&
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
                                                                        ),
                                                                        {
                                                                            approval_role:
                                                                                row.next_approval_role,
                                                                        },
                                                                    );
                                                                }}
                                                                <CheckCircle className="mr-2 size-4" />
                                                                {row.next_approval_label}
                                                            </Button>
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
        maximumFractionDigits: 3,
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
