import { router } from '@inertiajs/react';
import { Filter, Plus, RotateCcw, Search } from 'lucide-react';
import * as React from 'react';

import { catatanPengolahanLimbahAirCreate, catatanPengolahanLimbahAirIndex } from '@/actions/App/Http/Controllers/Web/DashboardController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
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
    const [perPage, setPerPage] = React.useState(String(listing.filters.per_page));

    const submitFilters = (nextSearch: string, nextStatus: string, nextPerPage: string) => {
        router.get(
            catatanPengolahanLimbahAirIndex.url({ query: { user_id: userId } }),
            {
                search: nextSearch || undefined,
                status: nextStatus === 'ALL' ? undefined : nextStatus,
                per_page: Number(nextPerPage),
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
                                <Badge variant="outline">Form Harian</Badge>
                                <CardTitle className="text-2xl">{listing.module.title}</CardTitle>
                                <CardDescription>{listing.module.subtitle}</CardDescription>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge variant={listing.today_entry.filled_today ? 'secondary' : 'destructive'}>
                                    {listing.today_entry.filled_today
                                        ? `Hari ini: ${listing.today_entry.status ?? 'DRAFT'}`
                                        : 'Hari ini belum diisi'}
                                </Badge>
                                <Button render={<a href={catatanPengolahanLimbahAirCreate.url({ query: { user_id: userId } })} />}>
                                    <Plus className="size-4" />
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
                            <CardTitle className="text-base">Filter Listing</CardTitle>
                        </div>
                        <form
                            className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_120px_auto_auto]"
                            onSubmit={(event) => {
                                event.preventDefault();
                                submitFilters(search, status, perPage);
                            }}
                        >
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Cari tanggal atau status"
                                    className="pl-8"
                                />
                            </div>

                            <Select
                                items={[
                                    { value: 'ALL', label: 'Semua status' },
                                    { value: 'DRAFT', label: 'Draft' },
                                    { value: 'SUBMITTED', label: 'Submitted' },
                                    { value: 'APPROVED', label: 'Approved' },
                                ]}
                                value={status}
                                onValueChange={(value) => {
                                    const nextValue = value ?? 'ALL';
                                    setStatus(nextValue);
                                    submitFilters(search, nextValue, perPage);
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Semua status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Semua status</SelectItem>
                                    <SelectItem value="DRAFT">Draft</SelectItem>
                                    <SelectItem value="SUBMITTED">Submitted</SelectItem>
                                    <SelectItem value="APPROVED">Approved</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                items={[
                                    { value: '10', label: '10 / halaman' },
                                    { value: '25', label: '25 / halaman' },
                                    { value: '50', label: '50 / halaman' },
                                ]}
                                value={perPage}
                                onValueChange={(value) => {
                                    const nextValue = value ?? '10';
                                    setPerPage(nextValue);
                                    submitFilters(search, status, nextValue);
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="10 / halaman" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10 / halaman</SelectItem>
                                    <SelectItem value="25">25 / halaman</SelectItem>
                                    <SelectItem value="50">50 / halaman</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button type="submit">Cari</Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setSearch('');
                                    setStatus('ALL');
                                    setPerPage('10');
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
                                    <TableHead className="px-4">Tanggal</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Dibuat</TableHead>
                                    <TableHead>Disubmit</TableHead>
                                    <TableHead className="px-4 text-right">Log ID</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {listing.table.data.length > 0 ? (
                                    listing.table.data.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell className="px-4 font-medium">{row.tanggal ?? '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant={resolveStatusVariant(row.status)}>{row.status}</Badge>
                                            </TableCell>
                                            <TableCell>{row.created_at ?? '-'}</TableCell>
                                            <TableCell>{row.submitted_at ?? '-'}</TableCell>
                                            <TableCell className="px-4 text-right text-muted-foreground">#{row.id}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                                            Belum ada data untuk filter yang dipilih.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <p className="text-sm text-muted-foreground">
                        Menampilkan {listing.table.meta.from ?? 0} - {listing.table.meta.to ?? 0} dari {listing.table.meta.total} entri.
                    </p>

                    <Pagination className="justify-end">
                        <PaginationContent>
                            {listing.table.meta.links.map((link, index) => {
                                const label = normalizePaginationLabel(link.label);

                                if (label === 'Sebelumnya') {
                                    return (
                                        <PaginationItem key={`${label}-${index}`}>
                                            <PaginationPrevious href={link.url ?? '#'} text={label} aria-disabled={link.url === null} />
                                        </PaginationItem>
                                    );
                                }

                                if (label === 'Berikutnya') {
                                    return (
                                        <PaginationItem key={`${label}-${index}`}>
                                            <PaginationNext href={link.url ?? '#'} text={label} aria-disabled={link.url === null} />
                                        </PaginationItem>
                                    );
                                }

                                return (
                                    <PaginationItem key={`${label}-${index}`}>
                                        <PaginationLink href={link.url ?? '#'} isActive={link.active}>
                                            {label}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            })}
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>
        </div>
    );
}

function resolveStatusVariant(status: string): 'default' | 'secondary' | 'outline' {
    if (status === 'APPROVED') {
        return 'default';
    }

    if (status === 'SUBMITTED') {
        return 'secondary';
    }

    return 'outline';
}

function normalizePaginationLabel(label: string): string {
    return label
        .replace(/&laquo;\s*Previous/gi, 'Sebelumnya')
        .replace(/Next\s*&raquo;/gi, 'Berikutnya')
        .replace(/&amp;/g, '&')
        .replace(/<[^>]+>/g, '')
        .trim();
}
