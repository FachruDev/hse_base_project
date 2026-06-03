import { useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, ClipboardCheck, Droplets, FlaskConical, Plus, Save, Send, Trash2 } from 'lucide-react';
import * as React from 'react';

import {
    catatanPengolahanLimbahAirIndex,
    catatanPengolahanLimbahAirSaveChecklist,
    catatanPengolahanLimbahAirSaveProcess,
} from '@/actions/App/Http/Controllers/Web/DashboardController';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import type { BatchField, CatatanPengolahanLimbahAirEntryPayload } from '@/modules/dashboard/types';

type CatatanPengolahanLimbahAirEntryProps = {
    flash: {
        success?: string | null;
        error?: string | null;
    };
    entryForm: CatatanPengolahanLimbahAirEntryPayload;
    userId: string;
};

type EntryView = 'CHECKLIST' | 'PROCESS';

type ChecklistValuePayload = {
    item_id: number;
    status: 'OK' | 'NOT_OK' | '';
    note: string;
};

type ProcessValuePayload = {
    item_id: number;
    value_text: string;
    value_number: string;
    note: string;
};

type BatchValuePayload = {
    item_id: number;
    value_text: string;
    value_number: string;
};

type BatchGroupPayload = {
    batch_no: number;
    values: BatchValuePayload[];
};

type ChecklistFormState = {
    tanggal: string;
    checklist: {
        template_id: number | null;
        values: ChecklistValuePayload[];
    };
};

type ProcessFormState = {
    tanggal: string;
    action: 'DRAFT' | 'SUBMIT';
    has_mixing: boolean;
    process: {
        template_id: number | null;
        values: ProcessValuePayload[];
    };
    batch: BatchGroupPayload[];
};

export function CatatanPengolahanLimbahAirEntry({ flash, entryForm, userId }: CatatanPengolahanLimbahAirEntryProps) {
    const [activeView, setActiveView] = React.useState<EntryView>('CHECKLIST');
    const [processQuery, setProcessQuery] = React.useState('');
    const [selectedBatchNo, setSelectedBatchNo] = React.useState<string>('1');

    const checklistForm = useForm<ChecklistFormState>({
        tanggal: entryForm.entry.tanggal,
        checklist: {
            template_id: entryForm.checklist.template_id,
            values: entryForm.checklist.items.map((item) => ({
                item_id: item.id,
                status: normalizeChecklistStatus(item.status),
                note: item.note ?? '',
            })),
        },
    });

    const processForm = useForm<ProcessFormState>({
        tanggal: entryForm.entry.tanggal,
        action: 'DRAFT',
        has_mixing: entryForm.batch.groups.length > 0,
        process: {
            template_id: entryForm.process.template_id,
            values: entryForm.process.sections.flatMap((section) =>
                section.items.map((item) => ({
                    item_id: item.id,
                    value_text: item.value_text ?? '',
                    value_number: item.value_number !== null ? String(item.value_number) : '',
                    note: item.note ?? '',
                })),
            ),
        },
        batch: entryForm.batch.groups.map((group) => ({
            batch_no: group.batch_no,
            values: entryForm.batch.items.map((batchItem) => {
                const existingValue = group.values.find((value) => value.item_id === batchItem.id);

                return {
                    item_id: batchItem.id,
                    value_text: existingValue?.value_text ?? '',
                    value_number: existingValue?.value_number !== null ? String(existingValue?.value_number) : '',
                };
            }),
        })),
    });

    const availableBatchNumbers = buildAvailableBatchNumbers(entryForm.batch.max_batch_no, processForm.data.batch);

    React.useEffect(() => {
        if (availableBatchNumbers.length === 0) {
            return;
        }

        const nextValue = String(availableBatchNumbers[0]);
        if (!availableBatchNumbers.map(String).includes(selectedBatchNo)) {
            setSelectedBatchNo(nextValue);
        }
    }, [availableBatchNumbers, selectedBatchNo]);

    const filteredSections = entryForm.process.sections
        .map((section) => {
            const keyword = processQuery.trim().toLowerCase();

            if (keyword === '') {
                return section;
            }

            const filteredItems = section.items.filter((item) => {
                return (
                    section.name.toLowerCase().includes(keyword) ||
                    item.name.toLowerCase().includes(keyword) ||
                    (item.standard_condition ?? '').toLowerCase().includes(keyword)
                );
            });

            return {
                ...section,
                items: filteredItems,
            };
        })
        .filter((section) => section.items.length > 0);

    const checklistProgress = `${checklistForm.data.checklist.values.filter((value) => value.status !== '').length}/${checklistForm.data.checklist.values.length}`;
    const processTotalItems = processForm.data.process.values.length;
    const processFilledItems = processForm.data.process.values.filter((value) =>
        value.value_number !== '' || value.value_text.trim() !== '',
    ).length;

    const saveChecklist = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        checklistForm.post(catatanPengolahanLimbahAirSaveChecklist.url({ query: { user_id: userId } }), {
            preserveScroll: true,
        });
    };

    const saveProcess = (action: 'DRAFT' | 'SUBMIT') => {
        processForm.transform((data) => ({
            ...data,
            action,
        }));
        processForm.post(catatanPengolahanLimbahAirSaveProcess.url({ query: { user_id: userId } }), {
            preserveScroll: true,
            onFinish: () => {
                processForm.transform((data) => data);
            },
        });
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(var(--muted))_0%,hsl(var(--background))_50%)] px-4 py-6 lg:px-6 lg:py-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-6">
                <Card className="border-none bg-[linear-gradient(135deg,hsl(var(--background))_0%,hsl(var(--muted))_100%)] shadow-sm ring-1 ring-border/60">
                    <CardHeader className="gap-4">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div className="space-y-2">
                                <Badge variant="outline">Workspace Harian IPAL</Badge>
                                <CardTitle className="text-2xl">{entryForm.module.title}</CardTitle>
                                <CardDescription>{entryForm.module.subtitle}</CardDescription>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge variant="outline">Tanggal {entryForm.entry.tanggal}</Badge>
                                <Badge variant={entryForm.entry.read_only ? 'secondary' : 'default'}>
                                    {entryForm.entry.read_only ? 'Mode Lihat' : 'Mode Input'}
                                </Badge>
                                <Button variant="outline" render={<a href={catatanPengolahanLimbahAirIndex.url({ query: { user_id: userId } })} />}>
                                    <ArrowLeft className="size-4" />
                                    Kembali ke Listing
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {flash.success ? (
                    <Alert>
                        <AlertTitle>Berhasil</AlertTitle>
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                ) : null}

                {flash.error ? (
                    <Alert variant="destructive">
                        <AlertTitle>Gagal</AlertTitle>
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                ) : null}

                <Card className="border-none shadow-sm ring-1 ring-border/60">
                    <CardHeader>
                        <CardTitle className="text-base">Pilih Form yang Ingin Diisi</CardTitle>
                        <CardDescription>Checklist dan catatan process dipisah agar operator fokus, tapi tetap dalam satu workspace.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-2">
                            <button
                                type="button"
                                onClick={() => setActiveView('CHECKLIST')}
                                className={`rounded-xl border p-4 text-left transition ${
                                    activeView === 'CHECKLIST' ? 'border-primary bg-primary/5' : 'border-border/70 hover:border-border'
                                }`}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <ClipboardCheck className="size-4 text-primary" />
                                        <p className="font-semibold">Form Checklist Harian</p>
                                    </div>
                                    <Badge variant="outline">{checklistProgress}</Badge>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">Fokus status perlengkapan harian + catatan singkat.</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveView('PROCESS')}
                                className={`rounded-xl border p-4 text-left transition ${
                                    activeView === 'PROCESS' ? 'border-primary bg-primary/5' : 'border-border/70 hover:border-border'
                                }`}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <Droplets className="size-4 text-primary" />
                                        <p className="font-semibold">Form Catatan Process</p>
                                    </div>
                                    <Badge variant="outline">
                                        {processFilledItems}/{processTotalItems}
                                    </Badge>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Menampilkan unit, uraian, kondisi standar, kondisi aktual, plus batch mixing bila ada.
                                </p>
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {activeView === 'CHECKLIST' ? (
                    <Card className="border-none shadow-sm ring-1 ring-border/60">
                        <CardHeader className="border-b border-border/60">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <CardTitle className="text-base">Checklist Harian</CardTitle>
                                    <CardDescription>{entryForm.checklist.template_name ?? 'Template checklist belum tersedia.'}</CardDescription>
                                </div>
                                <Badge variant="outline">Tanggal Pengisian: {entryForm.entry.tanggal}</Badge>
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setChecklistAllStatus(checklistForm, 'OK')}
                                        disabled={entryForm.entry.read_only || checklistForm.data.checklist.values.length === 0}
                                    >
                                        <CheckCheck className="size-4" />
                                        Checklist Semua Berfungsi
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => clearChecklistAll(checklistForm)}
                                        disabled={entryForm.entry.read_only || checklistForm.data.checklist.values.length === 0}
                                    >
                                        Unchecklist Semua
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <form onSubmit={saveChecklist}>
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
                                        {entryForm.checklist.items.map((item, index) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="px-4 font-medium">{item.name}</TableCell>
                                                <TableCell>{item.standard_condition ?? '-'}</TableCell>
                                                <TableCell className="min-w-[220px]">
                                                    <Select
                                                        items={[
                                                            { value: 'OK', label: 'Berfungsi' },
                                                            { value: 'NOT_OK', label: 'Tidak Berfungsi' },
                                                        ]}
                                                        value={checklistForm.data.checklist.values[index]?.status ?? ''}
                                                        onValueChange={(value) => {
                                                            const nextStatus = (value ?? '') as 'OK' | 'NOT_OK' | '';
                                                            checklistForm.setData('checklist', {
                                                                ...checklistForm.data.checklist,
                                                                values: checklistForm.data.checklist.values.map((valueItem, valueIndex) =>
                                                                    valueIndex === index ? { ...valueItem, status: nextStatus } : valueItem,
                                                                ),
                                                            });
                                                        }}
                                                        disabled={entryForm.entry.read_only}
                                                    >
                                                        <SelectTrigger className="w-full min-w-[200px]">
                                                            <SelectValue placeholder="Pilih kondisi" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="OK">Berfungsi</SelectItem>
                                                            <SelectItem value="NOT_OK">Tidak Berfungsi</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell className="px-4">
                                                    <Textarea
                                                        value={checklistForm.data.checklist.values[index]?.note ?? ''}
                                                        readOnly={entryForm.entry.read_only}
                                                        onChange={(event) => {
                                                            checklistForm.setData('checklist', {
                                                                ...checklistForm.data.checklist,
                                                                values: checklistForm.data.checklist.values.map((valueItem, valueIndex) =>
                                                                    valueIndex === index ? { ...valueItem, note: event.target.value } : valueItem,
                                                                ),
                                                            });
                                                        }}
                                                        className="min-h-14"
                                                        placeholder="Contoh: perlu pembersihan ulang"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                <div className="flex justify-end p-4">
                                    <Button
                                        type="submit"
                                        disabled={
                                            entryForm.entry.read_only ||
                                            checklistForm.processing ||
                                            checklistForm.data.checklist.template_id === null ||
                                            checklistForm.data.checklist.values.length === 0 ||
                                            checklistForm.data.checklist.values.some((value) => value.status === '')
                                        }
                                    >
                                        <Save className="size-4" />
                                        Simpan Checklist
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                ) : null}

                {activeView === 'PROCESS' ? (
                    <Card className="border-none shadow-sm ring-1 ring-border/60">
                        <CardHeader className="border-b border-border/60">
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <CardTitle className="text-base">Catatan Process Pengolahan</CardTitle>
                                        <CardDescription>
                                            Isi kondisi aktual dan keterangan untuk setiap uraian process. Tidak perlu pindah tab unit.
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline">
                                        {processFilledItems}/{processTotalItems} terisi
                                    </Badge>
                                </div>
                                <Input
                                    value={processQuery}
                                    onChange={(event) => setProcessQuery(event.target.value)}
                                    placeholder="Cari unit, uraian, atau kondisi standar"
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 p-5">
                            <form
                                className="space-y-6"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    saveProcess('DRAFT');
                                }}
                            >
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
                                        {filteredSections.flatMap((section) => {
                                            const sectionHeader = (
                                                <TableRow key={`section-${section.id}`} className="bg-muted/20">
                                                    <TableCell className="px-4 font-semibold" colSpan={5}>
                                                        {section.name}
                                                    </TableCell>
                                                </TableRow>
                                            );

                                            const rows = section.items.map((item) => {
                                                const valueIndex = processForm.data.process.values.findIndex((value) => value.item_id === item.id);
                                                const currentValue = processForm.data.process.values[valueIndex];

                                                if (!currentValue) {
                                                    return null;
                                                }

                                                return (
                                                    <TableRow key={`${section.id}-${item.id}`}>
                                                        <TableCell className="px-4 font-medium">{section.name}</TableCell>
                                                        <TableCell>{item.name}</TableCell>
                                                        <TableCell>{item.standard_condition ?? '-'}</TableCell>
                                                        <TableCell className="min-w-[220px]">
                                                            {item.input_type === 'number' ? (
                                                                <Input
                                                                    type="number"
                                                                    value={currentValue.value_number}
                                                                    readOnly={entryForm.entry.read_only}
                                                                    onChange={(event) => {
                                                                        processForm.setData('process', {
                                                                            ...processForm.data.process,
                                                                            values: processForm.data.process.values.map((value, index) =>
                                                                                index === valueIndex ? { ...value, value_number: event.target.value } : value,
                                                                            ),
                                                                        });
                                                                    }}
                                                                />
                                                            ) : (
                                                                <Input
                                                                    value={currentValue.value_text}
                                                                    readOnly={entryForm.entry.read_only}
                                                                    onChange={(event) => {
                                                                        processForm.setData('process', {
                                                                            ...processForm.data.process,
                                                                            values: processForm.data.process.values.map((value, index) =>
                                                                                index === valueIndex ? { ...value, value_text: event.target.value } : value,
                                                                            ),
                                                                        });
                                                                    }}
                                                                />
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="px-4">
                                                            <Textarea
                                                                value={currentValue.note}
                                                                readOnly={entryForm.entry.read_only}
                                                                className="min-h-14"
                                                                onChange={(event) => {
                                                                    processForm.setData('process', {
                                                                        ...processForm.data.process,
                                                                        values: processForm.data.process.values.map((value, index) =>
                                                                            index === valueIndex ? { ...value, note: event.target.value } : value,
                                                                        ),
                                                                    });
                                                                }}
                                                                placeholder="Keterangan tambahan"
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            });

                                            return [sectionHeader, ...rows.filter((row) => row !== null)];
                                        })}
                                    </TableBody>
                                </Table>

                                <div className="rounded-xl border border-border/60 p-4">
                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <FlaskConical className="size-4 text-primary" />
                                                <p className="text-sm font-semibold">Batch Mixing</p>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Diisi saat ada proses mixing. Batch yang sudah diisi tidak bisa dipilih lagi.
                                            </p>
                                        </div>
                                        <Select
                                            value={processForm.data.has_mixing ? 'YES' : 'NO'}
                                            onValueChange={(value) => {
                                                const hasMixing = value === 'YES';
                                                processForm.setData('has_mixing', hasMixing);

                                                if (!hasMixing) {
                                                    processForm.setData('batch', []);
                                                }
                                            }}
                                            disabled={entryForm.entry.read_only}
                                        >
                                            <SelectTrigger className="w-full lg:w-[220px]">
                                                <SelectValue placeholder="Pilih proses mixing" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="NO">Tidak ada mixing hari ini</SelectItem>
                                                <SelectItem value="YES">Ada proses mixing</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {processForm.data.has_mixing ? (
                                        <div className="mt-4 space-y-4">
                                            <div className="flex flex-wrap items-end gap-2">
                                                <Select
                                                    value={selectedBatchNo}
                                                    onValueChange={(value) => setSelectedBatchNo(value ?? '1')}
                                                    disabled={entryForm.entry.read_only || availableBatchNumbers.length === 0}
                                                >
                                                    <SelectTrigger className="w-[180px]">
                                                        <SelectValue placeholder="Pilih batch" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableBatchNumbers.map((batchNo) => (
                                                            <SelectItem key={batchNo} value={String(batchNo)}>
                                                                Batch {batchNo}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        const batchNo = Number(selectedBatchNo);

                                                        if (!Number.isInteger(batchNo) || batchNo < 1 || batchNo > entryForm.batch.max_batch_no) {
                                                            return;
                                                        }

                                                        if (processForm.data.batch.some((batch) => batch.batch_no === batchNo)) {
                                                            return;
                                                        }

                                                        processForm.setData('batch', [
                                                            ...processForm.data.batch,
                                                            {
                                                                batch_no: batchNo,
                                                                values: entryForm.batch.items.map((item) => ({
                                                                    item_id: item.id,
                                                                    value_text: '',
                                                                    value_number: '',
                                                                })),
                                                            },
                                                        ]);
                                                    }}
                                                    disabled={entryForm.entry.read_only || availableBatchNumbers.length === 0}
                                                >
                                                    <Plus className="size-4" />
                                                    Tambah Batch
                                                </Button>
                                            </div>

                                            {processForm.data.batch.length === 0 ? (
                                                <div className="rounded-xl border border-dashed border-border/60 px-4 py-8 text-center text-sm text-muted-foreground">
                                                    Belum ada batch dipilih. Tambahkan batch 1-7 sesuai proses mixing.
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {processForm.data.batch
                                                        .slice()
                                                        .sort((a, b) => a.batch_no - b.batch_no)
                                                        .map((batch, batchIndex) => (
                                                            <div key={batch.batch_no} className="rounded-xl border border-border/60">
                                                                <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                                                                    <p className="font-semibold">Batch {batch.batch_no}</p>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon-sm"
                                                                        onClick={() => {
                                                                            processForm.setData(
                                                                                'batch',
                                                                                processForm.data.batch.filter((currentBatch) => currentBatch.batch_no !== batch.batch_no),
                                                                            );
                                                                        }}
                                                                        disabled={entryForm.entry.read_only}
                                                                    >
                                                                        <Trash2 className="size-4 text-destructive" />
                                                                    </Button>
                                                                </div>
                                                                <div className="p-4">
                                                                    <Table>
                                                                        <TableHeader>
                                                                            <TableRow>
                                                                                <TableHead className="px-4">Uraian</TableHead>
                                                                                <TableHead>Tipe</TableHead>
                                                                                <TableHead>Nilai</TableHead>
                                                                            </TableRow>
                                                                        </TableHeader>
                                                                        <TableBody>
                                                                            {batch.values.map((value, valueIndex) => {
                                                                                const batchItem = findBatchItem(entryForm.batch.items, value.item_id);

                                                                                return (
                                                                                    <TableRow key={`${batch.batch_no}-${value.item_id}`}>
                                                                                        <TableCell className="px-4 font-medium">
                                                                                            {batchItem?.name ?? `Item ${value.item_id}`}
                                                                                        </TableCell>
                                                                                        <TableCell className="uppercase">{batchItem?.input_type ?? 'text'}</TableCell>
                                                                                        <TableCell className="min-w-[220px]">
                                                                                            {batchItem?.input_type === 'number' ? (
                                                                                                <Input
                                                                                                    type="number"
                                                                                                    value={value.value_number}
                                                                                                    readOnly={entryForm.entry.read_only}
                                                                                                    onChange={(event) => {
                                                                                                        processForm.setData('batch', [
                                                                                                            ...processForm.data.batch.map((existingBatch, existingBatchIndex) => {
                                                                                                                if (existingBatchIndex !== batchIndex) {
                                                                                                                    return existingBatch;
                                                                                                                }

                                                                                                                return {
                                                                                                                    ...existingBatch,
                                                                                                                    values: existingBatch.values.map((existingValue, existingValueIndex) =>
                                                                                                                        existingValueIndex === valueIndex
                                                                                                                            ? {
                                                                                                                                  ...existingValue,
                                                                                                                                  value_number: event.target.value,
                                                                                                                              }
                                                                                                                            : existingValue,
                                                                                                                    ),
                                                                                                                };
                                                                                                            }),
                                                                                                        ]);
                                                                                                    }}
                                                                                                />
                                                                                            ) : (
                                                                                                <Input
                                                                                                    value={value.value_text}
                                                                                                    readOnly={entryForm.entry.read_only}
                                                                                                    onChange={(event) => {
                                                                                                        processForm.setData('batch', [
                                                                                                            ...processForm.data.batch.map((existingBatch, existingBatchIndex) => {
                                                                                                                if (existingBatchIndex !== batchIndex) {
                                                                                                                    return existingBatch;
                                                                                                                }

                                                                                                                return {
                                                                                                                    ...existingBatch,
                                                                                                                    values: existingBatch.values.map((existingValue, existingValueIndex) =>
                                                                                                                        existingValueIndex === valueIndex
                                                                                                                            ? {
                                                                                                                                  ...existingValue,
                                                                                                                                  value_text: event.target.value,
                                                                                                                              }
                                                                                                                            : existingValue,
                                                                                                                    ),
                                                                                                                };
                                                                                                            }),
                                                                                                        ]);
                                                                                                    }}
                                                                                                />
                                                                                            )}
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                );
                                                                            })}
                                                                        </TableBody>
                                                                    </Table>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="mt-4 rounded-xl border border-dashed border-border/60 px-4 py-6 text-center text-sm text-muted-foreground">
                                            Tidak ada proses mixing hari ini.
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap justify-end gap-2">
                                    <Button
                                        type="submit"
                                        disabled={entryForm.entry.read_only || processForm.processing || processForm.data.process.template_id === null}
                                    >
                                        <Save className="size-4" />
                                        Simpan Draft Process
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        disabled={entryForm.entry.read_only || processForm.processing || processForm.data.process.template_id === null}
                                        onClick={() => {
                                            saveProcess('SUBMIT');
                                        }}
                                    >
                                        <Send className="size-4" />
                                        Submit Harian
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                ) : null}
            </div>
        </div>
    );
}

function findBatchItem(items: BatchField[], itemId: number): BatchField | undefined {
    return items.find((item) => item.id === itemId);
}

function normalizeChecklistStatus(status: string | null): 'OK' | 'NOT_OK' | '' {
    if (status === 'OK' || status === 'NOT_OK') {
        return status;
    }

    return '';
}

function setChecklistAllStatus(
    form: ReturnType<typeof useForm<ChecklistFormState>>,
    status: 'OK' | 'NOT_OK',
): void {
    form.setData('checklist', {
        ...form.data.checklist,
        values: form.data.checklist.values.map((value) => ({
            ...value,
            status,
        })),
    });
}

function clearChecklistAll(form: ReturnType<typeof useForm<ChecklistFormState>>): void {
    form.setData('checklist', {
        ...form.data.checklist,
        values: form.data.checklist.values.map((value) => ({
            ...value,
            status: '',
            note: '',
        })),
    });
}

function buildAvailableBatchNumbers(maxBatchNo: number, batchGroups: BatchGroupPayload[]): number[] {
    const occupied = new Set(batchGroups.map((batch) => batch.batch_no));
    const numbers: number[] = [];

    for (let batchNo = 1; batchNo <= maxBatchNo; batchNo += 1) {
        if (!occupied.has(batchNo)) {
            numbers.push(batchNo);
        }
    }

    return numbers;
}
