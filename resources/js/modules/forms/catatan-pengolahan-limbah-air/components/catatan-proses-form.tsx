import { useForm } from '@inertiajs/react';
import { ChevronDown, ChevronUp, FlaskConical, Save, Send } from 'lucide-react';
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
    const [collapsedSections, setCollapsedSections] = React.useState<Record<string | number, boolean>>({});

    const toggleSection = (sectionId: string | number) => {
        setCollapsedSections((prev) => ({
            ...prev,
            [sectionId]: !prev[sectionId],
        }));
    };

    const openAllSections = () => {
        setCollapsedSections({});
    };

    const closeAllSections = () => {
        const closed: Record<string | number, boolean> = {};
        entryForm.process.sections.forEach((section) => {
            closed[section.id] = true;
        });
        setCollapsedSections(closed);
    };

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
        <Card className="overflow-hidden border-border/50 shadow-md">
            <CardHeader className="border-b border-border/50 bg-slate-50/50 pb-5 pt-6 dark:bg-transparent">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-1.5">
                        <CardTitle className="text-xl font-bold tracking-tight text-foreground">Catatan Process</CardTitle>
                        <CardDescription className="text-base">
                            {entryForm.process.template_name ?? 'Template proses belum tersedia.'}
                        </CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="outline" className="px-3 py-1.5 shadow-sm bg-background">
                            Tanggal Pengisian: {entryForm.entry.tanggal}
                        </Badge>
                        <div className="relative">
                            <Input
                                value={processQuery}
                                onChange={(event) => setProcessQuery(event.target.value)}
                                className="w-full min-w-[240px] shadow-sm md:w-[300px] bg-background"
                                placeholder="Cari unit, uraian, atau standar..."
                            />
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-8 p-5 sm:p-6">
                <form
                    className="space-y-8"
                    onSubmit={(event) => {
                        event.preventDefault();
                        saveProcess('DRAFT');
                    }}
                >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/30 pb-3">
                        <p className="text-sm font-semibold text-foreground">Daftar Unit & Uraian Proses</p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const isAllClosed = Object.keys(collapsedSections).length === entryForm.process.sections.length;
                                if (isAllClosed) {
                                    openAllSections();
                                } else {
                                    closeAllSections();
                                }
                            }}
                            className="h-8 px-3 text-xs bg-background shadow-sm hover:bg-muted transition-all active:scale-95"
                        >
                            {Object.keys(collapsedSections).length === entryForm.process.sections.length ? 'Buka Semua' : 'Tutup Semua'}
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {filteredSections.map((section) => {
                            const isCollapsed = processQuery.trim() !== '' ? false : !!collapsedSections[section.id];

                            return (
                                <div key={section.id} className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm">
                                    <div 
                                        className="flex cursor-pointer select-none items-center justify-between border-b border-border/50 bg-primary px-5 py-3.5 transition-colors hover:bg-primary/95 dark:bg-muted/20 dark:hover:bg-muted/30"
                                        onClick={() => toggleSection(section.id)}
                                    >
                                        <p className="font-semibold text-white">{section.name}</p>
                                        <div className="text-white/80 dark:text-muted-foreground">
                                            {isCollapsed ? (
                                                <ChevronDown className="size-5" />
                                            ) : (
                                                <ChevronUp className="size-5" />
                                            )}
                                        </div>
                                    </div>
                                    <div className={isCollapsed ? 'hidden' : 'overflow-x-auto'}>
                                        <Table>
                                            <TableHeader className="bg-transparent">
                                                <TableRow className="hover:bg-transparent">
                                                    <TableHead className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Uraian Process</TableHead>
                                                    <TableHead className="py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kondisi Standar</TableHead>
                                                    <TableHead className="py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kondisi Aktual</TableHead>
                                                    <TableHead className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Keterangan</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {section.items.map((item) => {
                                                    const valueIndex = form.data.process.values.findIndex((value) => value.item_id === item.id);
                                                    const value = form.data.process.values[valueIndex];

                                                    return (
                                                        <TableRow key={item.id} className="transition-colors hover:bg-primary/15">
                                                            <TableCell className="px-5 align-top pt-5 font-medium text-foreground/80">
                                                                {item.name}
                                                            </TableCell>
                                                            <TableCell className="align-top pt-5 text-muted-foreground">
                                                                {item.standard_condition ?? '-'}
                                                            </TableCell>
                                                            <TableCell className="min-w-[240px] align-top pt-4">
                                                                {item.input_type === 'number' ? (
                                                                    <Input
                                                                        type="number"
                                                                        className="bg-background shadow-sm transition-all"
                                                                        placeholder="Masukkan angka..."
                                                                        value={value?.value_number ?? ''}
                                                                        readOnly={readOnly}
                                                                        onChange={(event) => {
                                                                            form.setData('process', {
                                                                                ...form.data.process,
                                                                                values: form.data.process.values.map((currentValue, currentIndex) =>
                                                                                    currentIndex === valueIndex
                                                                                        ? { ...currentValue, value_number: event.target.value, value_text: '' }
                                                                                        : currentValue,
                                                                                ),
                                                                            });
                                                                        }}
                                                                    />
                                                                ) : item.input_type === 'option_standard' ? (
                                                                    <Select
                                                                        value={value?.value_text ?? ''}
                                                                        onValueChange={(val) => {
                                                                            form.setData('process', {
                                                                                ...form.data.process,
                                                                                values: form.data.process.values.map((currentValue, currentIndex) =>
                                                                                    currentIndex === valueIndex
                                                                                        ? { ...currentValue, value_text: val, value_number: '' }
                                                                                        : currentValue,
                                                                                ),
                                                                            });
                                                                        }}
                                                                        disabled={readOnly}
                                                                    >
                                                                        <SelectTrigger className="w-full bg-background shadow-sm transition-all">
                                                                            <SelectValue placeholder="Pilih standar..." />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="Standar">Standar</SelectItem>
                                                                            <SelectItem value="Tidak Standar">Tidak Standar</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                ) : item.input_type === 'option_with_manual' ? (
                                                                    <div className="space-y-2">
                                                                        <Select
                                                                            value={value?.value_text === 'Standar' ? 'Standar' : (value?.value_text ? 'Lainnya' : '')}
                                                                            onValueChange={(val) => {
                                                                                const newText = val === 'Lainnya' ? ' ' : val;
                                                                                form.setData('process', {
                                                                                    ...form.data.process,
                                                                                    values: form.data.process.values.map((currentValue, currentIndex) =>
                                                                                        currentIndex === valueIndex
                                                                                            ? { ...currentValue, value_text: newText, value_number: '' }
                                                                                            : currentValue,
                                                                                    ),
                                                                                });
                                                                            }}
                                                                            disabled={readOnly}
                                                                        >
                                                                            <SelectTrigger className="w-full bg-background shadow-sm transition-all">
                                                                                <SelectValue placeholder="Pilih standar..." />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="Standar">Standar</SelectItem>
                                                                                <SelectItem value="Lainnya">Yang lain...</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                        {value?.value_text && value.value_text !== 'Standar' && (
                                                                            <Input
                                                                                className="bg-background shadow-sm transition-all animate-in fade-in slide-in-from-top-2"
                                                                                placeholder="Masukkan kondisi aktual..."
                                                                                value={value.value_text === ' ' ? '' : value.value_text}
                                                                                readOnly={readOnly}
                                                                                onChange={(event) => {
                                                                                    form.setData('process', {
                                                                                        ...form.data.process,
                                                                                        values: form.data.process.values.map((currentValue, currentIndex) =>
                                                                                            currentIndex === valueIndex
                                                                                                ? { ...currentValue, value_text: event.target.value, value_number: '' }
                                                                                                : currentValue,
                                                                                        ),
                                                                                    });
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <Input
                                                                        className="bg-background shadow-sm transition-all"
                                                                        placeholder="Masukkan data..."
                                                                        value={value?.value_text ?? ''}
                                                                        readOnly={readOnly}
                                                                        onChange={(event) => {
                                                                            form.setData('process', {
                                                                                ...form.data.process,
                                                                                values: form.data.process.values.map((currentValue, currentIndex) =>
                                                                                    currentIndex === valueIndex
                                                                                        ? { ...currentValue, value_text: event.target.value, value_number: '' }
                                                                                        : currentValue,
                                                                                ),
                                                                            });
                                                                        }}
                                                                    />
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="px-5 align-top pt-4">
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
                                                                    className="min-h-[44px] resize-y bg-background shadow-sm transition-all"
                                                                    placeholder="Catatan tambahan..."
                                                                />
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

                    {/* SECTION MIXING (HIGHLIGHTED) */}
                    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-slate-50 to-transparent p-5 shadow-sm dark:from-muted/10 dark:to-transparent">
                        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h3 className="flex items-center gap-2.5 text-lg font-semibold text-foreground">
                                    <div className="rounded-md bg-primary/10 p-1.5 text-primary">
                                        <FlaskConical className="size-4" />
                                    </div>
                                    Catatan Proses Mixing
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">Pilih status untuk mencatat aktivitas mixing hari ini.</p>
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
                                <SelectTrigger className="h-10 w-full bg-background shadow-sm md:w-[280px]">
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

                    {/* SUBMIT FOOTER */}
                    {!readOnly ? (
                        <div className="mt-8 flex flex-wrap items-center justify-end gap-3 rounded-xl border border-border/50 bg-slate-50/80 p-4 shadow-sm dark:bg-muted/20">
                            <Button 
                                type="submit" 
                                variant="outline"
                                className="bg-background shadow-sm hover:bg-muted"
                                disabled={form.processing || form.data.process.template_id === null}
                            >
                                <Save className="mr-2 size-4" />
                                Simpan Draft Process
                            </Button>
                            <Button
                                type="button"
                                className="shadow-sm"
                                disabled={form.processing || form.data.process.template_id === null}
                                onClick={() => {
                                    saveProcess('SUBMIT');
                                }}
                            >
                                <Send className="mr-2 size-4" />
                                Submit Harian
                            </Button>
                        </div>
                    ) : null}
                </form>
            </CardContent>
        </Card>
    );
}