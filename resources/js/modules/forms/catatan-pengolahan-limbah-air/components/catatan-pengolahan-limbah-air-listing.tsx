import { router } from '@inertiajs/react';
import { CalendarDays, Filter, Plus, RotateCcw, Search } from 'lucide-react';
import * as React from 'react';

import {
    catatanPengolahanLimbahAirCreate,
    catatanPengolahanLimbahAirIndex,
    catatanPengolahanLimbahAirMonthlyShow,
} from '@/actions/App/Http/Controllers/Web/DashboardController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { CatatanPengolahanLimbahAirListingPayload } from '@/modules/dashboard/types';

type CatatanPengolahanLimbahAirListingProps = {
    listing: CatatanPengolahanLimbahAirListingPayload;
    userId: string;
};

export function CatatanPengolahanLimbahAirListing({ listing, userId }: CatatanPengolahanLimbahAirListingProps) {
    const [search, setSearch] = React.useState(listing.filters.search);
    const [status, setStatus] = React.useState(listing.filters.status || 'ALL');
    const [year, setYear] = React.useState(String(listing.filters.year));

    const submitFilters = (nextSearch: string, nextStatus: string, nextYear: string) => {
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
                                <Badge variant="outline">Laporan Bulanan</Badge>
                                <CardTitle className="text-2xl">{listing.module.title}</CardTitle>
                                <CardDescription>{listing.module.subtitle}</CardDescription>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge variant={listing.today_entry.filled_today ? 'secondary' : 'destructive'}>
                                    {listing.today_entry.filled_today
                                        ? 'Hari Ini Sudah Diisi'
                                        : 'Hari ini belum diisi'}
                                </Badge>
                                <Button render={<a href={catatanPengolahanLimbahAirCreate.url({ query: { user_id: userId } })} />}>
                                    {!listing.today_entry.filled_today ? <Plus className="size-4" /> : null}
                                    {listing.today_entry.action_label}
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <Card className="border-none shadow-sm ring-1 ring-border/60">
                    <CardHeader className="gap-4 border-b border-border/60 bg-muted/20">
                        <div className="flex items-center gap-2">
                            <Filter className="size-4 text-muted-foreground" />
                            <CardTitle className="text-base">Filter Periode</CardTitle>
                        </div>
                        <form
                            className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_130px_auto_auto]"
                            onSubmit={(event) => {
                                event.preventDefault();
                                submitFilters(search, status, year);
                            }}
                        >
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Cari bulan atau nomor bulan"
                                    className="pl-8"
                                />
                            </div>

                            <Select
                                items={[
                                    { value: 'ALL', label: 'Semua status proses' },
                                    { value: 'DRAFT', label: 'Draft' },
                                    { value: 'SUBMITTED', label: 'Pending' },
                                    { value: 'APPROVED', label: 'Approved' },
                                ]}
                                value={status}
                                onValueChange={(value) => {
                                    const nextValue = value ?? 'ALL';
                                    setStatus(nextValue);
                                    submitFilters(search, nextValue, year);
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Semua status proses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Semua status proses</SelectItem>
                                    <SelectItem value="DRAFT">Draft</SelectItem>
                                    <SelectItem value="SUBMITTED">Pending</SelectItem>
                                    <SelectItem value="APPROVED">Approved</SelectItem>
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

                            <Button type="submit">Cari</Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setSearch('');
                                    setStatus('ALL');
                                    setYear(String(new Date().getFullYear()));
                                    router.get(catatanPengolahanLimbahAirIndex.url({ query: { user_id: userId } }));
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
                                    <TableHead className="px-4">Periode</TableHead>
                                    <TableHead>Checklist</TableHead>
                                    <TableHead>Catatan Proses</TableHead>
                                    <TableHead>Batch Mixing</TableHead>
                                    <TableHead>Approval Checklist</TableHead>
                                    <TableHead className="px-4 text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {listing.table.data.length > 0 ? (
                                    listing.table.data.map((row) => (
                                        <TableRow key={`${row.year}-${row.month}`}>
                                            <TableCell className="px-4 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <CalendarDays className="size-4 text-muted-foreground" />
                                                    {row.period_label}
                                                </div>
                                            </TableCell>
                                            <TableCell>{row.checklist_days_count} hari</TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    <Badge variant="outline">{row.process_logs_count} log</Badge>
                                                    <Badge variant="outline">{row.process_draft_count} draft</Badge>
                                                    <Badge variant="secondary">{row.process_pending_count} pending</Badge>
                                                    <Badge>{row.process_approved_count} approved</Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>{row.batch_mixing_days_count} hari</TableCell>
                                            <TableCell>
                                                <Badge variant={row.checklist_approval_status === 'APPROVED' ? 'default' : 'outline'}>
                                                    {row.checklist_approval_status === 'APPROVED' ? 'Approved' : 'Belum Approved'}
                                                </Badge>
                                                {row.checklist_approved_by ? (
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {row.checklist_approved_by} - {row.checklist_approved_at}
                                                    </p>
                                                ) : null}
                                            </TableCell>
                                            <TableCell className="px-4 text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    render={
                                                        <a
                                                            href={catatanPengolahanLimbahAirMonthlyShow.url(
                                                                { year: row.year, month: row.month },
                                                                { query: { user_id: userId } },
                                                            )}
                                                        />
                                                    }
                                                >
                                                    Detail Bulan
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                                            Belum ada periode untuk filter yang dipilih.
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
