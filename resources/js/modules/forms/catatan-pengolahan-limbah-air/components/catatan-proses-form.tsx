import { useForm, router } from '@inertiajs/react';
import { showAlert } from '@/lib/sweetalert';
import { CheckCircle2, ChevronDown, ChevronUp, FlaskConical, Paperclip, RotateCcw, Save, Send, X } from 'lucide-react';
import * as React from 'react';

import {
    catatanPengolahanLimbahAirApproveDailyLog,
    catatanPengolahanLimbahAirReopenDailyLog,
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
import { Label } from '@/components/ui/label';
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
import { ActualValueInput } from './actual-value-input';
import { BatchMixingSection } from './batch-mixing-section';
import type { ProcessFormState } from './entry-form-types';
import { buildAvailableBatchNumbers } from './entry-form-types';
import { RowPhoto } from './row-photo';

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
    const fileInputRefs = React.useRef<Record<number, HTMLInputElement | null>>({});
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
                    attachment: null,
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
        [form.data.batch, entryForm.batch.max_batch_no],
    );
    const selectedAvailableBatchNo = availableBatchNumbers
        .map(String)
        .includes(selectedBatchNo)
        ? selectedBatchNo
        : String(availableBatchNumbers[0] ?? '1');

    const submitFilters = (keyword: string) => {
        return entryForm.process.sections
            .map((section) => {
                if (!keyword) return section;

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
    };

    const filteredSections = submitFilters(processQuery);
    const isSubmittedWaitingSupervisor =
        entryForm.entry.status === 'SUBMITTED' &&
        !entryForm.capabilities.approve_daily_process;

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
                onSuccess: () => {
                    showAlert({
                        icon: 'success',
                        title: 'Berhasil',
                        text: `Catatan proses berhasil ${action === 'SUBMIT' ? 'disubmit' : 'disimpan'}!`,
                        timer: 2000,
                        showConfirmButton: false,
                    });
                },
                onError: () => {
                    showAlert({
                        icon: 'error',
                        title: 'Gagal Menyimpan',
                        text: 'Terdapat kesalahan pada isian form Anda.',
                        confirmButtonText: 'Tutup',
                    });
                },
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
            {Object.keys(form.errors).length > 0 ? (
                <div className="bg-destructive/10 text-destructive p-4 text-sm border-b border-destructive/20 font-medium">
                    Gagal menyimpan: {Object.values(form.errors)[0]}
                </div>
            ) : null}
            <CardContent
                className={[
                    'space-y-8 p-5 sm:p-6',
                    entryForm.capabilities.approve_daily_process
                        ? 'pb-28 sm:pb-32'
                        : '',
                ].join(' ')}
            >
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

                    {isSubmittedWaitingSupervisor ? (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 shadow-sm dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-200">
                            Sudah submit, menunggu pemeriksaan supervisor.
                        </div>
                    ) : null}

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
                                                    <TableHead className="px-5 py-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                        Foto
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
                                                                <ActualValueInput
                                                                    inputType={item.input_type}
                                                                    valueText={value?.value_text ?? ''}
                                                                    valueNumber={value?.value_number ?? ''}
                                                                    readOnly={readOnly}
                                                                    required={!readOnly}
                                                                    onChange={(nextValue) => {
                                                                        form.setData(
                                                                            'process',
                                                                            {
                                                                                ...form.data.process,
                                                                                values: form.data.process.values.map(
                                                                                    (currentValue, currentIndex) =>
                                                                                        currentIndex === valueIndex
                                                                                            ? {
                                                                                                  ...currentValue,
                                                                                                  ...nextValue,
                                                                                              }
                                                                                            : currentValue,
                                                                                ),
                                                                            },
                                                                        );
                                                                    }}
                                                                />
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
                                                            <TableCell className="px-5 pt-4 align-top">
                                                                <RowPhoto
                                                                    index={valueIndex}
                                                                    readOnly={readOnly}
                                                                    existingUrl={(item as Record<string, unknown>).attachment_url as string | null | undefined}
                                                                    existingName={(item as Record<string, unknown>).attachment_original_name as string | null | undefined}
                                                                    currentFile={value?.attachment ?? null}
                                                                    inputRef={(el) => { fileInputRefs.current[valueIndex] = el; }}
                                                                    onFileChange={(file) => {
                                                                        form.setData('process', {
                                                                            ...form.data.process,
                                                                            values: form.data.process.values.map(
                                                                                (currentValue, currentIndex) =>
                                                                                    currentIndex === valueIndex
                                                                                        ? { ...currentValue, attachment: file }
                                                                                        : currentValue,
                                                                            ),
                                                                        });
                                                                    }}
                                                                    onClear={() => {
                                                                        const input = fileInputRefs.current[valueIndex];
                                                                        if (input) { input.value = ''; }
                                                                        form.setData('process', {
                                                                            ...form.data.process,
                                                                            values: form.data.process.values.map(
                                                                                (currentValue, currentIndex) =>
                                                                                    currentIndex === valueIndex
                                                                                        ? { ...currentValue, attachment: null }
                                                                                        : currentValue,
                                                                            ),
                                                                        });
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
                    {entryForm.capabilities.approve_daily_process && entryForm.entry.log_id ? (
                        <div className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-xl flex-col gap-3 rounded-xl border border-emerald-200 bg-background/95 p-4 shadow-2xl ring-1 ring-emerald-100 backdrop-blur sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[420px] dark:border-emerald-800 dark:ring-emerald-900/50">
                            <div>
                                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                                    Menunggu pemeriksaan supervisor
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Catatan proses ini sudah disubmit operator.
                                </p>
                            </div>
                            <Button
                                type="button"
                                className="w-full bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
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
                                Di Periksa
                            </Button>
                        </div>
                    ) : null}
                    {/* SUPERADMIN RE-OPEN BUTTON (F2-05) */}
                    {entryForm.capabilities.reopen_daily_process && entryForm.entry.log_id ? (
                        <div className="mt-4 flex flex-wrap items-center justify-end gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-4 shadow-sm dark:border-amber-800 dark:bg-amber-950/20">
                            <p className="mr-auto text-sm text-amber-700 dark:text-amber-300">
                                Log ini sudah diperiksa. Sebagai Superadmin, kamu bisa me-reopen log ini untuk dikoreksi operator.
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                className="border-amber-300 text-amber-700 shadow-sm hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300"
                                onClick={() => {
                                    if (entryForm.entry.log_id === null) {
                                        return;
                                    }
                                    router.patch(
                                        catatanPengolahanLimbahAirReopenDailyLog.url(
                                            { log: entryForm.entry.log_id },
                                            { query: { user_id: userId } },
                                        ),
                                        {},
                                        { preserveScroll: true },
                                    );
                                }}
                            >
                                <RotateCcw className="mr-2 size-4" />
                                Re-open Log
                            </Button>
                        </div>
                    ) : null}
                </form>
            </CardContent>
        </Card>
    );
}
