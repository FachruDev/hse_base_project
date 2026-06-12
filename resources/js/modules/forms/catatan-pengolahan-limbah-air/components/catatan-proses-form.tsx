import { useForm } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { CheckCircle2, ChevronDown, ChevronUp, FlaskConical, Save, Send } from 'lucide-react';
import * as React from 'react';

import {
    catatanPengolahanLimbahAirApproveDailyLog,
    catatanPengolahanLimbahAirSaveProcess,
} from '@/actions/App/Http/Controllers/Web/DashboardController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import type { CatatanPengolahanLimbahAirEntryPayload } from '@/modules/dashboard/types';
import { BatchMixingSection } from './batch-mixing-section';
import type { ProcessFormState } from './entry-form-types';
import { buildAvailableBatchNumbers } from './entry-form-types';

function roundToDecimals(value: string, decimals: number): string {
    const num = parseFloat(value);
    if (isNaN(num)) {
        return value;
    }
    return num.toFixed(decimals);
}

type CatatanProsesFormProps = {
    entryForm: CatatanPengolahanLimbahAirEntryPayload;
    userId: string;
};

export function CatatanProsesForm({
    entryForm,
    userId,
}: CatatanProsesFormProps) {
    const [processQuery, setProcessQuery] = React.useState('');
    const [selectedBatchNo, setSelectedBatchNo] = React.useState<string>('1');
    const [collapsedSections, setCollapsedSections] = React.useState<
        Record<string | number, boolean>
    >({});
    const batchItems = entryForm.batch.sections.flatMap(
        (section) => section.items,
    );

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
                    value_number:
                        item.value_number !== null
                            ? String(item.value_number)
                            : '',
                    note: item.note ?? '',
                })),
            ),
        },
        batch: entryForm.batch.groups.map((group) => ({
            batch_no: group.batch_no,
            values: batchItems.map((batchItem) => {
                const existingValue = group.values.find(
                    (value) => value.item_id === batchItem.id,
                );

                return {
                    item_id: batchItem.id,
                    value_text: existingValue?.value_text ?? '',
                    value_number:
                        existingValue?.value_number != null
                            ? String(existingValue.value_number)
                            : '',
                };
            }),
        })),
    });
    const readOnly = entryForm.process.read_only || entryForm.entry.read_only;
    const availableBatchNumbers = React.useMemo(
        () =>
            buildAvailableBatchNumbers(
                entryForm.batch.max_batch_no,
                form.data.batch,
            ),
        [entryForm.batch.max_batch_no, form.data.batch],
    );
    const selectedAvailableBatchNo = availableBatchNumbers
        .map(String)
        .includes(selectedBatchNo)
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
                    (item.standard_condition ?? '')
                        .toLowerCase()
                        .includes(keyword)
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

        form.post(
            catatanPengolahanLimbahAirSaveProcess.url({
                query: { user_id: userId },
            }),
            {
                preserveScroll: true,
                onFinish: () => {
                    form.transform((data) => data);
                },
            },
        );
    };

    return (
        <Card className="overflow-hidden border-border/50 shadow-md">
            <CardHeader className="border-b border-border/50 bg-slate-50/50 pt-6 pb-5 dark:bg-transparent">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-1.5">
                        <CardTitle className="text-xl font-bold tracking-tight text-foreground">
                            Catatan Process
                        </CardTitle>
                        <CardDescription className="text-base">
                            {entryForm.process.template_name ??
                                'Template proses belum tersedia.'}
                        </CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge
                            variant="outline"
                            className="bg-background px-3 py-1.5 shadow-sm"
                        >
                            Tanggal Pengisian: {entryForm.entry.tanggal}
                        </Badge>
                        <div className="relative">
                            <Input
                                value={processQuery}
                                onChange={(event) =>
                                    setProcessQuery(event.target.value)
                                }
                                className="w-full min-w-[240px] bg-background shadow-sm md:w-[300px]"
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
                        <p className="text-sm font-semibold text-foreground">
                            Daftar Unit & Uraian Proses
                        </p>
                        <div className="flex items-center gap-2">
                            {!readOnly && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        // Find all option_standard and option_with_manual and set them to "Standar"
                                        const newValues = [
                                            ...form.data.process.values,
                                        ];
                                        entryForm.process.sections.forEach(
                                            (section) => {
                                                section.items.forEach(
                                                    (item) => {
                                                        if (
                                                            item.input_type ===
                                                                'option_standard' ||
                                                            item.input_type ===
                                                                'option_with_manual'
                                                        ) {
                                                            const valIndex =
                                                                newValues.findIndex(
                                                                    (v) =>
                                                                        v.item_id ===
                                                                        item.id,
                                                                );

                                                            if (
                                                                valIndex !== -1
                                                            ) {
                                                                newValues[
                                                                    valIndex
                                                                ] = {
                                                                    ...newValues[
                                                                        valIndex
                                                                    ],
                                                                    value_text:
                                                                        'Standar',
                                                                };
                                                            }
                                                        }
                                                    },
                                                );
                                            },
                                        );
                                        form.setData('process', {
                                            ...form.data.process,
                                            values: newValues,
                                        });
                                    }}
                                    className="h-8 bg-primary px-3 text-xs text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
                                >
                                    Isi Semua Standar
                                </Button>
                            )}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const isAllClosed =
                                        Object.keys(collapsedSections)
                                            .length ===
                                        entryForm.process.sections.length;

                                    if (isAllClosed) {
                                        openAllSections();
                                    } else {
                                        closeAllSections();
                                    }
                                }}
                                className="h-8 bg-background px-3 text-xs shadow-sm transition-all hover:bg-muted active:scale-95"
                            >
                                {Object.keys(collapsedSections).length ===
                                entryForm.process.sections.length
                                    ? 'Buka Semua'
                                    : 'Tutup Semua'}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {filteredSections.map((section) => {
                            const isCollapsed =
                                processQuery.trim() !== ''
                                    ? false
                                    : !!collapsedSections[section.id];

                            return (
                                <div
                                    key={section.id}
                                    className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm"
                                >
                                    <div
                                        className="flex cursor-pointer items-center justify-between border-b border-border/50 bg-primary px-5 py-3.5 transition-colors select-none hover:bg-primary/95 dark:bg-muted/20 dark:hover:bg-muted/30"
                                        onClick={() =>
                                            toggleSection(section.id)
                                        }
                                    >
                                        <p className="font-semibold text-white">
                                            {section.name}
                                        </p>
                                        <div className="text-white/80 dark:text-muted-foreground">
                                            {isCollapsed ? (
                                                <ChevronDown className="size-5" />
                                            ) : (
                                                <ChevronUp className="size-5" />
                                            )}
                                        </div>
                                    </div>
                                    <div
                                        className={
                                            isCollapsed
                                                ? 'hidden'
                                                : 'overflow-x-auto'
                                        }
                                    >
                                        <Table>
                                            <TableHeader className="bg-transparent">
                                                <TableRow className="hover:bg-transparent">
                                                    <TableHead className="px-5 py-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                        Uraian Process
                                                    </TableHead>
                                                    <TableHead className="py-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                        Kondisi Standar
                                                    </TableHead>
                                                    <TableHead className="py-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                        Kondisi Aktual
                                                    </TableHead>
                                                    <TableHead className="px-5 py-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                        Keterangan
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {section.items.map((item) => {
                                                    const valueIndex =
                                                        form.data.process.values.findIndex(
                                                            (value) =>
                                                                value.item_id ===
                                                                item.id,
                                                        );
                                                    const value =
                                                        form.data.process
                                                            .values[valueIndex];

                                                    return (
                                                        <TableRow
                                                            key={item.id}
                                                            className="transition-colors odd:bg-primary/10 hover:bg-primary/15"
                                                        >
                                                            <TableCell className="px-5 pt-5 align-top font-medium text-foreground/80">
                                                                {item.name}
                                                            </TableCell>
                                                            <TableCell className="pt-5 align-top text-muted-foreground">
                                                                {item.standard_condition ??
                                                                    '-'}
                                                            </TableCell>
                                                            <TableCell className="min-w-[240px] pt-4 align-top">
                                                                {item.input_type ===
                                                                'number' ? (
                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
                                                                        className="bg-background shadow-sm transition-all"
                                                                        placeholder="Masukkan angka..."
                                                                        value={
                                                                            value?.value_number ??
                                                                            ''
                                                                        }
                                                                        readOnly={
                                                                            readOnly
                                                                        }
                                                                        required={
                                                                            !readOnly
                                                                        }
                                                                        onBlur={(event) => {
                                                                            const rounded = roundToDecimals(event.target.value, 2);
                                                                            if (rounded !== event.target.value && rounded !== '') {
                                                                                form.setData(
                                                                                    'process',
                                                                                    {
                                                                                        ...form.data.process,
                                                                                        values: form.data.process.values.map(
                                                                                            (currentValue, currentIndex) =>
                                                                                                currentIndex === valueIndex
                                                                                                    ? {
                                                                                                          ...currentValue,
                                                                                                          value_number: rounded,
                                                                                                          value_text: '',
                                                                                                      }
                                                                                                    : currentValue,
                                                                                        ),
                                                                                    },
                                                                                );
                                                                            }
                                                                        }}
                                                                        onChange={(
                                                                            event,
                                                                        ) => {
                                                                            form.setData(
                                                                                'process',
                                                                                {
                                                                                    ...form
                                                                                        .data
                                                                                        .process,
                                                                                    values: form.data.process.values.map(
                                                                                        (
                                                                                            currentValue,
                                                                                            currentIndex,
                                                                                        ) =>
                                                                                            currentIndex ===
                                                                                            valueIndex
                                                                                                ? {
                                                                                                      ...currentValue,
                                                                                                      value_number:
                                                                                                          event
                                                                                                              .target
                                                                                                              .value,
                                                                                                      value_text:
                                                                                                          '',
                                                                                                  }
                                                                                                : currentValue,
                                                                                    ),
                                                                                },
                                                                            );
                                                                        }}
                                                                    />
                                                                ) : item.input_type ===
                                                                  'option_standard' ? (
                                                                    <StandarToggle
                                                                        value={value?.value_text ?? ''}
                                                                        disabled={readOnly}
                                                                        onChange={(nextValue) => {
                                                                            form.setData(
                                                                                'process',
                                                                                {
                                                                                    ...form.data.process,
                                                                                    values: form.data.process.values.map(
                                                                                        (
                                                                                            currentValue,
                                                                                            currentIndex,
                                                                                        ) =>
                                                                                            currentIndex === valueIndex
                                                                                                ? {
                                                                                                      ...currentValue,
                                                                                                      value_text: nextValue,
                                                                                                      value_number: '',
                                                                                                  }
                                                                                                : currentValue,
                                                                                    ),
                                                                                },
                                                                            );
                                                                        }}
                                                                    />
                                                                ) : item.input_type ===
                                                                  'option_with_manual' ? (
                                                                    <div className="space-y-2">
                                                                        <StandarWithManualToggle
                                                                            value={
                                                                                value?.value_text === 'Standar'
                                                                                    ? 'Standar'
                                                                                    : value?.value_text
                                                                                      ? 'Lainnya'
                                                                                      : ''
                                                                            }
                                                                            disabled={readOnly}
                                                                            onChange={(nextMode) => {
                                                                                const newText =
                                                                                    nextMode === 'Lainnya'
                                                                                        ? ' '
                                                                                        : nextMode;
                                                                                form.setData(
                                                                                    'process',
                                                                                    {
                                                                                        ...form.data.process,
                                                                                        values: form.data.process.values.map(
                                                                                            (
                                                                                                currentValue,
                                                                                                currentIndex,
                                                                                            ) =>
                                                                                                currentIndex === valueIndex
                                                                                                    ? {
                                                                                                          ...currentValue,
                                                                                                          value_text: newText,
                                                                                                          value_number: '',
                                                                                                      }
                                                                                                    : currentValue,
                                                                                        ),
                                                                                    },
                                                                                );
                                                                            }}
                                                                        />
                                                                        {value?.value_text &&
                                                                            value.value_text !== 'Standar' && (
                                                                                <Input
                                                                                    className="animate-in bg-background shadow-sm transition-all fade-in slide-in-from-top-2"
                                                                                    placeholder="Masukkan kondisi aktual..."
                                                                                    value={
                                                                                        value.value_text === ' '
                                                                                            ? ''
                                                                                            : value.value_text
                                                                                    }
                                                                                    readOnly={readOnly}
                                                                                    required={!readOnly}
                                                                                    onChange={(event) => {
                                                                                        form.setData(
                                                                                            'process',
                                                                                            {
                                                                                                ...form.data.process,
                                                                                                values: form.data.process.values.map(
                                                                                                    (
                                                                                                        currentValue,
                                                                                                        currentIndex,
                                                                                                    ) =>
                                                                                                        currentIndex === valueIndex
                                                                                                            ? {
                                                                                                                  ...currentValue,
                                                                                                                  value_text: event.target.value,
                                                                                                                  value_number: '',
                                                                                                              }
                                                                                                            : currentValue,
                                                                                                ),
                                                                                            },
                                                                                        );
                                                                                    }}
                                                                                />
                                                                            )}
                                                                    </div>
                                                                ) : (
                                                                    <Input
                                                                        className="bg-background shadow-sm transition-all"
                                                                        placeholder="Masukkan data..."
                                                                        value={
                                                                            value?.value_text ??
                                                                            ''
                                                                        }
                                                                        readOnly={
                                                                            readOnly
                                                                        }
                                                                        required={
                                                                            !readOnly
                                                                        }
                                                                        onChange={(
                                                                            event,
                                                                        ) => {
                                                                            form.setData(
                                                                                'process',
                                                                                {
                                                                                    ...form
                                                                                        .data
                                                                                        .process,
                                                                                    values: form.data.process.values.map(
                                                                                        (
                                                                                            currentValue,
                                                                                            currentIndex,
                                                                                        ) =>
                                                                                            currentIndex ===
                                                                                            valueIndex
                                                                                                ? {
                                                                                                      ...currentValue,
                                                                                                      value_text:
                                                                                                          event
                                                                                                              .target
                                                                                                              .value,
                                                                                                      value_number:
                                                                                                          '',
                                                                                                  }
                                                                                                : currentValue,
                                                                                    ),
                                                                                },
                                                                            );
                                                                        }}
                                                                    />
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="px-5 pt-4 align-top">
                                                                <Textarea
                                                                    value={
                                                                        value?.note ??
                                                                        ''
                                                                    }
                                                                    readOnly={
                                                                        readOnly
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) => {
                                                                        form.setData(
                                                                            'process',
                                                                            {
                                                                                ...form
                                                                                    .data
                                                                                    .process,
                                                                                values: form.data.process.values.map(
                                                                                    (
                                                                                        currentValue,
                                                                                        currentIndex,
                                                                                    ) =>
                                                                                        currentIndex ===
                                                                                        valueIndex
                                                                                            ? {
                                                                                                  ...currentValue,
                                                                                                  note: event
                                                                                                      .target
                                                                                                      .value,
                                                                                              }
                                                                                            : currentValue,
                                                                                ),
                                                                            },
                                                                        );
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
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Pilih status untuk mencatat aktivitas mixing
                                    hari ini.
                                </p>
                            </div>
                            <Select
                                items={[
                                    {
                                        value: 'NO',
                                        label: 'Tidak ada mixing hari ini',
                                    },
                                    {
                                        value: 'YES',
                                        label: 'Ada proses mixing',
                                    },
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
                                    <SelectItem value="NO">
                                        Tidak ada mixing hari ini
                                    </SelectItem>
                                    <SelectItem value="YES">
                                        Ada proses mixing
                                    </SelectItem>
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
                                disabled={
                                    form.processing ||
                                    form.data.process.template_id === null
                                }
                            >
                                <Save className="mr-2 size-4" />
                                Simpan Draft Process
                            </Button>
                            <Button
                                type="button"
                                className="shadow-sm"
                                disabled={
                                    form.processing ||
                                    form.data.process.template_id === null
                                }
                                onClick={() => {
                                    saveProcess('SUBMIT');
                                }}
                            >
                                <Send className="mr-2 size-4" />
                                Submit Harian
                            </Button>
                        </div>
                    ) : null}
                    {/* SUPERVISOR APPROVE BUTTON (F2-08) */}
                    {entryForm.capabilities.approve_daily_process && entryForm.entry.log_id ? (
                        <div className="mt-4 flex flex-wrap items-center justify-end gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/20">
                            <p className="mr-auto text-sm text-emerald-700 dark:text-emerald-300">
                                Catatan proses ini menunggu pemeriksaan supervisor.
                            </p>
                            <Button
                                type="button"
                                className="bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                                onClick={() => {
                                    if (entryForm.entry.log_id === null) {
                                        return;
                                    }
                                    router.patch(
                                        catatanPengolahanLimbahAirApproveDailyLog.url(
                                            { log: entryForm.entry.log_id },
                                            { query: { user_id: userId } },
                                        ),
                                        {},
                                        { preserveScroll: true },
                                    );
                                }}
                            >
                                <CheckCircle2 className="mr-2 size-4" />
                                ✓ Di Periksa
                            </Button>
                        </div>
                    ) : null}
                </form>
            </CardContent>
        </Card>
    );
}

type StandarToggleProps = {
    value: string;
    disabled?: boolean;
    onChange: (value: string) => void;
};

function StandarToggle({ value, disabled = false, onChange }: StandarToggleProps) {
    return (
        <div className="inline-flex overflow-hidden rounded-lg border border-border shadow-sm">
            <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(value === 'Tidak Standar' ? '' : 'Tidak Standar')}
                className={[
                    'flex min-w-[110px] items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium transition-all duration-200 select-none',
                    !disabled && 'cursor-pointer',
                    disabled && 'cursor-not-allowed opacity-60',
                    value === 'Tidak Standar'
                        ? 'bg-red-500 text-white shadow-inner'
                        : 'bg-background text-muted-foreground hover:bg-red-50 hover:text-red-600',
                ]
                    .filter(Boolean)
                    .join(' ')}
            >
                <span className="text-base leading-none">✕</span>
                Tidak Standar
            </button>
            <div className="w-px bg-border" />
            <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(value === 'Standar' ? '' : 'Standar')}
                className={[
                    'flex min-w-[90px] items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium transition-all duration-200 select-none',
                    !disabled && 'cursor-pointer',
                    disabled && 'cursor-not-allowed opacity-60',
                    value === 'Standar'
                        ? 'bg-emerald-500 text-white shadow-inner'
                        : 'bg-background text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600',
                ]
                    .filter(Boolean)
                    .join(' ')}
            >
                <span className="text-base leading-none">✓</span>
                Standar
            </button>
        </div>
    );
}

type StandarWithManualToggleProps = {
    value: string;
    disabled?: boolean;
    onChange: (value: string) => void;
};

function StandarWithManualToggle({ value, disabled = false, onChange }: StandarWithManualToggleProps) {
    return (
        <div className="inline-flex overflow-hidden rounded-lg border border-border shadow-sm">
            <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(value === 'Lainnya' ? '' : 'Lainnya')}
                className={[
                    'flex min-w-[100px] items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium transition-all duration-200 select-none',
                    !disabled && 'cursor-pointer',
                    disabled && 'cursor-not-allowed opacity-60',
                    value === 'Lainnya'
                        ? 'bg-amber-500 text-white shadow-inner'
                        : 'bg-background text-muted-foreground hover:bg-amber-50 hover:text-amber-600',
                ]
                    .filter(Boolean)
                    .join(' ')}
            >
                <span className="text-base leading-none">✎</span>
                Yang lain...
            </button>
            <div className="w-px bg-border" />
            <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(value === 'Standar' ? '' : 'Standar')}
                className={[
                    'flex min-w-[90px] items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium transition-all duration-200 select-none',
                    !disabled && 'cursor-pointer',
                    disabled && 'cursor-not-allowed opacity-60',
                    value === 'Standar'
                        ? 'bg-emerald-500 text-white shadow-inner'
                        : 'bg-background text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600',
                ]
                    .filter(Boolean)
                    .join(' ')}
            >
                <span className="text-base leading-none">✓</span>
                Standar
            </button>
        </div>
    );
}
