import { useForm } from '@inertiajs/react';
import { Database, FilePenLine, FolderTree, Plus, Search, Trash2 } from 'lucide-react';
import * as React from 'react';

import { destroy, index, store, update } from '@/actions/App/Http/Controllers/Web/MasterDataController';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
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
import type { MasterDataField, MasterDataPayload } from '@/modules/master-data/types';

type MasterDataPageProps = {
    flash: {
        success?: string | null;
        error?: string | null;
    };
    masterData: MasterDataPayload;
    userId: string;
};

type FormState = Record<string, string | number | boolean | null>;

export function MasterDataPage({ flash, masterData, userId }: MasterDataPageProps) {
    const [search, setSearch] = React.useState(masterData.filters.search);
    const [perPage, setPerPage] = React.useState(String(masterData.filters.per_page));
    const form = useForm<FormState>(masterData.form.values);

    React.useEffect(() => {
        form.setData(masterData.form.values);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [masterData.form.mode, masterData.form.editing_id, masterData.module.key]);

    const submitFilters = (nextSearch: string, nextPerPage: string) => {
        window.location.href = index.url(masterData.module.key, {
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
                if (masterData.form.mode === 'create') {
                    form.setData(masterData.form.values);
                }
            },
        };

        if (masterData.form.mode === 'edit' && masterData.form.editing_id !== null) {
            form.patch(
                update.url(
                    { module: masterData.module.key, record: masterData.form.editing_id },
                    { query: { user_id: userId } },
                ),
                options,
            );

            return;
        }

        form.post(store.url(masterData.module.key, { query: { user_id: userId } }), options);
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(var(--muted))_0%,hsl(var(--background))_48%)] px-4 py-6 lg:px-6 lg:py-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-6">
                <Card className="border-none bg-[linear-gradient(135deg,hsl(var(--background))_0%,hsl(var(--muted))_100%)] shadow-sm ring-1 ring-border/60">
                    <CardHeader className="gap-4">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                            <div className="space-y-2">
                                <Badge variant="outline">Master Data</Badge>
                                <CardTitle className="text-2xl">{masterData.module.title}</CardTitle>
                                <CardDescription>{masterData.module.description}</CardDescription>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge variant="outline">{masterData.table.meta.total} data</Badge>
                                <Badge variant={masterData.capabilities.manage ? 'secondary' : 'outline'}>
                                    {masterData.capabilities.manage ? 'Bisa Kelola Data' : 'View Only'}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {flash.success ? (
                    <Alert>
                        <Database className="size-4" />
                        <AlertTitle>Berhasil</AlertTitle>
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                ) : null}

                {flash.error ? (
                    <Alert variant="destructive">
                        <Database className="size-4" />
                        <AlertTitle>Gagal</AlertTitle>
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                ) : null}

                <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {masterData.modules.map((module) => (
                        <a
                            key={module.key}
                            href={index.url(module.key, { query: { user_id: userId } })}
                            className={`rounded-2xl border p-4 transition-colors ${
                                module.key === masterData.module.key
                                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                                    : 'border-border/60 bg-card hover:bg-muted/30'
                            }`}
                        >
                            <p className="text-sm font-semibold">{module.short_label}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{module.title}</p>
                        </a>
                    ))}
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <Card className="border-none shadow-sm ring-1 ring-border/60">
                        <CardHeader className="gap-4 border-b border-border/60 bg-muted/20">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <CardTitle className="text-base">Daftar Data</CardTitle>
                                    <CardDescription>Listing data master dengan pencarian dan pagination.</CardDescription>
                                </div>
                                <Badge variant="outline">{masterData.module.singular_label}</Badge>
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
                                        placeholder={masterData.module.search_placeholder}
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
                            {masterData.table.rows.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {masterData.table.columns.map((column) => (
                                                <TableHead key={column.key} className="px-4">
                                                    {column.label}
                                                </TableHead>
                                            ))}
                                            {masterData.capabilities.manage ? <TableHead className="px-4 text-right">Aksi</TableHead> : null}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {masterData.table.rows.map((row) => (
                                            <TableRow key={row.id}>
                                                {masterData.table.columns.map((column) => (
                                                    <TableCell key={`${row.id}-${column.key}`} className="px-4">
                                                        {row.values[column.key] ?? '-'}
                                                    </TableCell>
                                                ))}
                                                {masterData.capabilities.manage ? (
                                                    <TableCell className="px-4">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                render={
                                                                    <a
                                                                        href={index.url(masterData.module.key, {
                                                                            query: { user_id: userId, edit: row.id },
                                                                        })}
                                                                    />
                                                                }
                                                            >
                                                                <FilePenLine className="size-4" />
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => {
                                                                    if (!window.confirm('Hapus data ini?')) {
                                                                        return;
                                                                    }

                                                                    form.delete(
                                                                        destroy.url(
                                                                            { module: masterData.module.key, record: row.id },
                                                                            { query: { user_id: userId } },
                                                                        ),
                                                                        {
                                                                            preserveScroll: true,
                                                                        },
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
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <Empty className="rounded-none border-0">
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <FolderTree />
                                        </EmptyMedia>
                                        <EmptyTitle>Belum ada data</EmptyTitle>
                                        <EmptyDescription>Mulai tambahkan data master untuk modul ini.</EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm ring-1 ring-border/60">
                        <CardHeader>
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <CardTitle className="text-base">{masterData.form.title}</CardTitle>
                                    <CardDescription>{masterData.form.description}</CardDescription>
                                </div>
                                {masterData.capabilities.manage ? (
                                    <Badge variant={masterData.form.mode === 'edit' ? 'secondary' : 'outline'}>
                                        {masterData.form.mode === 'edit' ? 'Mode Edit' : 'Mode Tambah'}
                                    </Badge>
                                ) : null}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {masterData.capabilities.manage ? (
                                <form className="space-y-4" onSubmit={handleSubmit}>
                                    <FieldGroup>
                                        {masterData.form.fields.map((field) => (
                                            <Field key={field.name}>
                                                <FieldLabel htmlFor={field.name}>
                                                    {field.label}
                                                    {field.required ? <span className="text-destructive">*</span> : null}
                                                </FieldLabel>
                                                <FieldContent>
                                                    <MasterDataFieldInput field={field} form={form} />
                                                    <FieldError>{form.errors[field.name]}</FieldError>
                                                </FieldContent>
                                            </Field>
                                        ))}
                                    </FieldGroup>

                                    <div className="flex flex-wrap gap-3 pt-2">
                                        <Button type="submit" disabled={form.processing}>
                                            {masterData.form.mode === 'create' ? <Plus className="size-4" /> : <FilePenLine className="size-4" />}
                                            {masterData.form.submit_label}
                                        </Button>
                                        {masterData.form.cancel_edit ? (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                render={<a href={index.url(masterData.module.key, { query: { user_id: userId } })} />}
                                            >
                                                Batal Edit
                                            </Button>
                                        ) : null}
                                    </div>
                                </form>
                            ) : (
                                <Empty className="border border-dashed border-border/60">
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <Database />
                                        </EmptyMedia>
                                        <EmptyTitle>Akses kelola tidak tersedia</EmptyTitle>
                                        <EmptyDescription>Role Anda hanya memiliki izin melihat data master untuk modul ini.</EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            )}
                        </CardContent>
                    </Card>
                </section>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <p className="text-sm text-muted-foreground">
                        Menampilkan {masterData.table.meta.from ?? 0} - {masterData.table.meta.to ?? 0} dari {masterData.table.meta.total} data.
                    </p>

                    <Pagination className="justify-end">
                        <PaginationContent>
                            {masterData.table.meta.links.map((link, indexItem) => {
                                const label = normalizePaginationLabel(link.label);

                                if (label === 'Sebelumnya') {
                                    return (
                                        <PaginationItem key={`${label}-${indexItem}`}>
                                            <PaginationPrevious href={link.url ?? '#'} text={label} aria-disabled={link.url === null} />
                                        </PaginationItem>
                                    );
                                }

                                if (label === 'Berikutnya') {
                                    return (
                                        <PaginationItem key={`${label}-${indexItem}`}>
                                            <PaginationNext href={link.url ?? '#'} text={label} aria-disabled={link.url === null} />
                                        </PaginationItem>
                                    );
                                }

                                return (
                                    <PaginationItem key={`${label}-${indexItem}`}>
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

function MasterDataFieldInput({
    field,
    form,
}: {
    field: MasterDataField;
    form: ReturnType<typeof useForm<FormState>>;
}) {
    const value = form.data[field.name];

    if (field.type === 'textarea') {
        return (
            <Textarea
                id={field.name}
                value={typeof value === 'string' ? value : ''}
                onChange={(event) => form.setData(field.name, event.target.value)}
                placeholder={field.placeholder}
            />
        );
    }

    if (field.type === 'number') {
        return (
            <Input
                id={field.name}
                type="number"
                value={typeof value === 'number' ? value : typeof value === 'string' ? value : ''}
                onChange={(event) => form.setData(field.name, event.target.value === '' ? '' : Number(event.target.value))}
                placeholder={field.placeholder}
            />
        );
    }

    if (field.type === 'select' || field.type === 'boolean-select') {
        return (
            <Select
                value={value === null || value === undefined ? undefined : String(value)}
                onValueChange={(rawValue) => {
                    const resolvedValue = resolveOptionValue(field, rawValue);
                    form.setData(field.name, resolvedValue);
                }}
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={`Pilih ${field.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                    {field.options?.map((option) => (
                        <SelectItem key={`${field.name}-${String(option.value)}`} value={String(option.value)}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        );
    }

    return (
        <Input
            id={field.name}
            value={typeof value === 'string' ? value : typeof value === 'number' ? value : ''}
            onChange={(event) => form.setData(field.name, event.target.value)}
            placeholder={field.placeholder}
        />
    );
}

function resolveOptionValue(field: MasterDataField, rawValue: string | null): string | number | boolean | null {
    if (rawValue === null) {
        return null;
    }

    const matchedOption = field.options?.find((option) => String(option.value) === rawValue);

    return matchedOption?.value ?? rawValue;
}

function normalizePaginationLabel(label: string): string {
    return label
        .replace(/&laquo;\s*Previous/gi, 'Sebelumnya')
        .replace(/Next\s*&raquo;/gi, 'Berikutnya')
        .replace(/&amp;/g, '&')
        .replace(/<[^>]+>/g, '')
        .trim();
}

