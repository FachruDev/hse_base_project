import { ArrowLeft, ClipboardCheck, Droplets } from 'lucide-react';
import * as React from 'react';

import { catatanPengolahanLimbahAirIndex } from '@/actions/App/Http/Controllers/Web/DashboardController';
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
        <div className="min-h-screen bg-slate-50/50 pb-12 pt-6 dark:bg-background px-4 lg:px-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:gap-8">
                
                {/* HEADER CARD */}
                <Card className="relative overflow-hidden border-border/50 shadow-sm">
                    {/* Decorative Top Accent Line */}
                    <div className="absolute inset-x-0 top-0 h-1.5 bg-primary" />
                    
                    <CardHeader className="gap-6 pb-6 pt-8">
                        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none">
                                        Workspace Harian IPAL
                                    </Badge>
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                                        {entryForm.module.title}
                                    </CardTitle>
                                    <CardDescription className="mt-1.5 text-base text-muted-foreground/80">
                                        {entryForm.module.subtitle}
                                    </CardDescription>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3 xl:justify-end">
                                <Badge variant="outline" className="px-3 py-1.5 text-sm font-medium bg-background shadow-sm">
                                    Tanggal {entryForm.entry.tanggal}
                                </Badge>
                                <Badge 
                                    variant={entryForm.entry.read_only ? 'secondary' : 'default'}
                                    className="px-3 py-1.5 text-sm font-medium shadow-sm"
                                >
                                    {entryForm.entry.read_only ? 'Mode Lihat' : 'Mode Input'}
                                </Badge>
                                <Button
                                    variant="outline"
                                    className="shadow-sm transition-all hover:bg-muted"
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
                                    <ArrowLeft className="mr-2 size-4" />
                                    Kembali ke Listing
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* FLASH MESSAGES */}
                {flash.success ? (
                    <Alert className="border-green-500/20 bg-green-50/50 text-green-800 dark:bg-green-500/10 dark:text-green-400 shadow-sm">
                        <AlertTitle className="text-green-800 dark:text-green-400">Berhasil</AlertTitle>
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                ) : null}

                {flash.error ? (
                    <Alert variant="destructive" className="shadow-sm">
                        <AlertTitle>Gagal</AlertTitle>
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                ) : null}

                {/* SELECTION TABS / CARDS */}
                <Card className="border-border/50 shadow-sm">
                    <CardHeader className="pb-5">
                        <CardTitle className="text-lg font-semibold text-foreground">Pilih Form yang Ingin Diisi</CardTitle>
                        <CardDescription>
                            Checklist dipisah dari catatan proses. Batch mixing tetap berada di dalam catatan proses sesuai form fisik.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* BUTTON CHECKLIST */}
                            <button
                                type="button"
                                onClick={() => setActiveView('CHECKLIST')}
                                className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border p-5 text-left transition-all duration-200 ${
                                    activeView === 'CHECKLIST' 
                                        ? 'border-primary ring-1 ring-primary bg-primary/[0.03] shadow-md dark:bg-primary/10' 
                                        : 'border-border/60 bg-card hover:border-primary/40 hover:shadow-sm hover:bg-muted/40'
                                }`}
                            >
                                <div className="flex w-full items-start justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`rounded-lg p-2.5 transition-colors ${
                                            activeView === 'CHECKLIST' 
                                                ? 'bg-primary text-primary-foreground' 
                                                : 'bg-primary/10 text-primary group-hover:bg-primary/20'
                                        }`}>
                                            <ClipboardCheck className="size-5" />
                                        </div>
                                        <div>
                                            <p className={`font-semibold tracking-tight ${
                                                activeView === 'CHECKLIST' ? 'text-foreground' : 'text-foreground/80 group-hover:text-foreground'
                                            }`}>
                                                Form Checklist Harian
                                            </p>
                                            <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                                                Status perlengkapan harian (rekap bulanan).
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={activeView === 'CHECKLIST' ? 'default' : 'secondary'} className="shrink-0 font-mono shadow-sm">
                                        {checklistProgress}
                                    </Badge>
                                </div>
                            </button>

                            {/* BUTTON PROCESS */}
                            <button
                                type="button"
                                onClick={() => setActiveView('PROCESS')}
                                className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border p-5 text-left transition-all duration-200 ${
                                    activeView === 'PROCESS' 
                                        ? 'border-primary ring-1 ring-primary bg-primary/[0.03] shadow-md dark:bg-primary/10' 
                                        : 'border-border/60 bg-card hover:border-primary/40 hover:shadow-sm hover:bg-muted/40'
                                }`}
                            >
                                <div className="flex w-full items-start justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`rounded-lg p-2.5 transition-colors ${
                                            activeView === 'PROCESS' 
                                                ? 'bg-primary text-primary-foreground' 
                                                : 'bg-primary/10 text-primary group-hover:bg-primary/20'
                                        }`}>
                                            <Droplets className="size-5" />
                                        </div>
                                        <div>
                                            <p className={`font-semibold tracking-tight ${
                                                activeView === 'PROCESS' ? 'text-foreground' : 'text-foreground/80 group-hover:text-foreground'
                                            }`}>
                                                Form Catatan Process
                                            </p>
                                            <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                                                Catatan proses dengan batch mixing.
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={activeView === 'PROCESS' ? 'default' : 'secondary'} className="shrink-0 font-mono shadow-sm">
                                        {processFilledItems}/{processTotalItems}
                                    </Badge>
                                </div>
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {/* DYNAMIC FORMS (No changes here) */}
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {activeView === 'CHECKLIST' ? <ChecklistHarianForm entryForm={entryForm} userId={userId} /> : null}
                    {activeView === 'PROCESS' ? <CatatanProsesForm entryForm={entryForm} userId={userId} /> : null}
                </div>
            </div>
        </div>
    );
}