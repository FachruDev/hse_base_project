import { router } from '@inertiajs/react';
import { Filter, Plus, RotateCcw, Search } from 'lucide-react';
import * as React from 'react';

import { b3StorageCreate, b3StorageIndex, b3StoragePhoto } from '@/actions/App/Http/Controllers/Web/DashboardController';
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
import type { B3StorageLogListingPayload } from '@/modules/dashboard/types';

type PenyimpananLimbahB3ListingProps = {
    listing: B3StorageLogListingPayload;
    userId: string;
};

export function PenyimpananLimbahB3Listing({ listing, userId }: PenyimpananLimbahB3ListingProps) {
    const [search, setSearch] = React.useState(listing.filters.search);
    const [movementType, setMovementType] = React.useState(listing.filters.movement_type || 'ALL');
    const [month, setMonth] = React.useState(String(listing.filters.month));
    const [year, setYear] = React.useState(String(listing.filters.year));
    const [perPage, setPerPage] = React.useState(String(listing.filters.per_page));
    const movementTypeItems = [
        { value: 'ALL', label: 'Semua tipe' },
        { value: 'MASUK', label: 'Masuk' },
        { value: 'KELUAR', label: 'Keluar' },
    ];
    const perPageItems = [
        { value: '10', label: '10 / halaman' },
        { value: '25', label: '25 / halaman' },
        { value: '50', label: '50 / halaman' },
    ];

    const submitFilters = (
        nextSearch: string,
        nextMovementType: string,
        nextMonth: string,
        nextYear: string,
        nextPerPage: string,
    ) => {
        router.get(
            b3StorageIndex.url({ query: { user_id: userId } }),
            {
                search: nextSearch || undefined,
                movement_type: nextMovementType === 'ALL' ? undefined : nextMovementType,
                month: Number(nextMonth),
                year: Number(nextYear),
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
                            <Button render={<a href={b3StorageCreate.url({ query: { user_id: userId } })} />}>
                                <Plus className="size-4" />
                                Tambah Entri B3
                            </Button>
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
                            className="grid gap-3 md:grid-cols-[minmax(0,1fr)_150px_130px_130px_120px_auto_auto]"
                            onSubmit={(event) => {
                                event.preventDefault();
                                submitFilters(search, movementType, month, year, perPage);
                            }}
                        >
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Cari dokumen, jenis limbah, dept"
                                    className="pl-8"
                                />
                            </div>

                            <Select
                                items={movementTypeItems}
                                value={movementType}
                                onValueChange={(value) => {
                                    const nextValue = value ?? 'ALL';
                                    setMovementType(nextValue);
                                    submitFilters(search, nextValue, month, year, perPage);
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Semua tipe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Semua tipe</SelectItem>
                                    <SelectItem value="MASUK">Masuk</SelectItem>
                                    <SelectItem value="KELUAR">Keluar</SelectItem>
                                </SelectContent>
                            </Select>

                            <Input
                                value={month}
                                onChange={(event) => setMonth(event.target.value)}
                                type="number"
                                min={1}
                                max={12}
                                placeholder="Bulan"
                            />
                            <Input
                                value={year}
                                onChange={(event) => setYear(event.target.value)}
                                type="number"
                                min={2000}
                                max={2100}
                                placeholder="Tahun"
                            />

                            <Select
                                items={perPageItems}
                                value={perPage}
                                onValueChange={(value) => {
                                    const nextValue = value ?? '10';
                                    setPerPage(nextValue);
                                    submitFilters(search, movementType, month, year, nextValue);
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
                                    setMovementType('ALL');
                                    setMonth(String(new Date().getMonth() + 1));
                                    setYear(String(new Date().getFullYear()));
                                    setPerPage('10');
                                    router.get(b3StorageIndex.url({ query: { user_id: userId } }));
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
                                    <TableHead>Tipe</TableHead>
                                    <TableHead>Jenis Limbah</TableHead>
                                    <TableHead>Dept Inisiator</TableHead>
                                    <TableHead>Berat (Kg)</TableHead>
                                    <TableHead>No. Dokumen</TableHead>
                                    <TableHead className="px-4">Foto</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {listing.table.data.length > 0 ? (
                                    listing.table.data.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell className="px-4 font-medium">
                                                {row.movement_date ?? '-'} {row.movement_time ?? ''}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={row.movement_type === 'MASUK' ? 'secondary' : 'outline'}>
                                                    {row.movement_type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{row.waste_type ?? '-'}</TableCell>
                                            <TableCell>{row.initiator_department ?? '-'}</TableCell>
                                            <TableCell>{row.weight_kg}</TableCell>
                                            <TableCell>{row.document_number}</TableCell>
                                            <TableCell className="px-4">
                                                {row.photo_path ? (
                                                    <a
                                                        href={b3StoragePhoto.url(
                                                            { log: row.id },
                                                            { query: { user_id: userId } },
                                                        )}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-sm text-primary underline"
                                                    >
                                                        Lihat Foto
                                                    </a>
                                                ) : (
                                                    '-'
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
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

function normalizePaginationLabel(label: string): string {
    return label
        .replace(/&laquo;\s*Previous/gi, 'Sebelumnya')
        .replace(/Next\s*&raquo;/gi, 'Berikutnya')
        .replace(/&amp;/g, '&')
        .replace(/<[^>]+>/g, '')
        .trim();
}
