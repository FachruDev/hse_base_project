import { useForm } from '@inertiajs/react';
import { Paperclip, Save, X } from 'lucide-react';
import * as React from 'react';

import { catatanPengolahanLimbahAirSaveChecklist } from '@/actions/App/Http/Controllers/Web/DashboardController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import type { CatatanPengolahanLimbahAirEntryPayload } from '@/modules/dashboard/types';
import type { ChecklistFormState, ChecklistStatus } from './entry-form-types';
import { normalizeChecklistStatus } from './entry-form-types';
import { RowPhoto } from './row-photo';

type ChecklistHarianFormProps = {
    entryForm: CatatanPengolahanLimbahAirEntryPayload;
    userId: string;
};

export function ChecklistHarianForm({ entryForm, userId }: ChecklistHarianFormProps) {
    const fileInputRefs = React.useRef<Record<number, HTMLInputElement | null>>({});

    const form = useForm<ChecklistFormState>({
        tanggal: entryForm.entry.tanggal,
        checklist: {
            template_id: entryForm.checklist.template_id,
            values: entryForm.checklist.items.map((item) => ({
                item_id: item.id,
                status: normalizeChecklistStatus(item.status),
                note: item.note ?? '',
                attachment: null,
            })),
        },
    });
    const readOnly = entryForm.checklist.read_only || entryForm.entry.read_only;

    const saveChecklist = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(catatanPengolahanLimbahAirSaveChecklist.url({ query: { user_id: userId } }), {
            preserveScroll: true,
        });
    };

    return (
        <Card className="border-none shadow-sm ring-1 ring-border/60">
            <CardHeader className="border-b border-border/60">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <CardTitle className="text-base">Checklist Harian</CardTitle>
                        <CardDescription>{entryForm.checklist.template_name ?? 'Template checklist belum tersedia.'}</CardDescription>
                    </div>
                    <Badge variant="outline">Tanggal Pengisian: {entryForm.entry.tanggal}</Badge>

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
                                <TableHead className="px-4">Foto</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {entryForm.checklist.items.map((item, index) => {
                                const existingAttachmentUrl = item.attachment_url as string | null | undefined;
                                const existingAttachmentName = item.attachment_original_name as string | null | undefined;
                                const currentFile = form.data.checklist.values[index]?.attachment;

                                return (
                                    <TableRow key={item.id}>
                                        <TableCell className="px-4 font-medium">{item.name}</TableCell>
                                        <TableCell>{item.standard_condition ?? '-'}</TableCell>
                                        <TableCell className="min-w-[200px]">
                                            <YaTidakToggle
                                                value={form.data.checklist.values[index]?.status ?? ''}
                                                disabled={readOnly}
                                                onChange={(nextStatus) => {
                                                    form.setData('checklist', {
                                                        ...form.data.checklist,
                                                        values: form.data.checklist.values.map((valueItem, valueIndex) =>
                                                            valueIndex === index ? { ...valueItem, status: nextStatus as ChecklistStatus } : valueItem,
                                                        ),
                                                    });
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell className="px-4">
                                            <Textarea
                                                value={form.data.checklist.values[index]?.note ?? ''}
                                                readOnly={readOnly}
                                                onChange={(event) => {
                                                    form.setData('checklist', {
                                                        ...form.data.checklist,
                                                        values: form.data.checklist.values.map((valueItem, valueIndex) =>
                                                            valueIndex === index ? { ...valueItem, note: event.target.value } : valueItem,
                                                        ),
                                                    });
                                                }}
                                                className="min-h-14"
                                                placeholder="Contoh: perlu pembersihan ulang"
                                            />
                                        </TableCell>
                                        <TableCell className="px-4">
                                            <RowPhoto
                                                index={index}
                                                readOnly={readOnly}
                                                existingUrl={existingAttachmentUrl}
                                                existingName={existingAttachmentName}
                                                currentFile={currentFile}
                                                inputRef={(el) => { fileInputRefs.current[index] = el; }}
                                                onFileChange={(file) => {
                                                    form.setData('checklist', {
                                                        ...form.data.checklist,
                                                        values: form.data.checklist.values.map(
                                                            (val, i) => i === index ? { ...val, attachment: file } : val
                                                        )
                                                    });
                                                }}
                                                onClear={() => {
                                                    const input = fileInputRefs.current[index];
                                                    if (input) { input.value = ''; }
                                                    form.setData('checklist', {
                                                        ...form.data.checklist,
                                                        values: form.data.checklist.values.map(
                                                            (val, i) => i === index ? { ...val, attachment: null } : val
                                                        )
                                                    });
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    {!readOnly ? (
                        <div className="mt-8 flex flex-wrap items-center justify-end gap-3 rounded-xl border border-border/50 bg-slate-50/80 p-4 shadow-sm dark:bg-muted/20">
                            <Button
                                type="submit"
                                disabled={
                                    form.processing ||
                                    form.data.checklist.template_id === null ||
                                    form.data.checklist.values.length === 0 ||
                                    form.data.checklist.values.some((value) => value.status === '')
                                }
                            >
                                <Save className="size-4" />
                                Simpan Checklist
                            </Button>
                        </div>
                    ) : null}
                </form>
            </CardContent>
        </Card>
    );
}

type YaTidakToggleProps = {
    value: string;
    disabled?: boolean;
    onChange: (value: string) => void;
};

function YaTidakToggle({ value, disabled = false, onChange }: YaTidakToggleProps) {
    return (
        <div className="inline-flex overflow-hidden rounded-lg border border-border shadow-sm">
            <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(value === 'NOT_OK' ? '' : 'NOT_OK')}
                className={[
                    'flex min-w-[80px] items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium transition-all duration-200 select-none',
                    !disabled && 'cursor-pointer',
                    disabled && 'cursor-not-allowed opacity-60',
                    value === 'NOT_OK'
                        ? 'bg-red-500 text-white shadow-inner'
                        : 'bg-background text-muted-foreground hover:bg-red-50 hover:text-red-600',
                ]
                    .filter(Boolean)
                    .join(' ')}
            >
                <span className="text-base leading-none">{value === 'NOT_OK' ? '✕' : '✕'}</span>
                Tidak
            </button>
            <div className="w-px bg-border" />
            <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(value === 'OK' ? '' : 'OK')}
                className={[
                    'flex min-w-[80px] items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium transition-all duration-200 select-none',
                    !disabled && 'cursor-pointer',
                    disabled && 'cursor-not-allowed opacity-60',
                    value === 'OK'
                        ? 'bg-emerald-500 text-white shadow-inner'
                        : 'bg-background text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600',
                ]
                    .filter(Boolean)
                    .join(' ')}
            >
                <span className="text-base leading-none">{value === 'OK' ? '✓' : '✓'}</span>
                Ya
            </button>
        </div>
    );
}
