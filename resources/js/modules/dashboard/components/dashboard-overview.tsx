import { ShieldCheck, SlidersHorizontal, Users2, Waves } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { DashboardPayload } from '@/modules/dashboard/types';

type DashboardOverviewProps = {
    dashboard: DashboardPayload;
    permissions: string[];
};

export function DashboardOverview({ dashboard, permissions }: DashboardOverviewProps) {
    const visibleModules = dashboard.moduleSummary.filter((item) => permissions.includes(item.permission));
    const hasAdminAccess = permissions.some((permission) => permission.startsWith('admin.'));
    const hasApprovalAccess = permissions.includes('ipal.logs.approve');

    return (
        <div className="space-y-6 px-4 py-6 lg:px-6">
            <section id="overview" className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
                <Card className="overflow-hidden border-none bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_45%,#334155_100%)] text-white ring-0">
                    <CardHeader>
                        <CardTitle className="text-xl">{dashboard.hero.title}</CardTitle>
                        <CardDescription className="max-w-2xl text-slate-200">{dashboard.hero.subtitle}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-3">
                        {dashboard.stats.map((stat) => (
                            <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-300">{stat.label}</p>
                                <p className="mt-3 text-3xl font-semibold">{stat.value}</p>
                                <p className="mt-2 text-xs text-slate-300">{stat.description}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Profil Sesi</CardTitle>
                        <CardDescription>Dashboard ini hanya muncul jika `user_id` valid dan user aktif.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs">
                        <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                            <span className="text-muted-foreground">User ID</span>
                            <Badge variant="outline">{dashboard.viewer.external_id ?? '-'}</Badge>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                            <span className="text-muted-foreground">Nama</span>
                            <span>{dashboard.viewer.name ?? '-'}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                            <span className="text-muted-foreground">Tanggal</span>
                            <span>{dashboard.hero.today}</span>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <section id="akses-modul" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {visibleModules.length > 0 ? (
                    visibleModules.map((module) => (
                        <Card key={module.title} size="sm">
                            <CardHeader>
                                <CardTitle>{module.title}</CardTitle>
                                <CardDescription>{module.caption}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-semibold">{module.count}</div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card className="md:col-span-2 xl:col-span-4">
                        <CardHeader>
                            <CardTitle>Akses Modul Belum Tersedia</CardTitle>
                            <CardDescription>User aktif, tetapi belum memiliki permission modul yang ditampilkan di dashboard ini.</CardDescription>
                        </CardHeader>
                    </Card>
                )}
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                <Card id="operasi-terkini">
                    <CardHeader>
                        <CardTitle>Log IPAL Terbaru</CardTitle>
                        <CardDescription>Snapshot operasional terbaru untuk peninjauan cepat.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Operator</TableHead>
                                    <TableHead>User ID</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Submitted At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dashboard.latestLogs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell>{log.tanggal ?? '-'}</TableCell>
                                        <TableCell>{log.operator ?? '-'}</TableCell>
                                        <TableCell>{log.operator_external_id ?? '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant={log.status === 'APPROVED' ? 'default' : log.status === 'SUBMITTED' ? 'secondary' : 'outline'}>
                                                {log.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{log.submitted_at ?? '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="grid gap-4">
                    <Card id="approval" size="sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldCheck className="size-4" />
                                Approval Queue
                            </CardTitle>
                            <CardDescription>Visibilitas approval mengikuti permission supervisor.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="rounded-lg bg-muted/40 px-3 py-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Mode Approval</span>
                                    <Badge variant={hasApprovalAccess ? 'default' : 'outline'}>
                                        {hasApprovalAccess ? 'Aktif' : 'Terkunci'}
                                    </Badge>
                                </div>
                            </div>
                            <p className="text-muted-foreground">
                                {hasApprovalAccess
                                    ? 'User ini dapat melihat antrian approval dan menindaklanjuti log yang sudah submitted.'
                                    : 'User ini tidak memiliki permission approval, sehingga area approval hanya ditampilkan sebagai ringkasan.'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card id="administrasi" size="sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users2 className="size-4" />
                                Administrasi Sistem
                            </CardTitle>
                            <CardDescription>Kontrol user, role, dan permission ditentukan dari role backend.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="rounded-lg bg-muted/40 px-3 py-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Akses Admin</span>
                                    <Badge variant={hasAdminAccess ? 'secondary' : 'outline'}>
                                        {hasAdminAccess ? 'Tersedia' : 'Tidak ada'}
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="outline">
                                    <SlidersHorizontal className="size-3" />
                                    Master Data
                                </Badge>
                                <Badge variant="outline">
                                    <Waves className="size-3" />
                                    Hybrid App
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );
}
