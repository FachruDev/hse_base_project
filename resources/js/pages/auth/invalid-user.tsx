import { Head, usePage } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { PageProps } from '@/types';

type InvalidUserPageProps = PageProps<{
    message: string;
    hint: string;
    requested_user_id?: string | null;
}>;

export default function InvalidUserPage() {
    const { message, hint, requested_user_id } = usePage<InvalidUserPageProps>().props;

    return (
        <>
            <Head title="Akses Tidak Valid" />

            <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_hsl(var(--muted))_0%,_hsl(var(--background))_45%)] px-4 py-10 text-foreground sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-4xl flex-col gap-6">
                    <Badge variant="outline" className="w-fit gap-2">
                        <ShieldAlert className="size-3.5" />
                        Akses Web App
                    </Badge>

                    <Card className="overflow-hidden border-none bg-[linear-gradient(135deg,hsl(var(--background))_0%,hsl(var(--muted))_100%)] shadow-sm ring-1 ring-border/60">
                        <CardHeader className="gap-3">
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                                <AlertTriangle className="size-6" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Akses dashboard tidak dapat dibuka</CardTitle>
                                <CardDescription className="mt-1 max-w-2xl text-sm">
                                    Halaman ini sengaja ditampilkan agar integrasi iframe tidak berhenti di layar putih atau respons JSON mentah.
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-[1.3fr_0.7fr]">
                            <div className="space-y-4">
                                <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Masalah</p>
                                    <p className="mt-2 text-sm">{message}</p>
                                </div>

                                <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Petunjuk</p>
                                    <p className="mt-2 text-sm">{hint}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">User ID diterima</p>
                                    <p className="mt-2 text-sm font-medium">{requested_user_id || '-'}</p>
                                </div>

                                <div className="rounded-2xl border border-dashed border-border bg-background/50 p-4">
                                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Contoh URL</p>
                                    <code className="mt-2 block text-xs">/dashboard?user_id=irvan.m</code>
                                </div>

                                <Button className="w-full" onClick={() => (window.location.href = '/')}>
                                    Kembali ke halaman awal
                                    <ArrowRight className="size-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </>
    );
}
