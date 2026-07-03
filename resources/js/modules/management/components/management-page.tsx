import { useForm } from '@inertiajs/react';
import { Database, FilePenLine, FolderTree, Plus, Search, Trash2 } from 'lucide-react';
import * as React from 'react';

import { destroy, index, store, update } from '@/actions/App/Http/Controllers/Web/ManagementController';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import type { ManagementField, ManagementFormValue, ManagementPayload } from '@/modules/management/types';

type ManagementPageProps = {
    flash: {
        success?: string | null;
        error?: string | null;
    };
    management: ManagementPayload;
    userId: string;
};

type FormState = Record<string, ManagementFormValue>;

export function ManagementPage({ flash, management, userId }: ManagementPageProps) {
    const [search, setSearch] = React.useState(management.filters.search);
    const [perPage, setPerPage] = React.useState(String(management.filters.per_page));
    const form = useForm<FormState>(management.form.values);
    const canSubmit = management.form.mode === 'edit' ? management.capabilities.update : management.capabilities.create;
    const hasRowActions = management.capabilities.update || management.capabilities.delete;

    React.useEffect(() => {
        form.setData(management.form.values);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [management.form.mode, management.form.editing_id, management.module.key]);

    const submitFilters = (nextSearch: string, nextPerPage: string) => {
        window.location.href = index.url(management.module.key, {
            query: {
                user_id: userId,
                search: nextSearch || undefined,
                per_page: Number(nextPerPage),
            },
        });
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!canSubmit) {
            return;
        }

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                if (management.form.mode === 'create') {
                    form.setData(management.form.values);
                }
            },
        };

        if (management.form.mode === 'edit' && management.form.editing_id !== null) {
            form.patch(
                update.url(
                    { module: management.module.key, record: management.form.editing_id },
                    { query: { user_id: userId } },
                ),
                options,
            );

            return;
        }

        form.post(store.url(management.module.key, { query: { user_id: userId } }), options);
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(var(--muted))_0%,hsl(var(--background))_48%)] px-4 py-6 lg:px-6 lg:py-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-6">
                <Card className="border-none bg-[linear-gradient(135deg,hsl(var(--background))_0%,hsl(var(--muted))_100%)] shadow-sm ring-1 ring-border/60">
                    <CardHeader className="gap-4">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                            <div className="space-y-2">
                                <Badge variant="outline">Management User</Badge>
                                <CardTitle className="text-2xl">{management.module.title}</CardTitle>
                                <CardDescription>{management.module.description}</CardDescription>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge variant="outline">{management.table.meta.total} data</Badge>
                                <Badge variant={canSubmit ? 'secondary' : 'outline'}>
                                    {canSubmit ? 'Bisa Kelola Data' : 'View Only'}
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

                <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {management.modules.map((module) => (
                        <a
                            key={module.key}
                            href={index.url(module.key, { query: { user_id: userId } })}
                            className={`rounded-2xl border p-4 transition-colors ${
                                module.key === management.module.key
                                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                                    : 'border-border/60 bg-card hover:bg-muted/30'
                            }`}
                        >
                            <p className="text-sm font-semibold">{module.short_label}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{module.title}</p>
                        </a>
                    ))}
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                    <Card className="border-none shadow-sm ring-1 ring-border/60">
                        <CardHeader className="gap-4 border-b border-border/60 bg-muted/20">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <CardTitle className="text-base">Daftar Data</CardTitle>
                                    <CardDescription>Listing management dengan pencarian dan pagination.</CardDescription>
                                </div>
                                <Badge variant="outline">{management.module.singular_label}</Badge>
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
                                        placeholder={management.module.search_placeholder}
                                        className="pl-8"
                                    />
                                </div>
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
                            {management.table.rows.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {management.table.columns.map((column) => (
                                                <TableHead key={column.key} className="px-4">
                                                    {column.label}
                                                </TableHead>
                                            ))}
                                            {hasRowActions ? <TableHead className="px-4 text-right">Aksi</TableHead> : null}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {management.table.rows.map((row) => (
                                            <TableRow key={row.id}>
                                                {management.table.columns.map((column) => (
                                                    <TableCell key={`${row.id}-${column.key}`} className="px-4">
                                                        {row.values[column.key] ?? '-'}
                                                    </TableCell>
                                                ))}
                                                {hasRowActions ? (
                                                    <TableCell className="px-4">
                                                        <div className="flex justify-end gap-2">
                                                            {management.capabilities.update ? (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    render={
                                                                        <a
                                                                            href={index.url(management.module.key, {
                                                                                query: { user_id: userId, edit: row.id },
                                                                            })}
                                                                        />
                                                                    }
                                                                >
                                                                    <FilePenLine className="size-4" />
                                                                    Edit
                                                                </Button>
                                                            ) : null}
                                                            {management.capabilities.delete ? (
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        if (!window.confirm('Hapus data ini?')) {
                                                                            return;
                                                                        }

                                                                        form.delete(
                                                                            destroy.url(
                                                                                { module: management.module.key, record: row.id },
                                                                                { query: { user_id: userId } },
                                                                            ),
                                                                            { preserveScroll: true },
                                                                        );
                                                                    }}
                                                                >
                                                                    <Trash2 className="size-4" />
                                                                    Hapus
                                                                </Button>
                                                            ) : null}
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
                                        <EmptyDescription>Mulai tambahkan data management untuk modul ini.</EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm ring-1 ring-border/60">
                        <CardHeader>
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <CardTitle className="text-base">{management.form.title}</CardTitle>
                                    <CardDescription>{management.form.description}</CardDescription>
                                </div>
                                {canSubmit ? (
                                    <Badge variant={management.form.mode === 'edit' ? 'secondary' : 'outline'}>
                                        {management.form.mode === 'edit' ? 'Mode Edit' : 'Mode Tambah'}
                                    </Badge>
                                ) : null}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {canSubmit ? (
                                <form className="space-y-4" onSubmit={handleSubmit}>
                                    <FieldGroup>
                                        {management.form.fields.map((field) => (
                                            <Field key={field.name}>
                                                <FieldLabel htmlFor={field.name}>
                                                    {field.label}
                                                    {field.required ? <span className="text-destructive">*</span> : null}
                                                </FieldLabel>
                                                <FieldContent>
                                                    <ManagementFieldInput field={field} form={form} />
                                                    <FieldError>{form.errors[field.name]}</FieldError>
                                                </FieldContent>
                                            </Field>
                                        ))}
                                    </FieldGroup>

                                    <div className="flex flex-wrap gap-3 pt-2">
                                        <Button type="submit" disabled={form.processing}>
                                            {management.form.mode === 'create' ? <Plus className="size-4" /> : <FilePenLine className="size-4" />}
                                            {management.form.submit_label}
                                        </Button>
                                        {management.form.cancel_edit ? (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                render={<a href={index.url(management.module.key, { query: { user_id: userId } })} />}
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
                                        <EmptyDescription>Role Anda hanya memiliki izin melihat data management untuk modul ini.</EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            )}
                        </CardContent>
                    </Card>
                </section>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <p className="text-sm text-muted-foreground">
                        Menampilkan {management.table.meta.from ?? 0} - {management.table.meta.to ?? 0} dari {management.table.meta.total} data.
                    </p>

                    <Pagination className="justify-end">
                        <PaginationContent>
                            {management.table.meta.links.map((link, indexItem) => {
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

function ManagementFieldInput({
    field,
    form,
}: {
    field: ManagementField;
    form: ReturnType<typeof useForm<FormState>>;
}) {
    const value = form.data[field.name];

    if (field.type === 'number') {
        return (
            <Input
                id={field.name}
                type="number"
                value={typeof value === 'number' ? value : typeof value === 'string' ? value : ''}
                onChange={(event) => form.setData(field.name, event.target.value === '' ? '' : Number(event.target.value))}
            />
        );
    }

    if (field.type === 'select' || field.type === 'boolean-select') {
        return (
            <Select
                items={(field.options ?? []).map((option) => ({
                    value: String(option.value),
                    label: option.label,
                }))}
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

    if (field.type === 'multi-checkbox') {
        const selectedValues = Array.isArray(value) ? value : [];
        const groupedOptions = groupOptions(field.options ?? []);

        return (
            <div className="max-h-72 space-y-4 overflow-auto rounded-md border border-border/60 p-3">
                {Object.entries(groupedOptions).map(([group, options]) => (
                    <div key={`${field.name}-${group}`} className="space-y-2">
                        <p className="text-xs font-semibold uppercase text-muted-foreground">{group}</p>
                        <div className="grid gap-2 sm:grid-cols-2">
                            {options.map((option) => {
                                const optionValue = String(option.value);

                                return (
                                    <label
                                        key={`${field.name}-${optionValue}`}
                                        className="flex items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-sm"
                                    >
                                        <Checkbox
                                            checked={selectedValues.includes(optionValue)}
                                            onCheckedChange={(checked) => {
                                                const nextValues = checked
                                                    ? [...selectedValues, optionValue]
                                                    : selectedValues.filter((item) => item !== optionValue);

                                                form.setData(field.name, nextValues);
                                            }}
                                        />
                                        <span className="min-w-0 truncate">{option.label}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <Input
            id={field.name}
            value={typeof value === 'string' ? value : typeof value === 'number' ? value : ''}
            onChange={(event) => form.setData(field.name, event.target.value)}
        />
    );
}

function resolveOptionValue(field: ManagementField, rawValue: string | null): string | number | boolean | null {
    if (rawValue === null) {
        return null;
    }

    const matchedOption = field.options?.find((option) => String(option.value) === rawValue);

    return matchedOption?.value ?? rawValue;
}

function groupOptions(options: ManagementField['options']): Record<string, NonNullable<ManagementField['options']>> {
    return (options ?? []).reduce<Record<string, NonNullable<ManagementField['options']>>>((groups, option) => {
        const group = option.group ?? 'lainnya';
        groups[group] = groups[group] ?? [];
        groups[group].push(option);

        return groups;
    }, {});
}

function normalizePaginationLabel(label: string): string {
    return label
        .replace(/&laquo;\s*Previous/gi, 'Sebelumnya')
        .replace(/Next\s*&raquo;/gi, 'Berikutnya')
        .replace(/&amp;/g, '&')
        .replace(/<[^>]+>/g, '')
        .trim();
}
