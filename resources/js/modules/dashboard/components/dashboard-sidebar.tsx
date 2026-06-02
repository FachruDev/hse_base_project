import {
    Bell,
    ChevronDown,
    ChevronRight,
    LayoutGrid,
    Settings2,
} from 'lucide-react';
import * as React from 'react';

import {
    holidayIndex as configurationHolidayIndex,
    weekendIndex as configurationWeekendIndex,
} from '@/actions/App/Http/Controllers/Web/ConfigurationController';
import {
    b3StorageIndex,
    catatanPengolahanLimbahAirIndex,
    index as dashboardIndex,
} from '@/actions/App/Http/Controllers/Web/DashboardController';
import { index as masterDataIndex } from '@/actions/App/Http/Controllers/Web/MasterDataController';
import { useTheme } from '@/components/theme-provider';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarSeparator,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import {
    configurationNavigation,
    dashboardNavigation,
    formNavigation,
    managementNavigation,
    masterDataNavigation,
} from '@/modules/dashboard/config/navigation';

function useSidebarState(key: string, defaultValue: boolean) {
    const [state, setState] = React.useState<boolean>(() => {
        if (typeof window === 'undefined') {
            return defaultValue;
        }

        const stored = localStorage.getItem(key);

        return stored !== null ? stored === 'true' : defaultValue;
    });

    const updateState = React.useCallback(
        (newState: boolean | ((prevState: boolean) => boolean)) => {
            setState((prev) => {
                const resolvedState =
                    typeof newState === 'function' ? newState(prev) : newState;
                localStorage.setItem(key, String(resolvedState));

                return resolvedState;
            });
        },
        [key]
    );

    return [state, updateState] as const;

}

type DashboardSidebarProps = {
    appName: string;
    permissions: string[];
    roles: string[];
    userId: string;
    userName: string;
    departmentName?: string | null;
};

export function DashboardSidebar({
    appName,
    permissions,
    roles,
    userId,
    userName,
    departmentName,
}: DashboardSidebarProps) {
    // Menggunakan custom hook. Nilai false menjadi default agar sidebar tidak terlalu penuh saat pertama kali dibuka.
    const [managementOpen, setManagementOpen] = useSidebarState('sidebar-management-open', false);
    const [formsOpen, setFormsOpen] = useSidebarState('sidebar-forms-open', false);
    const [masterDataOpen, setMasterDataOpen] = useSidebarState('sidebar-master-open', false);
    const [configurationOpen, setConfigurationOpen] = useSidebarState('sidebar-config-open', false);

    const { theme, setTheme } = useTheme();

    const managementItems = React.useMemo(() => managementNavigation.filter((item) => {
        return (
            item.permission === undefined ||
            permissions.includes(item.permission)
        );
    }), [permissions]);

    const formItems = React.useMemo(() => formNavigation.filter((item) =>
        permissions.includes(item.permission)
    ), [permissions]);

    const masterDataItems = React.useMemo(() => masterDataNavigation.filter((item) =>
        permissions.includes(item.permission)
    ), [permissions]);

    const configurationItems = React.useMemo(() => configurationNavigation.filter((item) =>
        permissions.includes(item.permission)
    ), [permissions]);

    const initials = React.useMemo(() => userName
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(), [userName]);

    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="gap-3">
                <div className="flex items-center justify-between rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-2xl bg-blue-600 text-xs font-semibold text-white shadow-sm">
                            IP
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-sidebar-foreground">
                                {appName}
                            </p>
                            <p className="truncate text-xs text-sidebar-foreground/70">
                                IPAL Workspace
                            </p>
                        </div>
                    </div>
                    <SidebarTrigger className="shrink-0" />
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Workspace</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {dashboardNavigation.map((item) => (
                                <SidebarMenuItem key={item.key}>
                                    <SidebarMenuButton
                                        render={
                                            <a
                                                href={buildWorkspaceHref(
                                                    item.target as any,
                                                    userId,
                                                )}
                                            >
                                                <item.icon />
                                                <span>{item.label}</span>
                                            </a>
                                        }
                                        tooltip={item.label}
                                    />
                                </SidebarMenuItem>
                            ))}

                            {formItems.length > 0 && (
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        tooltip="Form Operasional"
                                        onClick={() => setFormsOpen((current) => !current)}
                                    >
                                        <LayoutGrid className="size-4" />
                                        <span>Form Operasional</span>
                                        <ChevronRight
                                            className={`ml-auto transition-transform ${formsOpen ? 'rotate-90' : ''}`}
                                        />
                                    </SidebarMenuButton>

                                    {formsOpen && (
                                        <SidebarMenuSub>
                                            {formItems.map((item) => (
                                                <SidebarMenuSubItem key={item.key}>
                                                    <SidebarMenuSubButton
                                                        href={buildFormHref(
                                                            item.target as any,
                                                            userId,
                                                        )}
                                                    >
                                                        <item.icon />
                                                        <span>{item.label}</span>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    )}
                                </SidebarMenuItem>
                            )}

                            {masterDataItems.length > 0 && (
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        tooltip="Master Data"
                                        onClick={() => setMasterDataOpen((current) => !current)}
                                    >
                                        <LayoutGrid className="size-4" />
                                        <span>Master Data Form</span>
                                        <ChevronRight
                                            className={`ml-auto transition-transform ${masterDataOpen ? 'rotate-90' : ''}`}
                                        />
                                    </SidebarMenuButton>

                                    {masterDataOpen && (
                                        <SidebarMenuSub>
                                            {masterDataItems.map((item) => (
                                                <SidebarMenuSubItem key={item.key}>
                                                    <SidebarMenuSubButton
                                                        href={buildMasterDataHref(
                                                            item.module,
                                                            userId,
                                                        )}
                                                    >
                                                        <item.icon />
                                                        <span>{item.label}</span>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    )}
                                </SidebarMenuItem>
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="mt-auto">
                    <SidebarGroupLabel>Settings</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {managementItems.length > 0 && (
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        tooltip="Management User"
                                        onClick={() => setManagementOpen((current) => !current)}
                                    >
                                        <Users2Icon />
                                        <span>Management User</span>
                                        <ChevronRight
                                            className={`ml-auto transition-transform ${managementOpen ? 'rotate-90' : ''}`}
                                        />
                                    </SidebarMenuButton>

                                    {managementOpen && (
                                        <SidebarMenuSub>
                                            {managementItems.map((item) => (
                                                <SidebarMenuSubItem key={item.key}>
                                                    <SidebarMenuSubButton
                                                        href={buildDashboardSectionHref(
                                                            item.sectionId,
                                                            userId,
                                                        )}
                                                    >
                                                        <item.icon />
                                                        <span>{item.label}</span>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    )}
                                </SidebarMenuItem>
                            )}

                            {configurationItems.length > 0 && (
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        tooltip="Konfigurasi"
                                        onClick={() => setConfigurationOpen((current) => !current)}
                                    >
                                        <LayoutGrid className="size-4" />
                                        <span>Konfigurasi</span>
                                        <ChevronRight
                                            className={`ml-auto transition-transform ${configurationOpen ? 'rotate-90' : ''}`}
                                        />
                                    </SidebarMenuButton>

                                    {configurationOpen && (
                                        <SidebarMenuSub>
                                            {configurationItems.map((item) => (
                                                <SidebarMenuSubItem key={item.key}>
                                                    <SidebarMenuSubButton
                                                        href={buildConfigurationHref(
                                                            item.target as any,
                                                            userId,
                                                        )}
                                                    >
                                                        <item.icon />
                                                        <span>{item.label}</span>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    )}
                                </SidebarMenuItem>
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarSeparator />

            <SidebarFooter>
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <Button
                                variant="ghost"
                                className="h-auto w-full justify-start rounded-xl border border-sidebar-border bg-sidebar-accent/35 px-3 py-3"
                            />
                        }
                    >
                        <Avatar size="sm">
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1 text-left">
                            <p className="truncate text-xs font-medium text-sidebar-foreground">
                                {userName}
                            </p>
                            <p className="truncate text-[11px] text-sidebar-foreground/70">
                                {userId}
                            </p>
                        </div>
                        <ChevronDown className="size-4 shrink-0 text-sidebar-foreground/70" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-64">
                        <DropdownMenuGroup>
                            <div className="flex items-center gap-3 px-2 py-2">
                                <Avatar size="lg">
                                    <AvatarFallback>{initials}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">
                                        {userName}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {departmentName ?? userId}
                                    </p>
                                </div>
                            </div>
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator />

                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <LayoutGrid className="size-4" />
                                <span>Informasi Akun</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Settings2 className="size-4" />
                                <span>Setting</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setTheme(nextTheme)}
                            >
                                <LayoutGrid className="size-4" />
                                <span>
                                    {nextTheme === 'dark'
                                        ? 'Ubah ke mode gelap'
                                        : 'Ubah ke mode terang'}
                                </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Bell className="size-4" />
                                <span>Notifikasi</span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator />

                        <div className="flex items-center justify-between px-2 py-1.5">
                            <span className="text-xs text-muted-foreground">
                                Role aktif
                            </span>
                            <Badge variant="outline">
                                {roles[0] ?? 'user'}
                            </Badge>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarFooter>
        </Sidebar>
    );
}

function buildWorkspaceHref(
    target: 'dashboard' | 'catatan-pengolahan-limbah-air',
    userId: string,
): string {
    if (target === 'catatan-pengolahan-limbah-air') {
        return catatanPengolahanLimbahAirIndex.url({
            query: { user_id: userId },
        });
    }

    return dashboardIndex.url({ query: { user_id: userId } });
}

function buildFormHref(
    target: 'catatan-pengolahan-limbah-air' | 'penyimpanan-limbah-b3',
    userId: string,
): string {
    if (target === 'catatan-pengolahan-limbah-air') {
        return catatanPengolahanLimbahAirIndex.url({
            query: { user_id: userId },
        });
    }

    return b3StorageIndex.url({ query: { user_id: userId } });
}

function buildMasterDataHref(module: string, userId: string): string {
    return masterDataIndex.url(module, { query: { user_id: userId } });
}

function buildDashboardSectionHref(sectionId: string, userId: string): string {
    return `${dashboardIndex.url({ query: { user_id: userId } })}#${sectionId}`;
}

function Users2Icon() {
    return <LayoutGrid className="size-4" />;
}

function buildConfigurationHref(
    target: 'configuration-weekend' | 'configuration-holiday',
    userId: string,
): string {
    if (target === 'configuration-weekend') {
        return configurationWeekendIndex.url({ query: { user_id: userId } });
    }

    return configurationHolidayIndex.url({ query: { user_id: userId } });
}
