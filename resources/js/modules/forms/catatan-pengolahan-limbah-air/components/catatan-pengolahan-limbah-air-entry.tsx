import { ArrowLeft, ChevronDown, CircleAlert, ClipboardCheck, Droplets, FlaskConical, Save } from 'lucide-react';
import * as React from 'react';

import { catatanPengolahanLimbahAirIndex } from '@/actions/App/Http/Controllers/Web/DashboardController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import type { BatchField, CatatanPengolahanLimbahAirEntryPayload } from '@/modules/dashboard/types';

type CatatanPengolahanLimbahAirEntryProps = {
    entryForm: CatatanPengolahanLimbahAirEntryPayload;
    userId: string;
};

export function CatatanPengolahanLimbahAirEntry({ entryForm, userId }: CatatanPengolahanLimbahAirEntryProps) {
    const [processQuery, setProcessQuery] = React.useState('');
    const [collapsedSections, setCollapsedSections] = React.useState<Record<number, boolean>>({});
    const [checklistPanelCollapsed, setChecklistPanelCollapsed] = React.useState(false);
    const [processPanelCollapsed, setProcessPanelCollapsed] = React.useState(false);
    const [hasMixingProcess, setHasMixingProcess] = React.useState<boolean>(() => hasAnyBatchValue(entryForm));
    const [activeBatchNo, setActiveBatchNo] = React.useState<number>(entryForm.batch.groups[0]?.batch_no ?? 1);

    React.useEffect(() => {
        setCollapsedSections((current) => {
            const next: Record<number, boolean> = {};

            for (const section of entryForm.process.sections) {
                next[section.id] = current[section.id] ?? false;
            }

            return next;
        });

        setHasMixingProcess(hasAnyBatchValue(entryForm));
        setActiveBatchNo(entryForm.batch.groups[0]?.batch_no ?? 1);
    }, [entryForm.process.sections, entryForm.batch.groups]);

    const selectedBatch = entryForm.batch.groups.find((group) => group.batch_no === activeBatchNo) ?? null;
    const normalizedProcessQuery = processQuery.trim().toLowerCase();
    const checklistProgress = buildChecklistProgress(entryForm);
    const processProgress = buildProcessProgress(entryForm);
    const batchProgress = buildBatchProgress(entryForm);

    const processRows = entryForm.process.sections
        .map((section) => {
            const items = section.items.filter((item) => {
                if (normalizedProcessQuery === '') {
                    return true;
                }

                return (
                    section.name.toLowerCase().includes(normalizedProcessQuery) ||
                    item.name.toLowerCase().includes(normalizedProcessQuery) ||
                    (item.standard_condition ?? '').toLowerCase().includes(normalizedProcessQuery)
                );
            });

            return {
                ...section,
                items,
            };
        })
        .filter((section) => section.items.length > 0);

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(var(--muted))_0%,hsl(var(--background))_48%)] px-4 py-6 lg:px-6 lg:py-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-6">
                <Card className="border-none bg-[linear-gradient(135deg,hsl(var(--background))_0%,hsl(var(--muted))_100%)] shadow-sm ring-1 ring-border/60">
                    <CardHeader className="gap-4">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div className="space-y-2">
                                <Badge variant="outline">Workspace Pengisian</Badge>
                                <CardTitle className="text-2xl">{entryForm.module.title}</CardTitle>
                                <CardDescription>{entryForm.module.subtitle}</CardDescription>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge variant="outline">Tanggal {entryForm.entry.tanggal}</Badge>
                                <Badge variant={entryForm.entry.read_only ? 'secondary' : 'default'}>
                                    {entryForm.entry.read_only ? 'Mode Lihat' : entryForm.entry.action_label}
                                </Badge>
                                <Button variant="outline" render={<a href={catatanPengolahanLimbahAirIndex.url({ query: { user_id: userId } })} />}>
                                    <ArrowLeft className="size-4" />
                                    Kembali ke Listing
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {!entryForm.checklist.template_id || !entryForm.process.template_id ? (
                    <Card className="border-none shadow-sm ring-1 ring-destructive/20">
                        <CardContent className="flex items-start gap-3 p-5 text-sm text-muted-foreground">
                            <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
                            <p>Master form aktif belum lengkap. Halaman pengisian sudah siap, tapi template checklist atau process belum tersedia.</p>
                        </CardContent>
                    </Card>
                ) : null}

                <section className="grid gap-6 xl:grid-cols-2">
                    <Card className="border-none shadow-sm ring-1 ring-border/60">
                        <CardHeader className="border-b border-border/60">
                            <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <ClipboardCheck className="size-4 text-primary" />
                                        <CardTitle className="text-base">Checklist Harian</CardTitle>
                                    </div>
                                    <CardDescription>
                                        {entryForm.checklist.template_name ?? 'Template checklist belum tersedia'}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">{checklistProgress}</Badge>
                                    <Button variant="ghost" size="icon-sm" onClick={() => setChecklistPanelCollapsed((current) => !current)}>
                                        <ChevronDown className={`size-4 transition-transform ${checklistPanelCollapsed ? '-rotate-90' : 'rotate-0'}`} />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        {!checklistPanelCollapsed ? (
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="px-4">Perlengkapan</TableHead>
                                            <TableHead>Kondisi Standar</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="px-4">Catatan</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {entryForm.checklist.items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="px-4 font-medium">{item.name}</TableCell>
                                                <TableCell>{item.standard_condition ?? '-'}</TableCell>
                                                <TableCell className="min-w-[220px]">
                                                    {entryForm.entry.read_only ? (
                                                        <Badge variant={resolveStatusVariant(item.status)}>
                                                            {resolveStatusLabel(item.status)}
                                                        </Badge>
                                                    ) : (
                                                        <Select
                                                            items={[
                                                                { value: 'OK', label: 'Sesuai Kondisi Standar' },
                                                                { value: 'NOT_OK', label: 'Perlu Tindak Lanjut' },
                                                                { value: 'NA', label: 'Tidak Berlaku (N/A)' },
                                                            ]}
                                                            defaultValue={item.status ?? undefined}
                                                        >
                                                            <SelectTrigger className="w-full min-w-[180px]">
                                                                <SelectValue placeholder="Pilih kondisi" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="OK">Sesuai Kondisi Standar</SelectItem>
                                                                <SelectItem value="NOT_OK">Perlu Tindak Lanjut</SelectItem>
                                                                <SelectItem value="NA">Tidak Berlaku (N/A)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-4">
                                                    <Textarea
                                                        defaultValue={item.note ?? ''}
                                                        readOnly={entryForm.entry.read_only}
                                                        className="min-h-14"
                                                        placeholder="Contoh: butuh pengecekan lanjutan"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        ) : null}
                    </Card>

                    <Card className="border-none shadow-sm ring-1 ring-border/60">
                        <CardHeader className="border-b border-border/60">
                            <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Droplets className="size-4 text-primary" />
                                        <CardTitle className="text-base">Catatan Proses</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Tampilkan lengkap unit, uraian, kondisi standar, kondisi, dan keterangan.
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">{processProgress}</Badge>
                                    <Button variant="ghost" size="icon-sm" onClick={() => setProcessPanelCollapsed((current) => !current)}>
                                        <ChevronDown className={`size-4 transition-transform ${processPanelCollapsed ? '-rotate-90' : 'rotate-0'}`} />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>

                        {!processPanelCollapsed ? (
                            <CardContent className="space-y-5 p-5">
                                <Input
                                    value={processQuery}
                                    onChange={(event) => setProcessQuery(event.target.value)}
                                    placeholder="Cari unit, uraian, atau kondisi standar"
                                    className="w-full"
                                />

                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="px-4">Unit Process</TableHead>
                                            <TableHead>Uraian Process</TableHead>
                                            <TableHead>Kondisi Standar</TableHead>
                                            <TableHead>Kondisi</TableHead>
                                            <TableHead className="px-4">Keterangan</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {processRows.length > 0 ? (
                                            processRows.flatMap((section) => {
                                                const headerRow = (
                                                    <TableRow key={`header-${section.id}`} className="bg-muted/30">
                                                        <TableCell className="px-4" colSpan={5}>
                                                            <button
                                                                type="button"
                                                                className="flex w-full items-center justify-between gap-2 text-left"
                                                                onClick={() => {
                                                                    setCollapsedSections((current) => ({
                                                                        ...current,
                                                                        [section.id]: !(current[section.id] ?? false),
                                                                    }));
                                                                }}
                                                            >
                                                                <span className="font-semibold">{section.name}</span>
                                                                <Badge variant="outline">
                                                                    {collapsedSections[section.id] ? 'Tertutup' : `${section.items.length} uraian`}
                                                                </Badge>
                                                            </button>
                                                        </TableCell>
                                                    </TableRow>
                                                );

                                                if (collapsedSections[section.id]) {
                                                    return [headerRow];
                                                }

                                                const detailRows = section.items.map((item) => (
                                                    <TableRow key={`${section.id}-${item.id}`}>
                                                        <TableCell className="px-4 font-medium">{section.name}</TableCell>
                                                        <TableCell>{item.name}</TableCell>
                                                        <TableCell>{item.standard_condition ?? '-'}</TableCell>
                                                        <TableCell className="min-w-[220px]">
                                                            {item.input_type === 'number' ? (
                                                                <Input
                                                                    type="number"
                                                                    defaultValue={item.value_number ?? ''}
                                                                    readOnly={entryForm.entry.read_only}
                                                                />
                                                            ) : (
                                                                <Input
                                                                    defaultValue={item.value_text ?? ''}
                                                                    readOnly={entryForm.entry.read_only}
                                                                />
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="px-4">
                                                            <Textarea
                                                                defaultValue={item.note ?? ''}
                                                                readOnly={entryForm.entry.read_only}
                                                                placeholder="Keterangan tambahan"
                                                                className="min-h-14"
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ));

                                                return [headerRow, ...detailRows];
                                            })
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                                                    Data process tidak ditemukan untuk kata kunci yang dicari.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>

                                <div className="space-y-4 rounded-2xl border border-border/60 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <FlaskConical className="size-4 text-primary" />
                                                <p className="text-sm font-semibold">Batch Mixing</p>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Diisi hanya jika ada proses mixing pada hari ini.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">{batchProgress}</Badge>
                                            <Switch
                                                checked={hasMixingProcess}
                                                onCheckedChange={(checked) => setHasMixingProcess(Boolean(checked))}
                                                disabled={entryForm.entry.read_only}
                                            />
                                        </div>
                                    </div>

                                    {hasMixingProcess ? (
                                        <>
                                            <div className="mb-2 flex flex-wrap gap-2">
                                                {entryForm.batch.groups.map((group) => (
                                                    <Button
                                                        key={group.batch_no}
                                                        variant={activeBatchNo === group.batch_no ? 'default' : 'outline'}
                                                        size="sm"
                                                        onClick={() => setActiveBatchNo(group.batch_no)}
                                                    >
                                                        Batch {group.batch_no}
                                                    </Button>
                                                ))}
                                            </div>

                                            {selectedBatch ? (
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="px-4">Uraian</TableHead>
                                                            <TableHead>Tipe Input</TableHead>
                                                            <TableHead>Nilai</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {selectedBatch.values.map((value) => {
                                                            const item = findBatchItem(entryForm.batch.items, value.item_id);

                                                            return (
                                                                <TableRow key={`${selectedBatch.batch_no}-${value.item_id}`}>
                                                                    <TableCell className="px-4 font-medium">{item?.name ?? `Item ${value.item_id}`}</TableCell>
                                                                    <TableCell className="uppercase">{item?.input_type ?? 'text'}</TableCell>
                                                                    <TableCell className="min-w-[220px]">
                                                                        {item?.input_type === 'number' ? (
                                                                            <Input
                                                                                type="number"
                                                                                defaultValue={value.value_number ?? ''}
                                                                                readOnly={entryForm.entry.read_only}
                                                                            />
                                                                        ) : (
                                                                            <Input
                                                                                defaultValue={value.value_text ?? ''}
                                                                                readOnly={entryForm.entry.read_only}
                                                                            />
                                                                        )}
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                    </TableBody>
                                                </Table>
                                            ) : (
                                                <div className="rounded-xl border border-dashed border-border/60 px-4 py-8 text-center text-sm text-muted-foreground">
                                                    Tidak ada data batch.
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="rounded-xl border border-dashed border-border/60 px-4 py-8 text-center text-sm text-muted-foreground">
                                            Hari ini tidak ada proses mixing. Bagian batch dilewati.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        ) : null}
                    </Card>
                </section>

                <div className="sticky bottom-4 z-20 rounded-2xl border border-border/70 bg-background/95 p-4 shadow-lg backdrop-blur">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-muted-foreground">
                            Aksi utama selalu terlihat agar user tidak perlu scroll panjang.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <Button disabled={entryForm.entry.read_only || !entryForm.checklist.template_id}>
                                <Save className="size-4" />
                                Simpan Draft
                            </Button>
                            <Button variant="secondary" disabled={entryForm.entry.read_only || !entryForm.process.template_id}>
                                Submit
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function findBatchItem(items: BatchField[], itemId: number): BatchField | undefined {
    return items.find((item) => item.id === itemId);
}

function resolveStatusLabel(status: string | null): string {
    if (status === 'OK') {
        return 'Sesuai Kondisi Standar';
    }

    if (status === 'NOT_OK') {
        return 'Perlu Tindak Lanjut';
    }

    if (status === 'NA') {
        return 'Tidak Berlaku (N/A)';
    }

    return status ?? '-';
}

function resolveStatusVariant(status: string | null): 'default' | 'secondary' | 'destructive' | 'outline' {
    if (status === 'OK') {
        return 'secondary';
    }

    if (status === 'NOT_OK') {
        return 'destructive';
    }

    if (status === 'NA') {
        return 'outline';
    }

    return 'outline';
}

function hasAnyBatchValue(entryForm: CatatanPengolahanLimbahAirEntryPayload): boolean {
    for (const group of entryForm.batch.groups) {
        for (const value of group.values) {
            if (value.value_number !== null) {
                return true;
            }

            if (typeof value.value_text === 'string' && value.value_text.trim() !== '') {
                return true;
            }
        }
    }

    return false;
}

function buildChecklistProgress(entryForm: CatatanPengolahanLimbahAirEntryPayload): string {
    const total = entryForm.checklist.items.length;

    if (total === 0) {
        return '0/0';
    }

    const filled = entryForm.checklist.items.filter((item) => item.status !== null).length;

    return `${filled}/${total}`;
}

function buildProcessProgress(entryForm: CatatanPengolahanLimbahAirEntryPayload): string {
    const items = entryForm.process.sections.flatMap((section) => section.items);
    const total = items.length;

    if (total === 0) {
        return '0/0';
    }

    const filled = items.filter((item) => {
        if (item.input_type === 'number') {
            return item.value_number !== null;
        }

        return typeof item.value_text === 'string' && item.value_text.trim() !== '';
    }).length;

    return `${filled}/${total}`;
}

function buildBatchProgress(entryForm: CatatanPengolahanLimbahAirEntryPayload): string {
    const values = entryForm.batch.groups.flatMap((group) => group.values);
    const total = values.length;

    if (total === 0) {
        return '0/0';
    }

    const filled = values.filter((value) => {
        if (value.value_number !== null) {
            return true;
        }

        return typeof value.value_text === 'string' && value.value_text.trim() !== '';
    }).length;

    return `${filled}/${total}`;
}
