import { useForm } from '@inertiajs/react';
import { CheckCheck, Save } from 'lucide-react';
import * as React from 'react';

import { catatanPengolahanLimbahAirSaveChecklist } from '@/actions/App/Http/Controllers/Web/DashboardController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import type { CatatanPengolahanLimbahAirEntryPayload } from '@/modules/dashboard/types';
import type { ChecklistFormState, ChecklistStatus } from './entry-form-types';
import { normalizeChecklistStatus } from './entry-form-types';

type ChecklistHarianFormProps = {
    entryForm: CatatanPengolahanLimbahAirEntryPayload;
    userId: string;
};

export function ChecklistHarianForm({ entryForm, userId }: ChecklistHarianFormProps) {
    const form = useForm<ChecklistFormState>({
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
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setChecklistAllStatus(form, 'OK')}
                            disabled={readOnly || form.data.checklist.values.length === 0}
                        >
                            <CheckCheck className="size-4" />
                            Checklist Semua Berfungsi
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => clearChecklistAll(form)}
                            disabled={readOnly || form.data.checklist.values.length === 0}
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
                                            value={form.data.checklist.values[index]?.status ?? ''}
                                            onValueChange={(value) => {
                                                const nextStatus = (value ?? '') as ChecklistStatus;
                                                form.setData('checklist', {
                                                    ...form.data.checklist,
                                                    values: form.data.checklist.values.map((valueItem, valueIndex) =>
                                                        valueIndex === index ? { ...valueItem, status: nextStatus } : valueItem,
                                                    ),
                                                });
                                            }}
                                            disabled={readOnly}
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
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {!readOnly ? (
                        <div className="flex justify-end p-4">
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

function setChecklistAllStatus(form: ReturnType<typeof useForm<ChecklistFormState>>, status: 'OK' | 'NOT_OK'): void {
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
