import { useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import * as React from 'react';
import { showAlert } from '@/lib/sweetalert';

import { b3StorageIndex, b3StorageStore } from '@/actions/App/Http/Controllers/Web/DashboardController';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { B3StorageEntryPayload } from '@/modules/dashboard/types';

type PenyimpananLimbahB3EntryProps = {
    flash: {
        success?: string | null;
        error?: string | null;
    };
    entryForm: B3StorageEntryPayload;
    userId: string;
};

type B3FormState = {
    movement_date: string;
    movement_time: string;
    movement_type: string;
    waste_type_id: number | null;
    waste_type_other: string;
    initiator_department_id: number | null;
    initiator_department_other: string;
    initiator_user_external_id: string;
    weight_kg: string;
    document_number: string;
    photo: File | null;
    note: string;
};

export function PenyimpananLimbahB3Entry({ flash, entryForm, userId }: PenyimpananLimbahB3EntryProps) {
    const [wasteTypeSelection, setWasteTypeSelection] = React.useState<string>('');
    const [initiatorSelection, setInitiatorSelection] = React.useState<string>('');

    const form = useForm<B3FormState>({
        movement_date: entryForm.entry.tanggal_default,
        movement_time: entryForm.entry.jam_default,
        movement_type: 'MASUK',
        waste_type_id: null,
        waste_type_other: '',
        initiator_department_id: null,
        initiator_department_other: '',
        initiator_user_external_id: '',
        weight_kg: '',
        document_number: '',
        photo: null,
        note: '',
    });

    const movementTypeItems = entryForm.options.movement_types.map((item) => ({
        value: String(item.value),
        label: item.label,
    }));
    const wasteTypeItems = [
        { value: 'OTHER', label: 'Yang lain' },
        ...entryForm.options.waste_types.map((item) => ({
            value: String(item.value),
            label: item.label,
        })),
    ];
    const initiatorItems = [
        { value: 'OTHER', label: 'Yang lain' },
        ...entryForm.options.initiator_departments.map((item) => ({
            value: String(item.value),
            label: item.label,
        })),
    ];

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.post(b3StorageStore.url({ query: { user_id: userId } }), {
            preserveScroll: true,
            onSuccess: () => {
                showAlert({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Data limbah B3 berhasil disimpan!',
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
            }
        });
    };

    return (
        <div className="min-h-screen bg-muted dark:bg-background px-4 py-6 lg:px-6 lg:py-8">
            <div className="mx-auto flex max-w-5xl flex-col gap-6">
                <Card className="border-none bg-[linear-gradient(135deg,hsl(var(--background))_0%,hsl(var(--muted))_100%)] shadow-sm ring-1 ring-border/60">
                    <CardHeader className="gap-4">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                            <div className="space-y-2">
                                <Badge variant="outline">Input Harian</Badge>
                                <CardTitle className="text-2xl">{entryForm.module.title}</CardTitle>
                                <CardDescription>{entryForm.module.subtitle}</CardDescription>
                            </div>
                            <Button variant="outline" render={<a href={b3StorageIndex.url({ query: { user_id: userId } })} />}>
                                <ArrowLeft className="size-4" />
                                Kembali ke Listing
                            </Button>
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
                        <CardTitle className="text-base">Form Entry B3</CardTitle>
                        <CardDescription>
                            Operator: {entryForm.entry.operator.name} ({entryForm.entry.operator.external_id})
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <FieldGroup className="grid gap-4 md:grid-cols-2">
                                <Field>
                                    <FieldLabel htmlFor="movement_date">
                                        Tanggal <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <FieldContent>
                                        <Input
                                            id="movement_date"
                                            type="date"
                                            value={form.data.movement_date}
                                            onChange={(event) => form.setData('movement_date', event.target.value)}
                                        />
                                        <FieldError>{form.errors.movement_date}</FieldError>
                                    </FieldContent>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="movement_time">Jam</FieldLabel>
                                    <FieldContent>
                                        <Input
                                            id="movement_time"
                                            type="time"
                                            value={form.data.movement_time}
                                            onChange={(event) => form.setData('movement_time', event.target.value)}
                                        />
                                        <FieldError>{form.errors.movement_time}</FieldError>
                                    </FieldContent>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="movement_type">
                                        Tipe Pergerakan <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <FieldContent>
                                        <Select
                                            items={movementTypeItems}
                                            value={form.data.movement_type}
                                            onValueChange={(value) => form.setData('movement_type', value ?? '')}
                                        >
                                            <SelectTrigger id="movement_type" className="w-full">
                                                <SelectValue placeholder="Pilih tipe" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {entryForm.options.movement_types.map((item) => (
                                                    <SelectItem key={String(item.value)} value={String(item.value)}>
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FieldError>{form.errors.movement_type}</FieldError>
                                    </FieldContent>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="document_number">
                                        Nomor Dokumen <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <FieldContent>
                                        <Input
                                            id="document_number"
                                            value={form.data.document_number}
                                            onChange={(event) => form.setData('document_number', event.target.value)}
                                            placeholder="Contoh: 03/HSE/XI/20"
                                        />
                                        <FieldError>{form.errors.document_number}</FieldError>
                                    </FieldContent>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="waste_type_id">Jenis Limbah</FieldLabel>
                                    <FieldContent>
                                        <Select
                                            items={wasteTypeItems}
                                            value={wasteTypeSelection}
                                            onValueChange={(value) => {
                                                const nextValue = value ?? '';
                                                setWasteTypeSelection(nextValue);

                                                if (value === null || value === '') {
                                                    form.setData('waste_type_id', null);
                                                    form.setData('waste_type_other', '');

                                                    return;
                                                }

                                                if (value === 'OTHER') {
                                                    form.setData('waste_type_id', null);

                                                    return;
                                                }

                                                form.setData('waste_type_id', Number(value));
                                                form.setData('waste_type_other', '');
                                            }}
                                        >
                                            <SelectTrigger id="waste_type_id" className="w-full">
                                                <SelectValue placeholder="Pilih jenis limbah" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="OTHER">Yang lain</SelectItem>
                                                {entryForm.options.waste_types.map((item) => (
                                                    <SelectItem key={String(item.value)} value={String(item.value)}>
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FieldError>{form.errors.waste_type_id}</FieldError>
                                    </FieldContent>
                                </Field>
                                {wasteTypeSelection === 'OTHER' ? (
                                    <Field>
                                        <FieldLabel htmlFor="waste_type_other">Jenis Limbah (Yang Lain)</FieldLabel>
                                        <FieldContent>
                                            <Input
                                                id="waste_type_other"
                                                value={form.data.waste_type_other}
                                                onChange={(event) => form.setData('waste_type_other', event.target.value)}
                                            />
                                            <FieldError>{form.errors.waste_type_other}</FieldError>
                                        </FieldContent>
                                    </Field>
                                ) : null}

                                <Field>
                                    <FieldLabel htmlFor="initiator_department_id">Dept Inisiator</FieldLabel>
                                    <FieldContent>
                                        <Select
                                            items={initiatorItems}
                                            value={initiatorSelection}
                                            onValueChange={(value) => {
                                                const nextValue = value ?? '';
                                                setInitiatorSelection(nextValue);

                                                if (value === null || value === '') {
                                                    form.setData('initiator_department_id', null);
                                                    form.setData('initiator_department_other', '');

                                                    return;
                                                }

                                                if (value === 'OTHER') {
                                                    form.setData('initiator_department_id', null);

                                                    return;
                                                }

                                                form.setData('initiator_department_id', Number(value));
                                                form.setData('initiator_department_other', '');
                                            }}
                                        >
                                            <SelectTrigger id="initiator_department_id" className="w-full">
                                                <SelectValue placeholder="Pilih dept inisiator" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="OTHER">Yang lain</SelectItem>
                                                {entryForm.options.initiator_departments.map((item) => (
                                                    <SelectItem key={String(item.value)} value={String(item.value)}>
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FieldError>{form.errors.initiator_department_id}</FieldError>
                                    </FieldContent>
                                </Field>
                                {initiatorSelection === 'OTHER' ? (
                                    <Field>
                                        <FieldLabel htmlFor="initiator_department_other">Dept Inisiator (Yang Lain)</FieldLabel>
                                        <FieldContent>
                                            <Input
                                                id="initiator_department_other"
                                                value={form.data.initiator_department_other}
                                                onChange={(event) => form.setData('initiator_department_other', event.target.value)}
                                            />
                                            <FieldError>{form.errors.initiator_department_other}</FieldError>
                                        </FieldContent>
                                    </Field>
                                ) : null}

                                <Field>
                                    <FieldLabel htmlFor="weight_kg">
                                        Berat Limbah (Kg) <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <FieldContent>
                                        <Input
                                            id="weight_kg"
                                            type="number"
                                            min={0}
                                            step="0.001"
                                            value={form.data.weight_kg}
                                            onChange={(event) => form.setData('weight_kg', event.target.value)}
                                        />
                                        <FieldError>{form.errors.weight_kg}</FieldError>
                                    </FieldContent>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="photo">Foto Bukti</FieldLabel>
                                    <FieldContent>
                                        <Input
                                            id="photo"
                                            type="file"
                                            accept="image/*"
                                            onChange={(event) => form.setData('photo', event.target.files?.[0] ?? null)}
                                        />
                                        <FieldError>{form.errors.photo}</FieldError>
                                    </FieldContent>
                                </Field>
                            </FieldGroup>

                            <Field>
                                <FieldLabel htmlFor="note">Catatan</FieldLabel>
                                <FieldContent>
                                    <Textarea
                                        id="note"
                                        value={form.data.note}
                                        onChange={(event) => form.setData('note', event.target.value)}
                                        placeholder="Catatan tambahan"
                                    />
                                    <FieldError>{form.errors.note}</FieldError>
                                </FieldContent>
                            </Field>

                            <div className="rounded-lg border border-border/60 bg-muted/30 p-4 space-y-3">
                                <div>
                                    <p className="text-sm font-medium">Petugas Dept. Inisiator</p>
                                    <p className="text-xs text-muted-foreground">
                                        Kosongkan jika tidak ada petugas inisiator dari dept lain
                                    </p>
                                </div>
                                <Field>
                                    <FieldLabel htmlFor="initiator_user_external_id">ID Petugas Dept. Inisiator</FieldLabel>
                                    <FieldContent>
                                        <Input
                                            id="initiator_user_external_id"
                                            value={form.data.initiator_user_external_id}
                                            onChange={(event) =>
                                                form.setData('initiator_user_external_id', event.target.value)
                                            }
                                            placeholder="Masukkan ID petugas..."
                                        />
                                        <FieldError>{form.errors.initiator_user_external_id}</FieldError>
                                    </FieldContent>
                                </Field>
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button type="submit" disabled={form.processing}>
                                    <Save className="size-4" />
                                    Simpan Entri
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
