import { useForm } from '@inertiajs/react';
import { CalendarDays, FilePenLine, Plus, Search, Trash2 } from 'lucide-react';
import * as React from 'react';

import { holidayDestroy, holidayIndex, holidayStore, holidayUpdate } from '@/actions/App/Http/Controllers/Web/ConfigurationController';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
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
import { Textarea } from '@/components/ui/textarea';
import type { HolidayConfigurationPayload } from '@/modules/configuration/types';

type HolidayConfigurationPageProps = {
    flash: {
        success?: string | null;
        error?: string | null;
    };
    holidayConfiguration: HolidayConfigurationPayload;
    userId: string;
};

type HolidayFormState = {
    holiday_date: string;
    name: string;
    description: string;
    is_active: boolean;
};

export function HolidayConfigurationPage({ flash, holidayConfiguration, userId }: HolidayConfigurationPageProps) {
    const [search, setSearch] = React.useState(holidayConfiguration.filters.search);
    const [perPage, setPerPage] = React.useState(String(holidayConfiguration.filters.per_page));
    const form = useForm<HolidayFormState>(holidayConfiguration.form.values);

    React.useEffect(() => {
        form.setData(holidayConfiguration.form.values);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [holidayConfiguration.form.mode, holidayConfiguration.form.editing_id]);

    const submitFilters = (nextSearch: string, nextPerPage: string) => {
        window.location.href = holidayIndex.url({
            query: {
                user_id: userId,
                search: nextSearch || undefined,
                per_page: Number(nextPerPage),
            },
        });
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                if (holidayConfiguration.form.mode === 'create') {
                    form.setData(holidayConfiguration.form.values);
                }
            },
        };

        if (holidayConfiguration.form.mode === 'edit' && holidayConfiguration.form.editing_id !== null) {
            form.patch(
                holidayUpdate.url(
                    { holiday: holidayConfiguration.form.editing_id },
                    { query: { user_id: userId } },
                ),
                options,
            );

            return;
        }

        form.post(
            holidayStore.url({ query: { user_id: userId } }),
            options,
        );
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(var(--muted))_0%,hsl(var(--background))_48%)] px-4 py-6 lg:px-6 lg:py-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-6">
                <Card className="border-none bg-[linear-gradient(135deg,hsl(var(--background))_0%,hsl(var(--muted))_100%)] shadow-sm ring-1 ring-border/60">
                    <CardHeader className="gap-3">
                        <Badge variant="outline" className="w-fit">Configurasi</Badge>
                        <CardTitle className="text-2xl">{holidayConfiguration.module.title}</CardTitle>
                        <CardDescription>{holidayConfiguration.module.description}</CardDescription>
                    </CardHeader>
                </Card>

                {flash.success ? (
                    <Alert>
                        <CalendarDays className="size-4" />
                        <AlertTitle>Berhasil</AlertTitle>
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                ) : null}

                {flash.error ? (
                    <Alert variant="destructive">
                        <CalendarDays className="size-4" />
                        <AlertTitle>Gagal</AlertTitle>
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                ) : null}

                <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <Card className="border-none shadow-sm ring-1 ring-border/60">
                        <CardHeader className="gap-4 border-b border-border/60 bg-muted/20">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">Daftar Holiday</CardTitle>
                                <Badge variant={holidayConfiguration.capabilities.manage ? 'secondary' : 'outline'}>
                                    {holidayConfiguration.capabilities.manage ? 'Bisa Kelola' : 'View Only'}
                                </Badge>
                            </div>

                            <form
                                className="grid gap-3 md:grid-cols-[minmax(0,1fr)_140px_auto]"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    submitFilters(search, perPage);
                                }}
                            >
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Cari nama holiday atau tanggal"
                                        className="pl-8"
                                    />
                                </div>
                                <Select
                                    value={perPage}
                                    onValueChange={(value) => {
                                        const nextValue = value ?? '10';
                                        setPerPage(nextValue);
                                        submitFilters(search, nextValue);
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
                            </form>
                        </CardHeader>

                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="px-4">Tanggal</TableHead>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Status</TableHead>
                                        {holidayConfiguration.capabilities.manage ? <TableHead className="px-4 text-right">Aksi</TableHead> : null}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {holidayConfiguration.table.rows.length > 0 ? (
                                        holidayConfiguration.table.rows.map((row) => (
                                            <TableRow key={row.id}>
                                                <TableCell className="px-4">{row.holiday_date ?? '-'}</TableCell>
                                                <TableCell>
                                                    <p className="font-medium">{row.name}</p>
                                                    <p className="text-xs text-muted-foreground">{row.description ?? '-'}</p>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={row.is_active ? 'secondary' : 'outline'}>{row.status}</Badge>
                                                </TableCell>
                                                {holidayConfiguration.capabilities.manage ? (
                                                    <TableCell className="px-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                render={(
                                                                    <a
                                                                        href={holidayIndex.url({
                                                                            query: { user_id: userId, edit: row.id },
                                                                        })}
                                                                    />
                                                                )}
                                                            >
                                                                <FilePenLine className="size-4" />
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => {
                                                                    if (!window.confirm('Hapus holiday ini?')) {
                                                                        return;
                                                                    }

                                                                    form.delete(
                                                                        holidayDestroy.url(
                                                                            { holiday: row.id },
                                                                            { query: { user_id: userId } },
                                                                        ),
                                                                        { preserveScroll: true },
                                                                    );
                                                                }}
                                                            >
                                                                <Trash2 className="size-4" />
                                                                Hapus
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                ) : null}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                                Belum ada holiday.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm ring-1 ring-border/60">
                        <CardHeader>
                            <CardTitle className="text-base">{holidayConfiguration.form.title}</CardTitle>
                            <CardDescription>Form holiday untuk hari libur dadakan atau non-weekend.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {holidayConfiguration.capabilities.manage ? (
                                <form className="space-y-4" onSubmit={handleSubmit}>
                                    <FieldGroup>
                                        <Field>
                                            <FieldLabel htmlFor="holiday_date">Tanggal</FieldLabel>
                                            <FieldContent>
                                                <Input
                                                    id="holiday_date"
                                                    type="date"
                                                    value={form.data.holiday_date}
                                                    onChange={(event) => form.setData('holiday_date', event.target.value)}
                                                />
                                                <FieldError>{form.errors.holiday_date}</FieldError>
                                            </FieldContent>
                                        </Field>

                                        <Field>
                                            <FieldLabel htmlFor="name">Nama Holiday</FieldLabel>
                                            <FieldContent>
                                                <Input
                                                    id="name"
                                                    value={form.data.name}
                                                    onChange={(event) => form.setData('name', event.target.value)}
                                                />
                                                <FieldError>{form.errors.name}</FieldError>
                                            </FieldContent>
                                        </Field>

                                        <Field>
                                            <FieldLabel htmlFor="description">Deskripsi</FieldLabel>
                                            <FieldContent>
                                                <Textarea
                                                    id="description"
                                                    value={form.data.description}
                                                    onChange={(event) => form.setData('description', event.target.value)}
                                                />
                                                <FieldError>{form.errors.description}</FieldError>
                                            </FieldContent>
                                        </Field>

                                        <Field>
                                            <FieldLabel>Status</FieldLabel>
                                            <FieldContent>
                                                <Select
                                                    value={form.data.is_active ? 'ACTIVE' : 'INACTIVE'}
                                                    onValueChange={(value) => form.setData('is_active', value === 'ACTIVE')}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="ACTIVE">Aktif</SelectItem>
                                                        <SelectItem value="INACTIVE">Nonaktif</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FieldError>{form.errors.is_active}</FieldError>
                                            </FieldContent>
                                        </Field>
                                    </FieldGroup>

                                    <div className="flex flex-wrap gap-3 pt-1">
                                        <Button type="submit" disabled={form.processing}>
                                            {holidayConfiguration.form.mode === 'create' ? <Plus className="size-4" /> : <FilePenLine className="size-4" />}
                                            {holidayConfiguration.form.submit_label}
                                        </Button>
                                        {holidayConfiguration.form.cancel_edit ? (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                render={<a href={holidayIndex.url({ query: { user_id: userId } })} />}
                                            >
                                                Batal Edit
                                            </Button>
                                        ) : null}
                                    </div>
                                </form>
                            ) : (
                                <p className="text-sm text-muted-foreground">Role Anda hanya memiliki akses melihat konfigurasi holiday.</p>
                            )}
                        </CardContent>
                    </Card>
                </section>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <p className="text-sm text-muted-foreground">
                        Menampilkan {holidayConfiguration.table.meta.from ?? 0} - {holidayConfiguration.table.meta.to ?? 0} dari {holidayConfiguration.table.meta.total} data.
                    </p>

                    <Pagination className="justify-end">
                        <PaginationContent>
                            {holidayConfiguration.table.meta.links.map((link, index) => {
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
