import { ClipboardPenLine, FolderKanban, ShieldCheck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardPayload } from '@/modules/dashboard/types';

type DashboardFormWorkspaceProps = {
    dashboard: DashboardPayload;
};

export function DashboardFormWorkspace({ dashboard }: DashboardFormWorkspaceProps) {
    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(var(--muted))_0%,hsl(var(--background))_42%)] px-4 py-6 lg:px-6 lg:py-8">
            <div className="mx-auto flex max-w-6xl flex-col gap-6">
                <section id="dashboard-form" className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
                    <Card className="overflow-hidden border-none bg-[linear-gradient(145deg,hsl(var(--background))_0%,hsl(var(--muted))_100%)] shadow-sm ring-1 ring-border/60">
                        <CardHeader className="gap-3">
                            <Badge variant="outline" className="w-fit gap-2">
                                <ClipboardPenLine className="size-3.5" />
                                Dashboard Form
                            </Badge>
                            <div>
                                <CardTitle className="text-xl">Area Pengisian Form IPAL</CardTitle>
                                <CardDescription className="mt-1 max-w-2xl text-sm">
                                    Seluruh konten lama dashboard dibersihkan. Halaman ini sekarang disiapkan sebagai workspace utama untuk form pengisian yang akan kita bangun berikutnya.
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-3xl border border-dashed border-border/70 bg-background/80 p-6 shadow-sm">
                                <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                                    <div className="space-y-4">
                                        <div className="rounded-2xl bg-muted/50 p-4">
                                            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Operator Aktif</p>
                                            <p className="mt-2 text-lg font-semibold">{dashboard.viewer.name ?? '-'}</p>
                                            <p className="text-sm text-muted-foreground">{dashboard.viewer.external_id ?? '-'}</p>
                                        </div>
                                        <div className="rounded-2xl bg-muted/50 p-4">
                                            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Kesiapan Halaman</p>
                                            <p className="mt-2 text-sm">
                                                Container form, mode terang/gelap, dan sidebar workspace sudah aktif. Tahap berikutnya tinggal memasukkan struktur form IPAL.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex min-h-[380px] items-center justify-center rounded-[2rem] border border-border/70 bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted))_100%)] p-6 text-center">
                                        <div className="max-w-md space-y-3">
                                            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                                <FolderKanban className="size-7" />
                                            </div>
                                            <h2 className="text-xl font-semibold">Canvas Form Siap Diisi</h2>
                                            <p className="text-sm text-muted-foreground">
                                                Di area ini nanti kita pasang form checklist, proses, batch, validasi, serta workflow submit/approval sesuai modul IPAL.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-4">
                        <Card size="sm">
                            <CardHeader>
                                <CardTitle className="text-sm">Management User</CardTitle>
                                <CardDescription>Submenu sidebar akan diarahkan ke area ini saat modul web admin mulai dibangun.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {[
                                    { id: 'management-user', label: 'User' },
                                    { id: 'management-role', label: 'Role' },
                                    { id: 'management-permission', label: 'Permission' },
                                    { id: 'management-departemen', label: 'Departemen' },
                                ].map((item) => (
                                    <div
                                        key={item.id}
                                        id={item.id}
                                        className="rounded-xl border border-border/60 bg-muted/35 px-3 py-3 text-sm"
                                    >
                                        {item.label}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card size="sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <ShieldCheck className="size-4" />
                                    Catatan Implementasi
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                Form utama akan menempati area kiri. Bagian management tetap dipisah sebagai workspace modul admin agar struktur hybrid app ini tetap modular.
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </div>
        </div>
    );
}
