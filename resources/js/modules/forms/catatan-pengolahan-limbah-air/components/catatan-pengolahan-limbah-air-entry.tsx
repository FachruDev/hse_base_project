import { ArrowLeft, CircleAlert, ClipboardCheck, Droplets, FlaskConical, Save } from 'lucide-react';
import * as React from 'react';

import { catatanPengolahanLimbahAirIndex } from '@/actions/App/Http/Controllers/Web/DashboardController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import type { BatchField, CatatanPengolahanLimbahAirEntryPayload } from '@/modules/dashboard/types';

type CatatanPengolahanLimbahAirEntryProps = {
    entryForm: CatatanPengolahanLimbahAirEntryPayload;
    userId: string;
};

export function CatatanPengolahanLimbahAirEntry({ entryForm, userId }: CatatanPengolahanLimbahAirEntryProps) {
    const [activeSection, setActiveSection] = React.useState<'checklist' | 'process' | 'batch'>('checklist');
    const [activeProcessSectionId, setActiveProcessSectionId] = React.useState<number | null>(
        entryForm.process.sections[0]?.id ?? null,
    );
    const [activeBatchNo, setActiveBatchNo] = React.useState<number>(entryForm.batch.groups[0]?.batch_no ?? 1);

    React.useEffect(() => {
        setActiveProcessSectionId(entryForm.process.sections[0]?.id ?? null);
        setActiveBatchNo(entryForm.batch.groups[0]?.batch_no ?? 1);
    }, [entryForm.process.sections, entryForm.batch.groups]);

    const selectedProcessSection = entryForm.process.sections.find((section) => section.id === activeProcessSectionId) ?? null;
    const selectedBatch = entryForm.batch.groups.find((group) => group.batch_no === activeBatchNo) ?? null;

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(var(--muted))_0%,hsl(var(--background))_48%)] px-4 py-6 lg:px-6 lg:py-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-6">
                <Card className="border-none bg-[linear-gradient(135deg,hsl(var(--background))_0%,hsl(var(--muted))_100%)] shadow-sm ring-1 ring-border/60">
                    <CardHeader className="gap-4">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div className="space-y-2">
                                <Badge variant="outline">Workspace Pengisian</Badge>
                                <CardTitle className="text-2xl">{entryForm.module.title}</CardTitle>
                                <CardDescription>{entryForm.module.subtitle}</CardDescription>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge variant="outline">Tanggal {entryForm.entry.tanggal}</Badge>
                                <Badge variant={entryForm.entry.read_only ? 'secondary' : 'default'}>
                                    {entryForm.entry.read_only ? 'Mode Lihat' : entryForm.entry.action_label}
                                </Badge>
                                <Button variant="outline" render={<a href={catatanPengolahanLimbahAirIndex.url({ query: { user_id: userId } })} />}>
                                    <ArrowLeft className="size-4" />
                                    Kembali ke Listing
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {!entryForm.checklist.template_id || !entryForm.process.template_id ? (
                    <Card className="border-none shadow-sm ring-1 ring-destructive/20">
                        <CardContent className="flex items-start gap-3 p-5 text-sm text-muted-foreground">
                            <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
                            <p>Master form aktif belum lengkap. Halaman pengisian sudah siap, tapi template checklist atau process belum tersedia.</p>
                        </CardContent>
                    </Card>
                ) : null}

                <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                    <Card className="border-none shadow-sm ring-1 ring-border/60">
                        <CardHeader>
                            <CardTitle className="text-base">Informasi Entri</CardTitle>
                            <CardDescription>Metadata operator untuk entri harian ini.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <InfoField label="Operator" value={entryForm.entry.operator.name} />
                            <InfoField label="User ID" value={entryForm.entry.operator.external_id} />
                            <InfoField label="Departemen" value={entryForm.entry.operator.department_name ?? '-'} />
                            <InfoField label="Log ID" value={entryForm.entry.log_id ? `#${entryForm.entry.log_id}` : 'Belum ada'} />
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm ring-1 ring-border/60">
                        <CardHeader>
                            <CardTitle className="text-base">Aksi Form</CardTitle>
                            <CardDescription>UI pengisian sudah disiapkan. Sambungan aksi save/submit ke API bisa dilanjutkan setelah layout disetujui.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-3">
                            <Button disabled={entryForm.entry.read_only || !entryForm.checklist.template_id}>
                                <Save className="size-4" />
                                Simpan Draft
                            </Button>
                            <Button variant="secondary" disabled={entryForm.entry.read_only || !entryForm.process.template_id}>
                                Submit
                            </Button>
                        </CardContent>
                    </Card>
                </section>

                <Card className="border-none shadow-sm ring-1 ring-border/60">
                    <CardHeader className="border-b border-border/60">
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                variant={activeSection === 'checklist' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setActiveSection('checklist')}
                            >
                                <ClipboardCheck className="size-4" />
                                Checklist
                            </Button>
                            <Button
                                variant={activeSection === 'process' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setActiveSection('process')}
                            >
                                <Droplets className="size-4" />
                                Catatan Proses
                            </Button>
                            <Button
                                variant={activeSection === 'batch' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setActiveSection('batch')}
                            >
                                <FlaskConical className="size-4" />
                                Batch
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {activeSection === 'checklist' ? (
                            <div className="p-5">
                                <div className="mb-4">
                                    <h3 className="text-sm font-semibold">Checklist Harian</h3>
                                    <p className="text-xs text-muted-foreground">{entryForm.checklist.template_name ?? 'Template checklist belum tersedia'}</p>
                                </div>
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
                                        {entryForm.checklist.items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="px-4 font-medium">{item.name}</TableCell>
                                                <TableCell>{item.standard_condition ?? '-'}</TableCell>
                                                <TableCell className="min-w-[220px]">
                                                    {entryForm.entry.read_only ? (
                                                        <Badge variant={resolveStatusVariant(item.status)}>
                                                            {resolveStatusLabel(item.status)}
                                                        </Badge>
                                                    ) : (
                                                        <Select defaultValue={item.status ?? undefined}>
                                                            <SelectTrigger className="w-full min-w-[180px]">
                                                                <SelectValue placeholder="Pilih kondisi" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="OK">Sesuai Kondisi Standar</SelectItem>
                                                                <SelectItem value="NOT_OK">Perlu Tindak Lanjut</SelectItem>
                                                                <SelectItem value="NA">Tidak Berlaku (N/A)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-4">
                                                    <Textarea
                                                        defaultValue={item.note ?? ''}
                                                        readOnly={entryForm.entry.read_only}
                                                        className="min-h-14"
                                                        placeholder="Contoh: butuh pengecekan lanjutan"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : null}

                        {activeSection === 'process' ? (
                            <div className="grid gap-4 p-5 xl:grid-cols-[260px_1fr]">
                                <div className="space-y-2">
                                    <h3 className="text-sm font-semibold">Unit Process</h3>
                                    {entryForm.process.sections.map((section) => (
                                        <button
                                            key={section.id}
                                            type="button"
                                            className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                                                activeProcessSectionId === section.id
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'border-border/60 hover:bg-muted/30'
                                            }`}
                                            onClick={() => setActiveProcessSectionId(section.id)}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-medium">{section.name}</span>
                                                <Badge variant="outline">{section.items.length}</Badge>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="rounded-xl border border-border/60">
                                    <div className="border-b border-border/60 px-4 py-3">
                                        <p className="text-sm font-semibold">
                                            {selectedProcessSection?.name ?? 'Pilih Unit Process'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Tampilkan lengkap: Unit Process, Uraian Process, Kondisi Standar, Kondisi, Keterangan.
                                        </p>
                                    </div>
                                    <div className="p-0">
                                        {selectedProcessSection ? (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="px-4">Unit Process</TableHead>
                                                        <TableHead>Uraian Process</TableHead>
                                                        <TableHead>Kondisi Standar</TableHead>
                                                        <TableHead>Kondisi</TableHead>
                                                        <TableHead className="px-4">Keterangan</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {selectedProcessSection.items.map((item) => (
                                                        <TableRow key={item.id}>
                                                            <TableCell className="px-4 font-medium">{selectedProcessSection.name}</TableCell>
                                                            <TableCell>{item.name}</TableCell>
                                                            <TableCell>{item.standard_condition ?? '-'}</TableCell>
                                                            <TableCell className="min-w-[220px]">
                                                                {item.input_type === 'number' ? (
                                                                    <Input
                                                                        type="number"
                                                                        defaultValue={item.value_number ?? ''}
                                                                        readOnly={entryForm.entry.read_only}
                                                                    />
                                                                ) : (
                                                                    <Input
                                                                        defaultValue={item.value_text ?? ''}
                                                                        readOnly={entryForm.entry.read_only}
                                                                    />
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="px-4">
                                                                <Textarea
                                                                    defaultValue={item.note ?? ''}
                                                                    readOnly={entryForm.entry.read_only}
                                                                    placeholder="Keterangan tambahan"
                                                                    className="min-h-14"
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                                Tidak ada unit process aktif.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        {activeSection === 'batch' ? (
                            <div className="p-5">
                                <div className="mb-4 flex flex-wrap gap-2">
                                    {entryForm.batch.groups.map((group) => (
                                        <Button
                                            key={group.batch_no}
                                            variant={activeBatchNo === group.batch_no ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setActiveBatchNo(group.batch_no)}
                                        >
                                            Batch {group.batch_no}
                                        </Button>
                                    ))}
                                </div>

                                {selectedBatch ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="px-4">Uraian</TableHead>
                                                <TableHead>Tipe Input</TableHead>
                                                <TableHead>Nilai</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedBatch.values.map((value) => {
                                                const item = findBatchItem(entryForm.batch.items, value.item_id);

                                                return (
                                                    <TableRow key={`${selectedBatch.batch_no}-${value.item_id}`}>
                                                        <TableCell className="px-4 font-medium">{item?.name ?? `Item ${value.item_id}`}</TableCell>
                                                        <TableCell className="uppercase">{item?.input_type ?? 'text'}</TableCell>
                                                        <TableCell className="min-w-[220px]">
                                                            {item?.input_type === 'number' ? (
                                                                <Input
                                                                    type="number"
                                                                    defaultValue={value.value_number ?? ''}
                                                                    readOnly={entryForm.entry.read_only}
                                                                />
                                                            ) : (
                                                                <Input
                                                                    defaultValue={value.value_text ?? ''}
                                                                    readOnly={entryForm.entry.read_only}
                                                                />
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="rounded-xl border border-dashed border-border/60 px-4 py-8 text-center text-sm text-muted-foreground">
                                        Tidak ada data batch.
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </CardContent>
                </Card>

                <div className="sticky bottom-4 z-20 rounded-2xl border border-border/70 bg-background/95 p-4 shadow-lg backdrop-blur">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-muted-foreground">
                            Aksi utama selalu terlihat agar user tidak perlu scroll panjang.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <Button disabled={entryForm.entry.read_only || !entryForm.checklist.template_id}>
                                <Save className="size-4" />
                                Simpan Draft
                            </Button>
                            <Button variant="secondary" disabled={entryForm.entry.read_only || !entryForm.process.template_id}>
                                Submit
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoField({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
            <p className="mt-2 text-sm font-medium">{value}</p>
        </div>
    );
}

function findBatchItem(items: BatchField[], itemId: number): BatchField | undefined {
    return items.find((item) => item.id === itemId);
}

function resolveStatusLabel(status: string | null): string {
    if (status === 'OK') {
        return 'Sesuai Kondisi Standar';
    }

    if (status === 'NOT_OK') {
        return 'Perlu Tindak Lanjut';
    }

    if (status === 'NA') {
        return 'Tidak Berlaku (N/A)';
    }

    return status ?? '-';
}

function resolveStatusVariant(status: string | null): 'default' | 'secondary' | 'destructive' | 'outline' {
    if (status === 'OK') {
        return 'secondary';
    }

    if (status === 'NOT_OK') {
        return 'destructive';
    }

    if (status === 'NA') {
        return 'outline';
    }

    return 'outline';
}
