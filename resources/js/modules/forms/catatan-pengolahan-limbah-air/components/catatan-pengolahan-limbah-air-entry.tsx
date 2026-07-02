import { ArrowLeft, ClipboardCheck, Droplets, Printer } from 'lucide-react';

import * as React from 'react';

import {
    catatanPengolahanLimbahAirDailyPdf,
    catatanPengolahanLimbahAirIndex,
} from '@/actions/App/Http/Controllers/Web/DashboardController';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CatatanPengolahanLimbahAirEntryPayload } from '@/modules/dashboard/types';
import { CatatanProsesForm } from './catatan-proses-form';
import { ChecklistHarianForm } from './checklist-harian-form';
import type { EntryView } from './entry-form-types';

type CatatanPengolahanLimbahAirEntryProps = {
    flash: {
        success?: string | null;
        error?: string | null;
    };
    entryForm: CatatanPengolahanLimbahAirEntryPayload;
    userId: string;
};

export function CatatanPengolahanLimbahAirEntry({ flash, entryForm, userId }: CatatanPengolahanLimbahAirEntryProps) {
    const [activeView, setActiveView] = React.useState<EntryView>('CHECKLIST');
    const checklistProgress = `${entryForm.checklist.items.filter((item) => item.status !== null && item.status !== '').length}/${entryForm.checklist.items.length}`;
    const processTotalItems = entryForm.process.sections.reduce((total, section) => total + section.items.length, 0);
    const processFilledItems = entryForm.process.sections
        .flatMap((section) => section.items)
        .filter((item) => item.value_number !== null || (item.value_text ?? '').trim() !== '').length;

    return (
        <div className="print-content min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(var(--muted))_0%,hsl(var(--background))_50%)] px-4 py-6 lg:px-6 lg:py-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-6">
                <Card className="border-none bg-[linear-gradient(135deg,hsl(var(--background))_0%,hsl(var(--muted))_100%)] shadow-sm ring-1 ring-border/60 print:hidden">
                    <CardHeader className="gap-4">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div className="space-y-2">
                                <Badge variant="outline">Workspace Harian IPAL</Badge>
                                <CardTitle className="text-2xl">{entryForm.module.title}</CardTitle>
                                <CardDescription>{entryForm.module.subtitle}</CardDescription>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge variant="outline">Tanggal {entryForm.entry.tanggal}</Badge>
                                <Badge variant={entryForm.entry.read_only ? 'secondary' : 'default'}>
                                    {entryForm.entry.read_only ? 'Mode Lihat' : 'Mode Input'}
                                </Badge>
                                <Button
                                    variant="outline"
                                    render={
                                        <a
                                            href={catatanPengolahanLimbahAirIndex.url({
                                                query: {
                                                    user_id: userId,
                                                    year: Number(entryForm.entry.tanggal.slice(0, 4)),
                                                },
                                            })}
                                        />
                                    }
                                >
                                    <ArrowLeft className="size-4" />
                                    Kembali ke Listing
                                </Button>
                                {entryForm.entry.read_only && entryForm.entry.log_id ? (
                                    <Button
                                        variant="outline"
                                        className="no-print"
                                        render={
                                            <a
                                                href={catatanPengolahanLimbahAirDailyPdf.url(
                                                    { log: entryForm.entry.log_id },
                                                    { query: { user_id: userId } },
                                                )}
                                                target="_blank"
                                                rel="noreferrer"
                                            />
                                        }
                                    >
                                        <Printer className="size-4" />
                                        Print PDF
                                    </Button>
                                ) : null}
                            </div>
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

                <Card className="border-none shadow-sm ring-1 ring-border/60 print:hidden">
                    <CardHeader>
                        <CardTitle className="text-base">Pilih Form yang Ingin Diisi</CardTitle>
                        <CardDescription>
                            Checklist dipisah dari catatan proses. Batch mixing tetap berada di dalam catatan proses sesuai form fisik.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-2">
                            <button
                                type="button"
                                onClick={() => setActiveView('CHECKLIST')}
                                className={`rounded-xl border p-4 text-left transition ${
                                    activeView === 'CHECKLIST' ? 'border-primary bg-primary/5' : 'border-border/70 hover:border-border'
                                }`}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <ClipboardCheck className="size-4 text-primary" />
                                        <p className="font-semibold">Form Checklist Harian</p>
                                    </div>
                                    <Badge variant="outline">{checklistProgress}</Badge>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">Status perlengkapan harian yang menjadi rekap bulanan.</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveView('PROCESS')}
                                className={`rounded-xl border p-4 text-left transition ${
                                    activeView === 'PROCESS' ? 'border-primary bg-primary/5' : 'border-border/70 hover:border-border'
                                }`}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <Droplets className="size-4 text-primary" />
                                        <p className="font-semibold">Form Catatan Process + Batch Mixing</p>
                                    </div>
                                    <Badge variant="outline">
                                        {processFilledItems}/{processTotalItems}
                                    </Badge>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">Catatan proses harian dengan batch mixing opsional.</p>
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {activeView === 'CHECKLIST' ? <ChecklistHarianForm entryForm={entryForm} userId={userId} /> : null}
                {activeView === 'PROCESS' ? <CatatanProsesForm entryForm={entryForm} userId={userId} /> : null}
            </div>
        </div>
    );
}
