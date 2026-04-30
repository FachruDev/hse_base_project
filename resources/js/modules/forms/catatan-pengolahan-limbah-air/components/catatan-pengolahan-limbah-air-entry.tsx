import { ArrowLeft, CircleAlert, ClipboardCheck, Droplets, FlaskConical, Save } from 'lucide-react';

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
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <ClipboardCheck className="size-4 text-primary" />
                            <CardTitle className="text-base">Checklist Harian</CardTitle>
                        </div>
                        <CardDescription>{entryForm.checklist.template_name ?? 'Template checklist belum tersedia'}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="px-4">Item</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead>Kondisi Standar</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="px-4">Catatan</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {entryForm.checklist.items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="px-4 font-medium">{item.name}</TableCell>
                                        <TableCell>{item.category ?? '-'}</TableCell>
                                        <TableCell>{item.standard_condition ?? '-'}</TableCell>
                                        <TableCell>
                                            {entryForm.entry.read_only ? (
                                                <Badge variant={item.status === 'NOT_OK' ? 'destructive' : 'outline'}>{item.status ?? '-'}</Badge>
                                            ) : (
                                                <Select defaultValue={item.status ?? undefined}>
                                                    <SelectTrigger className="w-full min-w-[140px]">
                                                        <SelectValue placeholder="Pilih status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="OK">OK</SelectItem>
                                                        <SelectItem value="NOT_OK">NOT_OK</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-4">
                                            <Textarea defaultValue={item.note ?? ''} readOnly={entryForm.entry.read_only} className="min-h-14" />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm ring-1 ring-border/60">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Droplets className="size-4 text-primary" />
                            <CardTitle className="text-base">Catatan Proses</CardTitle>
                        </div>
                        <CardDescription>{entryForm.process.template_name ?? 'Template proses belum tersedia'}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {entryForm.process.sections.map((section) => (
                            <div key={section.id} className="rounded-2xl border border-border/60 p-4">
                                <div className="mb-4 flex items-center justify-between gap-3">
                                    <h3 className="text-sm font-semibold">{section.name}</h3>
                                    <Badge variant="outline">{section.items.length} parameter</Badge>
                                </div>
                                <div className="grid gap-4 lg:grid-cols-2">
                                    {section.items.map((item) => (
                                        <div key={item.id} className="rounded-xl border border-border/60 bg-muted/20 p-4">
                                            <div className="space-y-1">
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-xs text-muted-foreground">{item.standard_condition ?? 'Tidak ada kondisi standar'}</p>
                                            </div>
                                            <div className="mt-4 grid gap-3">
                                                {item.input_type === 'number' ? (
                                                    <Input type="number" defaultValue={item.value_number ?? ''} readOnly={entryForm.entry.read_only} />
                                                ) : (
                                                    <Input defaultValue={item.value_text ?? ''} readOnly={entryForm.entry.read_only} />
                                                )}
                                                <Textarea defaultValue={item.note ?? ''} readOnly={entryForm.entry.read_only} placeholder="Catatan tambahan" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm ring-1 ring-border/60">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <FlaskConical className="size-4 text-primary" />
                            <CardTitle className="text-base">Batch Mixing</CardTitle>
                        </div>
                        <CardDescription>Batch di bawah ini mengikuti item batch yang aktif di master data.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 xl:grid-cols-2">
                        {entryForm.batch.groups.map((group) => (
                            <div key={group.batch_no} className="rounded-2xl border border-border/60 p-4">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold">Batch {group.batch_no}</h3>
                                    <Badge variant="outline">{group.values.length} item</Badge>
                                </div>
                                <div className="grid gap-3">
                                    {group.values.map((value) => {
                                        const item = findBatchItem(entryForm.batch.items, value.item_id);

                                        return (
                                            <div key={`${group.batch_no}-${value.item_id}`} className="grid gap-2 rounded-xl border border-border/60 bg-muted/20 p-3">
                                                <div>
                                                    <p className="font-medium">{item?.name ?? `Item ${value.item_id}`}</p>
                                                    <p className="text-xs text-muted-foreground">{item?.input_type ?? 'text'}</p>
                                                </div>
                                                {item?.input_type === 'number' ? (
                                                    <Input type="number" defaultValue={value.value_number ?? ''} readOnly={entryForm.entry.read_only} />
                                                ) : (
                                                    <Input defaultValue={value.value_text ?? ''} readOnly={entryForm.entry.read_only} />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
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
