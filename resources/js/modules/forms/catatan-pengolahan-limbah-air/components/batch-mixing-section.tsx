import { useState } from 'react';
import type { useForm } from '@inertiajs/react';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { confirmDelete } from '@/lib/sweetalert';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { CatatanPengolahanLimbahAirEntryPayload } from '@/modules/dashboard/types';
import { ActualValueInput } from './actual-value-input';
import type { ProcessFormState } from './entry-form-types';
import { buildAvailableBatchNumbers } from './entry-form-types';

type BatchMixingSectionProps = {
    entryForm: CatatanPengolahanLimbahAirEntryPayload;
    form: ReturnType<typeof useForm<ProcessFormState>>;
    readOnly: boolean;
    selectedBatchNo: string;
    setSelectedBatchNo: (value: string) => void;
};

export function BatchMixingSection({ entryForm, form, readOnly, selectedBatchNo, setSelectedBatchNo }: BatchMixingSectionProps) {
    const availableBatchNumbers = buildAvailableBatchNumbers(entryForm.batch.max_batch_no, form.data.batch);
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

    const toggleSection = (sectionKey: string) => {
        setCollapsedSections((prev) => ({
            ...prev,
            [sectionKey]: !prev[sectionKey],
        }));
    };

    const openBatchSections = (batchNo: number) => {
        const newKeys: Record<string, boolean> = {};
        entryForm.batch.sections.forEach((section) => {
            newKeys[`batch-${batchNo}-section-${section.id}`] = false;
        });
        setCollapsedSections((prev) => ({ ...prev, ...newKeys }));
    };
    
    const closeBatchSections = (batchNo: number) => {
        const newKeys: Record<string, boolean> = {};
        entryForm.batch.sections.forEach((section) => {
            newKeys[`batch-${batchNo}-section-${section.id}`] = true;
        });
        setCollapsedSections((prev) => ({ ...prev, ...newKeys }));
    };

    if (!form.data.has_mixing) {
        return (
            <div className="mt-5 flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/40 bg-slate-50/50 px-4 py-8 text-center transition-colors dark:bg-muted/10">
                <p className="text-sm font-medium text-muted-foreground/80">
                    Tidak ada proses mixing untuk hari ini.
                </p>
            </div>
        );
    }

    return (
        <div className="mt-5 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Header controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/30 pb-3">
                <p className="text-sm font-semibold text-foreground">Daftar Batch Mixing</p>
            </div>

            {!readOnly ? (
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/50 bg-slate-50/50 p-4 shadow-sm dark:bg-muted/20">
                    <div className="flex flex-1 items-center gap-3 sm:flex-none">
                        <Select
                            value={selectedBatchNo}
                            onValueChange={(value) => setSelectedBatchNo(value ?? '1')}
                            disabled={availableBatchNumbers.length === 0}
                        >
                            <SelectTrigger className="w-full bg-background shadow-sm sm:w-[200px]">
                                <SelectValue placeholder="Pilih nomor batch..." />
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
                            variant="default"
                            className="shadow-sm transition-all"
                            onClick={() => {
                                const batchNo = Number(selectedBatchNo);

                                if (!Number.isInteger(batchNo) || batchNo < 1 || batchNo > entryForm.batch.max_batch_no) {
                                    return;
                                }

                                if (form.data.batch.some((batch) => batch.batch_no === batchNo)) {
                                    return;
                                }

                                form.setData('batch', [
                                    ...form.data.batch,
                                    {
                                        batch_no: batchNo,
                                        values: entryForm.batch.sections.flatMap(section => section.items).map((item) => ({
                                            item_id: item.id,
                                            value_text: '',
                                            value_number: '',
                                        })),
                                    },
                                ]);
                            }}
                            disabled={availableBatchNumbers.length === 0}
                        >
                            <Plus className="mr-1.5 size-4" />
                            Tambah Batch
                        </Button>
                    </div>
                </div>
            ) : null}

            {form.data.batch.length === 0 ? (
                <div className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 bg-card px-4 py-10 text-center shadow-sm">
                    <p className="text-sm font-medium text-muted-foreground">Belum ada batch yang ditambahkan.</p>
                    {!readOnly && <p className="mt-1 text-xs text-muted-foreground/70">Pilih nomor batch di atas dan klik "Tambah Batch".</p>}
                </div>
            ) : (
                <div className="space-y-5">
                    {form.data.batch
                        .slice()
                        .sort((a, b) => a.batch_no - b.batch_no)
                        .map((batch) => {
                            const batchFormIndex = form.data.batch.findIndex((currentBatch) => currentBatch.batch_no === batch.batch_no);
                            const isBatchCollapsed = collapsedSections[`batch-${batch.batch_no}`] || false;

                            return (
                                <div key={batch.batch_no} className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm transition-all duration-200 hover:shadow-md">
                                    {/* Header Batch */}
                                    <div 
                                        className="flex cursor-pointer select-none items-center justify-between border-b border-border/50 bg-primary px-5 py-3 dark:bg-muted/20 hover:bg-primary/90 transition-colors"
                                        onClick={() => toggleSection(`batch-${batch.batch_no}`)}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex size-6 items-center justify-center rounded-md bg-primary-foreground/20 text-primary-foreground transition-transform">
                                                {isBatchCollapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
                                            </div>
                                            <div className="flex size-7 items-center justify-center rounded-md bg-primary/20 font-mono text-lg font-bold text-primary-foreground">
                                                #{batch.batch_no}
                                            </div>
                                            <p className="font-semibold text-sm text-primary-foreground">Detail Batch {batch.batch_no}</p>
                                        </div>
                                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    let isAllClosed = true;
                                                    entryForm.batch.sections.forEach((section) => {
                                                        if (!collapsedSections[`batch-${batch.batch_no}-section-${section.id}`]) {
                                                            isAllClosed = false;
                                                        }
                                                    });
                                                    
                                                    if (isAllClosed) {
                                                        openBatchSections(batch.batch_no);
                                                    } else {
                                                        closeBatchSections(batch.batch_no);
                                                    }
                                                }}
                                                className="h-8 px-3 text-xs bg-background shadow-sm hover:bg-muted transition-all active:scale-95 border-none"
                                            >
                                                {(() => {
                                                    let isAllClosed = true;
                                                    entryForm.batch.sections.forEach((section) => {
                                                        if (!collapsedSections[`batch-${batch.batch_no}-section-${section.id}`]) {
                                                            isAllClosed = false;
                                                        }
                                                    });
                                                    return isAllClosed ? 'Buka Semua' : 'Tutup Semua';
                                                })()}
                                            </Button>
                                            {!readOnly ? (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 px-2 bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
                                                    aria-label={`Hapus batch ${batch.batch_no}`}
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        const confirmed = await confirmDelete('Hapus Batch?', `Anda yakin ingin menghapus Batch ${batch.batch_no}?`);
                                                        if (confirmed) {
                                                            form.setData(
                                                                'batch',
                                                                form.data.batch.filter((currentBatch) => currentBatch.batch_no !== batch.batch_no),
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="size-4" />
                                                    <span className="sr-only sm:not-sr-only sm:ml-2 sm:text-xs">Hapus</span>
                                                </Button>
                                            ) : null}
                                        </div>
                                    </div>
                                    
                                    {/* Body Batch (Sections) */}
                                    {!isBatchCollapsed && (
                                        <div className="p-2 sm:p-4 space-y-4 animate-in fade-in slide-in-from-top-1">
                                            {entryForm.batch.sections.map((section) => {
                                                const sectionKey = `batch-${batch.batch_no}-section-${section.id}`;
                                                const isCollapsed = collapsedSections[sectionKey];

                                                return (
                                                    <div key={section.id} className="rounded-lg border border-border/40 bg-slate-50/30 dark:bg-muted/5 transition-all duration-200">
                                                        <div
                                                            className="flex cursor-pointer select-none items-center justify-between px-4 py-3 bg-primary rounded-lg hover:bg-primary/85 transition-all duration-300"
                                                            onClick={() => toggleSection(sectionKey)}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex size-6 items-center justify-center rounded-md bg-muted text-muted-foreground transition-transform">
                                                                    {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
                                                                </div>
                                                                <p className="font-medium text-primary-foreground">{section.name}</p>
                                                            </div>
                                                        </div>

                                                        {!isCollapsed && (
                                                            <div className="border-t border-border/40 p-0 animate-in fade-in slide-in-from-top-1">
                                                                <div className="overflow-x-auto">
                                                                    <Table>
                                                                        <TableHeader className="bg-transparent">
                                                                            <TableRow className="hover:bg-transparent">
                                                                                <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[40%]">Uraian</TableHead>
                                                                                <TableHead className="py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[60%]">Nilai Aktual</TableHead>
                                                                            </TableRow>
                                                                        </TableHeader>
                                                                        <TableBody>
                                                                            {section.items.map((batchItem) => {
                                                                                // Find the value in the batch form state
                                                                                const valueIndex = batch.values.findIndex(v => v.item_id === batchItem.id);
                                                                                const value = valueIndex !== -1 ? batch.values[valueIndex] : null;

                                                                                if (!value) return null;

                                                                                return (
                                                                                    <TableRow key={`${batch.batch_no}-${value.item_id}`} className="transition-colors hover:bg-primary/15 odd:bg-primary/10">
                                                                                        <TableCell className="px-4 py-3 font-medium text-foreground/80">
                                                                                            {batchItem.name}
                                                                                            <span className="ml-2 text-[10px] uppercase text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">
                                                                                                {batchItem.input_type}
                                                                                            </span>
                                                                                        </TableCell>
                                                                                        <TableCell className="min-w-[240px] py-2 pr-4">
                                                                                            <ActualValueInput
                                                                                                inputType={batchItem.input_type}
                                                                                                valueText={value.value_text}
                                                                                                valueNumber={value.value_number}
                                                                                                readOnly={readOnly}
                                                                                                required={!readOnly}
                                                                                                onChange={(nextValue) => {
                                                                                                    form.setData('batch', [
                                                                                                        ...form.data.batch.map((existingBatch, existingBatchIndex) => {
                                                                                                            if (existingBatchIndex !== batchFormIndex) {
                                                                                                                return existingBatch;
                                                                                                            }

                                                                                                            return {
                                                                                                                ...existingBatch,
                                                                                                                values: existingBatch.values.map((existingValue, existingValueIndex) =>
                                                                                                                    existingValueIndex === valueIndex
                                                                                                                        ? {
                                                                                                                              ...existingValue,
                                                                                                                              ...nextValue,
                                                                                                                          }
                                                                                                                        : existingValue,
                                                                                                                ),
                                                                                                            };
                                                                                                        }),
                                                                                                    ]);
                                                                                                }}
                                                                                            />
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                );
                                                                            })}
                                                                        </TableBody>
                                                                    </Table>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                </div>
            )}
        </div>
    );
}
