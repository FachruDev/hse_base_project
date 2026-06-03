import type { useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { CatatanPengolahanLimbahAirEntryPayload } from '@/modules/dashboard/types';
import type { ProcessFormState } from './entry-form-types';
import { buildAvailableBatchNumbers, findBatchItem } from './entry-form-types';

type BatchMixingSectionProps = {
    entryForm: CatatanPengolahanLimbahAirEntryPayload;
    form: ReturnType<typeof useForm<ProcessFormState>>;
    readOnly: boolean;
    selectedBatchNo: string;
    setSelectedBatchNo: (value: string) => void;
};

export function BatchMixingSection({ entryForm, form, readOnly, selectedBatchNo, setSelectedBatchNo }: BatchMixingSectionProps) {
    const availableBatchNumbers = buildAvailableBatchNumbers(entryForm.batch.max_batch_no, form.data.batch);

    if (!form.data.has_mixing) {
        return (
            <div className="mt-4 rounded-xl border border-dashed border-border/60 px-4 py-6 text-center text-sm text-muted-foreground">
                Tidak ada proses mixing hari ini.
            </div>
        );
    }

    return (
        <div className="mt-4 space-y-4">
            {!readOnly ? (
                <div className="flex flex-wrap items-end gap-2">
                    <Select
                        value={selectedBatchNo}
                        onValueChange={(value) => setSelectedBatchNo(value ?? '1')}
                        disabled={availableBatchNumbers.length === 0}
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

                            if (form.data.batch.some((batch) => batch.batch_no === batchNo)) {
                                return;
                            }

                            form.setData('batch', [
                                ...form.data.batch,
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
                        disabled={availableBatchNumbers.length === 0}
                    >
                        <Plus className="size-4" />
                        Tambah Batch
                    </Button>
                </div>
            ) : null}

            {form.data.batch.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/60 px-4 py-8 text-center text-sm text-muted-foreground">
                    Belum ada batch dipilih.
                </div>
            ) : (
                <div className="space-y-4">
                    {form.data.batch
                        .slice()
                        .sort((a, b) => a.batch_no - b.batch_no)
                        .map((batch) => {
                            const batchFormIndex = form.data.batch.findIndex((currentBatch) => currentBatch.batch_no === batch.batch_no);

                            return (
                                <div key={batch.batch_no} className="rounded-xl border border-border/60">
                                    <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                                        <p className="font-semibold">Batch {batch.batch_no}</p>
                                        {!readOnly ? (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-sm"
                                                aria-label={`Hapus batch ${batch.batch_no}`}
                                                onClick={() => {
                                                    form.setData(
                                                        'batch',
                                                        form.data.batch.filter((currentBatch) => currentBatch.batch_no !== batch.batch_no),
                                                    );
                                                }}
                                            >
                                                <Trash2 className="size-4 text-destructive" />
                                            </Button>
                                        ) : null}
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
                                                            <TableCell className="px-4 font-medium">{batchItem?.name ?? `Item ${value.item_id}`}</TableCell>
                                                            <TableCell className="uppercase">{batchItem?.input_type ?? 'text'}</TableCell>
                                                            <TableCell className="min-w-[220px]">
                                                                {batchItem?.input_type === 'number' ? (
                                                                    <Input
                                                                        type="number"
                                                                        value={value.value_number}
                                                                        readOnly={readOnly}
                                                                        onChange={(event) => {
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
                                                                        readOnly={readOnly}
                                                                        onChange={(event) => {
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
                            );
                        })}
                </div>
            )}
        </div>
    );
}
