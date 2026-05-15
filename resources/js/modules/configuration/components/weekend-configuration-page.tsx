import { router } from '@inertiajs/react';
import { CalendarCog, Save } from 'lucide-react';
import * as React from 'react';

import { weekendUpdate } from '@/actions/App/Http/Controllers/Web/ConfigurationController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { WeekendConfigurationPayload } from '@/modules/configuration/types';

type WeekendConfigurationPageProps = {
    weekendConfiguration: WeekendConfigurationPayload;
    userId: string;
};

export function WeekendConfigurationPage({ weekendConfiguration, userId }: WeekendConfigurationPageProps) {
    const [draftStates, setDraftStates] = React.useState<Record<number, boolean>>(
        Object.fromEntries(weekendConfiguration.rows.map((row) => [row.id, row.is_off])),
    );

    React.useEffect(() => {
        setDraftStates(Object.fromEntries(weekendConfiguration.rows.map((row) => [row.id, row.is_off])));
    }, [weekendConfiguration.rows]);

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(var(--muted))_0%,hsl(var(--background))_48%)] px-4 py-6 lg:px-6 lg:py-8">
            <div className="mx-auto flex max-w-5xl flex-col gap-6">
                <Card className="border-none bg-[linear-gradient(135deg,hsl(var(--background))_0%,hsl(var(--muted))_100%)] shadow-sm ring-1 ring-border/60">
                    <CardHeader className="gap-3">
                        <Badge variant="outline" className="w-fit">Configurasi</Badge>
                        <CardTitle className="text-2xl">{weekendConfiguration.module.title}</CardTitle>
                        <CardDescription>{weekendConfiguration.module.description}</CardDescription>
                    </CardHeader>
                </Card>

                <Card className="border-none shadow-sm ring-1 ring-border/60">
                    <CardHeader>
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <CalendarCog className="size-4 text-primary" />
                                <CardTitle className="text-base">Pengaturan Hari Libur Mingguan</CardTitle>
                            </div>
                            <Badge variant={weekendConfiguration.capabilities.manage ? 'secondary' : 'outline'}>
                                {weekendConfiguration.capabilities.manage ? 'Bisa Kelola' : 'View Only'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="px-4">Hari</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="px-4 text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {weekendConfiguration.rows.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell className="px-4 font-medium">
                                            {row.day_name}
                                        </TableCell>
                                        <TableCell>
                                            {weekendConfiguration.capabilities.manage ? (
                                                <Select
                                                    items={[
                                                        { value: 'ON', label: 'Operasional' },
                                                        { value: 'OFF', label: 'Libur' },
                                                    ]}
                                                    value={draftStates[row.id] ? 'OFF' : 'ON'}
                                                    onValueChange={(value) => {
                                                        setDraftStates((current) => ({
                                                            ...current,
                                                            [row.id]: value === 'OFF',
                                                        }));
                                                    }}
                                                >
                                                    <SelectTrigger className="w-[180px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="ON">Operasional</SelectItem>
                                                        <SelectItem value="OFF">Libur</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Badge variant={row.is_off ? 'destructive' : 'secondary'}>
                                                    {row.is_off ? 'Libur' : 'Operasional'}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-4 text-right">
                                            {weekendConfiguration.capabilities.manage ? (
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        router.patch(
                                                            weekendUpdate.url(
                                                                { operationalWeekday: row.id },
                                                                { query: { user_id: userId } },
                                                            ),
                                                            { is_off: draftStates[row.id] },
                                                            { preserveScroll: true },
                                                        );
                                                    }}
                                                >
                                                    <Save className="size-4" />
                                                    Simpan
                                                </Button>
                                            ) : null}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
