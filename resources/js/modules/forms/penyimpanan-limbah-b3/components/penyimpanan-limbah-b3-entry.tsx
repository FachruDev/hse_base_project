import { useForm } from '@inertiajs/react';
import { ArrowLeft, Save, ShieldCheck } from 'lucide-react';
import * as React from 'react';
import { showAlert } from '@/lib/sweetalert';

import { b3StorageIndex, b3StorageStore } from '@/actions/App/Http/Controllers/Web/DashboardController';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

const SELF_INITIATOR_VALUE = '__SELF__';

export function PenyimpananLimbahB3Entry({ flash, entryForm, userId }: PenyimpananLimbahB3EntryProps) {
    const [wasteTypeSelection, setWasteTypeSelection] = React.useState<string>('');
    const [initiatorSelection, setInitiatorSelection] = React.useState<string>('');
    const [verificationOpen, setVerificationOpen] = React.useState(false);
    const [selectedInitiatorUser, setSelectedInitiatorUser] = React.useState<string>(SELF_INITIATOR_VALUE);
    const canSelectInitiatorUser = entryForm.capabilities.select_initiator_user;

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
    const initiatorUserItems = [
        {
            value: SELF_INITIATOR_VALUE,
            label: `${entryForm.entry.operator.external_id} - ${entryForm.entry.operator.name}${entryForm.entry.operator.email ? ` (${entryForm.entry.operator.email})` : ''}`,
        },
        ...entryForm.options.initiator_users
            .filter((item) => item.external_id !== entryForm.entry.operator.external_id)
            .map((item) => ({
                value: item.external_id,
                label: item.label,
            })),
    ];
    const selectedInitiatorDetail =
        selectedInitiatorUser === SELF_INITIATOR_VALUE
            ? {
                  external_id: entryForm.entry.operator.external_id,
                  name: entryForm.entry.operator.name,
                  email: entryForm.entry.operator.email,
                  department_name: entryForm.entry.operator.department_name,
              }
            : entryForm.options.initiator_users.find((item) => item.external_id === selectedInitiatorUser);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (canSelectInitiatorUser) {
            setVerificationOpen(true);

            return;
        }

        handleConfirmSubmit();
    };

    const handleConfirmSubmit = () => {
        form.transform((data) => ({
            ...data,
            initiator_user_external_id: selectedInitiatorUser === SELF_INITIATOR_VALUE ? '' : selectedInitiatorUser,
        }));

        form.post(b3StorageStore.url({ query: { user_id: userId } }), {
            preserveScroll: true,
            onSuccess: () => {
                setVerificationOpen(false);
                showAlert({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Data limbah B3 berhasil disimpan!',
                    timer: 2000,
                    showConfirmButton: false,
                });
            },
            onError: () => {
                if (canSelectInitiatorUser) {
                    setVerificationOpen(true);
                }

                showAlert({
                    icon: 'error',
                    title: 'Gagal Menyimpan',
                    text: 'Terdapat kesalahan pada isian form Anda.',
                    confirmButtonText: 'Tutup',
                });
            },
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
                            {entryForm.capabilities.view_monthly_report ? (
                                <Button variant="outline" render={<a href={b3StorageIndex.url({ query: { user_id: userId } })} />}>
                                    <ArrowLeft className="size-4" />
                                    Kembali ke Listing
                                </Button>
                            ) : null}
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
            {canSelectInitiatorUser ? (
                <Dialog open={verificationOpen} onOpenChange={setVerificationOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Verifikasi Petugas Dept. Inisiator</DialogTitle>
                        <DialogDescription>
                            Pilih petugas yang memberi paraf digital. Jika tidak ada petugas lain, gunakan akun operator TPS LB3.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Field>
                            <FieldLabel htmlFor="initiator_user_external_id">Petugas Dept. Inisiator</FieldLabel>
                            <FieldContent>
                                <Select
                                    items={initiatorUserItems}
                                    value={selectedInitiatorUser}
                                    onValueChange={(value) => setSelectedInitiatorUser(value ?? SELF_INITIATOR_VALUE)}
                                >
                                    <SelectTrigger id="initiator_user_external_id" className="w-full">
                                        <SelectValue placeholder="Pilih petugas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={SELF_INITIATOR_VALUE}>
                                            {entryForm.entry.operator.external_id} - {entryForm.entry.operator.name}
                                            {entryForm.entry.operator.email ? ` (${entryForm.entry.operator.email})` : ''}
                                        </SelectItem>
                                        {entryForm.options.initiator_users
                                            .filter((item) => item.external_id !== entryForm.entry.operator.external_id)
                                            .map((item) => (
                                                <SelectItem key={item.external_id} value={item.external_id}>
                                                    {item.external_id} - {item.name}
                                                    {item.email ? ` (${item.email})` : ''}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                                <FieldError>{form.errors.initiator_user_external_id}</FieldError>
                            </FieldContent>
                        </Field>
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-100">
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="mt-0.5 size-5 shrink-0" />
                                <div className="space-y-1 text-sm">
                                    <p className="font-semibold">{selectedInitiatorDetail?.name ?? 'Petugas belum dipilih'}</p>
                                    <p className="text-xs">
                                        {selectedInitiatorDetail?.external_id ?? '-'}
                                        {selectedInitiatorDetail?.email ? ` - ${selectedInitiatorDetail.email}` : ''}
                                    </p>
                                    <p className="text-xs">Dept: {selectedInitiatorDetail?.department_name ?? '-'}</p>
                                    <Badge variant="outline" className="border-emerald-300 bg-white/60 text-emerald-900">
                                        Terverifikasi Sistem
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setVerificationOpen(false)} disabled={form.processing}>
                            Batal
                        </Button>
                        <Button type="button" onClick={handleConfirmSubmit} disabled={form.processing}>
                            <Save className="size-4" />
                            Konfirmasi & Simpan
                        </Button>
                    </DialogFooter>
                </DialogContent>
                </Dialog>
            ) : null}
        </div>
    );
}
