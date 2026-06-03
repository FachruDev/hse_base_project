import { useForm } from '@inertiajs/react';
import { FlaskConical, Save, Send } from 'lucide-react';
import * as React from 'react';

import { catatanPengolahanLimbahAirSaveProcess } from '@/actions/App/Http/Controllers/Web/DashboardController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import type { CatatanPengolahanLimbahAirEntryPayload } from '@/modules/dashboard/types';
import { BatchMixingSection } from './batch-mixing-section';
import type { ProcessFormState } from './entry-form-types';
import { buildAvailableBatchNumbers } from './entry-form-types';

type CatatanProsesFormProps = {
    entryForm: CatatanPengolahanLimbahAirEntryPayload;
    userId: string;
};

export function CatatanProsesForm({ entryForm, userId }: CatatanProsesFormProps) {
    const [processQuery, setProcessQuery] = React.useState('');
    const [selectedBatchNo, setSelectedBatchNo] = React.useState<string>('1');
    const form = useForm<ProcessFormState>({
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
    const readOnly = entryForm.process.read_only || entryForm.entry.read_only;
    const availableBatchNumbers = React.useMemo(
        () => buildAvailableBatchNumbers(entryForm.batch.max_batch_no, form.data.batch),
        [entryForm.batch.max_batch_no, form.data.batch],
    );
    const selectedAvailableBatchNo = availableBatchNumbers.map(String).includes(selectedBatchNo)
        ? selectedBatchNo
        : String(availableBatchNumbers[0] ?? '1');

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

    const saveProcess = (action: 'DRAFT' | 'SUBMIT') => {
        form.transform((data) => ({
            ...data,
            action,
        }));

        form.post(catatanPengolahanLimbahAirSaveProcess.url({ query: { user_id: userId } }), {
            preserveScroll: true,
            onFinish: () => {
                form.transform((data) => data);
            },
        });
    };

    return (
        <Card className="border-none shadow-sm ring-1 ring-border/60">
            <CardHeader className="border-b border-border/60">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-2">
                        <CardTitle className="text-base">Catatan Process</CardTitle>
                        <CardDescription>{entryForm.process.template_name ?? 'Template proses belum tersedia.'}</CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">Tanggal Pengisian: {entryForm.entry.tanggal}</Badge>
                        <Input
                            value={processQuery}
                            onChange={(event) => setProcessQuery(event.target.value)}
                            className="w-full min-w-[240px] md:w-[300px]"
                            placeholder="Cari unit, uraian, atau standar"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6 p-4">
                <form
                    className="space-y-6"
                    onSubmit={(event) => {
                        event.preventDefault();
                        saveProcess('DRAFT');
                    }}
                >
                    {filteredSections.map((section) => (
                        <div key={section.id} className="overflow-hidden rounded-xl border border-border/60">
                            <div className="border-b border-border/60 bg-muted/30 px-4 py-3">
                                <p className="font-semibold">{section.name}</p>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="px-4">Uraian Process</TableHead>
                                        <TableHead>Kondisi Standar</TableHead>
                                        <TableHead>Kondisi Aktual</TableHead>
                                        <TableHead className="px-4">Keterangan</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {section.items.map((item) => {
                                        const valueIndex = form.data.process.values.findIndex((value) => value.item_id === item.id);
                                        const value = form.data.process.values[valueIndex];

                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell className="px-4 font-medium">{item.name}</TableCell>
                                                <TableCell>{item.standard_condition ?? '-'}</TableCell>
                                                <TableCell className="min-w-[220px]">
                                                    {item.input_type === 'number' ? (
                                                        <Input
                                                            type="number"
                                                            value={value?.value_number ?? ''}
                                                            readOnly={readOnly}
                                                            onChange={(event) => {
                                                                form.setData('process', {
                                                                    ...form.data.process,
                                                                    values: form.data.process.values.map((currentValue, currentIndex) =>
                                                                        currentIndex === valueIndex
                                                                            ? {
                                                                                  ...currentValue,
                                                                                  value_number: event.target.value,
                                                                                  value_text: '',
                                                                              }
                                                                            : currentValue,
                                                                    ),
                                                                });
                                                            }}
                                                        />
                                                    ) : (
                                                        <Input
                                                            value={value?.value_text ?? ''}
                                                            readOnly={readOnly}
                                                            onChange={(event) => {
                                                                form.setData('process', {
                                                                    ...form.data.process,
                                                                    values: form.data.process.values.map((currentValue, currentIndex) =>
                                                                        currentIndex === valueIndex
                                                                            ? {
                                                                                  ...currentValue,
                                                                                  value_text: event.target.value,
                                                                                  value_number: '',
                                                                              }
                                                                            : currentValue,
                                                                    ),
                                                                });
                                                            }}
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-4">
                                                    <Textarea
                                                        value={value?.note ?? ''}
                                                        readOnly={readOnly}
                                                        onChange={(event) => {
                                                            form.setData('process', {
                                                                ...form.data.process,
                                                                values: form.data.process.values.map((currentValue, currentIndex) =>
                                                                    currentIndex === valueIndex ? { ...currentValue, note: event.target.value } : currentValue,
                                                                ),
                                                            });
                                                        }}
                                                        className="min-h-14"
                                                        placeholder="Catatan tambahan"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    ))}

                    <div className="rounded-xl border border-border/60 p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="flex items-center gap-2 font-semibold">
                                    <FlaskConical className="size-4 text-primary" />
                                    Catatan Proses Mixing
                                </p>
                                <p className="text-sm text-muted-foreground">Diisi jika ada proses mixing pada hari ini.</p>
                            </div>
                            <Select
                                items={[
                                    { value: 'NO', label: 'Tidak ada mixing hari ini' },
                                    { value: 'YES', label: 'Ada proses mixing' },
                                ]}
                                value={form.data.has_mixing ? 'YES' : 'NO'}
                                onValueChange={(value) => {
                                    const hasMixing = value === 'YES';

                                    form.setData('has_mixing', hasMixing);

                                    if (!hasMixing) {
                                        form.setData('batch', []);
                                    }
                                }}
                                disabled={readOnly}
                            >
                                <SelectTrigger className="w-full md:w-[260px]">
                                    <SelectValue placeholder="Status mixing" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NO">Tidak ada mixing hari ini</SelectItem>
                                    <SelectItem value="YES">Ada proses mixing</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <BatchMixingSection
                            entryForm={entryForm}
                            form={form}
                            readOnly={readOnly}
                            selectedBatchNo={selectedAvailableBatchNo}
                            setSelectedBatchNo={setSelectedBatchNo}
                        />
                    </div>

                    {!readOnly ? (
                        <div className="flex flex-wrap justify-end gap-2">
                            <Button type="submit" disabled={form.processing || form.data.process.template_id === null}>
                                <Save className="size-4" />
                                Simpan Draft Process
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                disabled={form.processing || form.data.process.template_id === null}
                                onClick={() => {
                                    saveProcess('SUBMIT');
                                }}
                            >
                                <Send className="size-4" />
                                Submit Harian
                            </Button>
                        </div>
                    ) : null}
                </form>
            </CardContent>
        </Card>
    );
}
