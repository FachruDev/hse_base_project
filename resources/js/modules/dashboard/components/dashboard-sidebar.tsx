import {
    Bell,
    CalendarCog,
    ChevronDown,
    ChevronRight,
    ClipboardPenLine,
    Database,
    FileStack,
    LayoutGrid,
    PanelLeftClose,
    PanelLeftOpen,
    Settings2,
    Users2,
} from 'lucide-react';
import * as React from 'react';

import {
    holidayIndex as configurationHolidayIndex,
    weekendIndex as configurationWeekendIndex,
} from '@/actions/App/Http/Controllers/Web/ConfigurationController';
import {
    b3StorageCreate,
    b3StorageIndex,
    catatanPengolahanLimbahAirCreate,
    catatanPengolahanLimbahAirIndex,
    index as dashboardIndex,
} from '@/actions/App/Http/Controllers/Web/DashboardController';
import { index as managementIndex } from '@/actions/App/Http/Controllers/Web/ManagementController';
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
    useSidebar,
} from '@/components/ui/sidebar';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    configurationNavigation,
    dashboardNavigation,
    formEntryNavigation,
    formManagementNavigation,
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
        [key],
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
    const [managementOpen, setManagementOpen] = useSidebarState(
        'sidebar-management-open',
        false,
    );
    const [formsOpen, setFormsOpen] = useSidebarState(
        'sidebar-forms-open',
        false,
    );
    const [formManagementOpen, setFormManagementOpen] = useSidebarState(
        'sidebar-form-management-open',
        false,
    );
    const [masterDataOpen, setMasterDataOpen] = useSidebarState(
        'sidebar-master-open',
        false,
    );
    const [configurationOpen, setConfigurationOpen] = useSidebarState(
        'sidebar-config-open',
        false,
    );

    const { theme, setTheme } = useTheme();

    const managementItems = React.useMemo(
        () =>
            managementNavigation.filter((item) => {
                return (
                    item.permission === undefined ||
                    permissions.includes(item.permission)
                );
            }),
        [permissions],
    );

    const formEntryItems = React.useMemo(
        () =>
            formEntryNavigation.filter((item) =>
                permissions.includes(item.permission),
            ),
        [permissions],
    );

    const formManagementItems = React.useMemo(
        () =>
            formManagementNavigation.filter((item) =>
                permissions.includes(item.permission),
            ),
        [permissions],
    );

    const masterDataItems = React.useMemo(
        () =>
            masterDataNavigation.filter((item) =>
                permissions.includes(item.permission),
            ),
        [permissions],
    );

    const configurationItems = React.useMemo(
        () =>
            configurationNavigation.filter((item) =>
                permissions.includes(item.permission),
            ),
        [permissions],
    );

    const initials = React.useMemo(
        () =>
            userName
                .split(' ')
                .map((part) => part[0])
                .join('')
                .slice(0, 2)
                .toUpperCase(),
        [userName],
    );

    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="gap-3">
                <div className="flex items-center justify-between rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-2 group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0">
                    <div className="flex min-w-0 items-center gap-3 group-data-[collapsible=icon]:min-w-8 group-data-[collapsible=icon]:justify-center">
                        <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-xs font-semibold text-primary-foreground shadow-sm group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:rounded-lg">
                            IP
                        </div>
                        <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                            <p className="truncate text-sm font-semibold text-sidebar-foreground">
                                {appName}
                            </p>
                            <p className="truncate text-xs text-sidebar-foreground/70">
                                IPAL Workspace
                            </p>
                        </div>
                    </div>
                    <SidebarCollapseToggle />
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

                            {formEntryItems.length > 0 && (
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        tooltip="Form Operasional"
                                        onClick={() =>
                                            setFormsOpen((current) => !current)
                                        }
                                    >
                                        <ClipboardPenLine className="size-4" />
                                        <span>Form Operasional</span>
                                        <ChevronRight
                                            className={`ml-auto transition-transform group-data-[collapsible=icon]:hidden ${formsOpen ? 'rotate-90' : ''}`}
                                        />
                                    </SidebarMenuButton>

                                    {formsOpen && (
                                        <SidebarMenuSub>
                                            {formEntryItems.map((item) => (
                                                <SidebarMenuSubItem
                                                    key={item.key}
                                                >
                                                    <SidebarMenuSubButton
                                                        href={buildFormHref(
                                                            item.target as any,
                                                            userId,
                                                        )}
                                                    >
                                                        <item.icon />
                                                        <span>
                                                            {item.label}
                                                        </span>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    )}
                                </SidebarMenuItem>
                            )}

                            {formManagementItems.length > 0 && (
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        tooltip="Management Form"
                                        onClick={() =>
                                            setFormManagementOpen(
                                                (current) => !current,
                                            )
                                        }
                                    >
                                        <FileStack className="size-4" />
                                        <span>Management Form</span>
                                        <ChevronRight
                                            className={`ml-auto transition-transform group-data-[collapsible=icon]:hidden ${formManagementOpen ? 'rotate-90' : ''}`}
                                        />
                                    </SidebarMenuButton>

                                    {formManagementOpen && (
                                        <SidebarMenuSub>
                                            {formManagementItems.map((item) => (
                                                <SidebarMenuSubItem
                                                    key={item.key}
                                                >
                                                    <SidebarMenuSubButton
                                                        href={buildFormHref(
                                                            item.target,
                                                            userId,
                                                        )}
                                                    >
                                                        <item.icon />
                                                        <span>
                                                            {item.label}
                                                        </span>
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
                                        onClick={() =>
                                            setMasterDataOpen(
                                                (current) => !current,
                                            )
                                        }
                                    >
                                        <Database className="size-4" />
                                        <span>Master Data Form</span>
                                        <ChevronRight
                                            className={`ml-auto transition-transform group-data-[collapsible=icon]:hidden ${masterDataOpen ? 'rotate-90' : ''}`}
                                        />
                                    </SidebarMenuButton>

                                    {masterDataOpen && (
                                        <SidebarMenuSub>
                                            {masterDataItems.map((item) => (
                                                <SidebarMenuSubItem
                                                    key={item.key}
                                                >
                                                    <SidebarMenuSubButton
                                                        href={buildMasterDataHref(
                                                            item.module,
                                                            userId,
                                                        )}
                                                    >
                                                        <item.icon />
                                                        <span>
                                                            {item.label}
                                                        </span>
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
                                        onClick={() =>
                                            setManagementOpen(
                                                (current) => !current,
                                            )
                                        }
                                    >
                                        <Users2 className="size-4" />
                                        <span>Management User</span>
                                        <ChevronRight
                                            className={`ml-auto transition-transform group-data-[collapsible=icon]:hidden ${managementOpen ? 'rotate-90' : ''}`}
                                        />
                                    </SidebarMenuButton>

                                    {managementOpen && (
                                        <SidebarMenuSub>
                                            {managementItems.map((item) => (
                                                <SidebarMenuSubItem
                                                    key={item.key}
                                                >
                                                    <SidebarMenuSubButton
                                                        href={buildManagementHref(
                                                            item.module,
                                                            userId,
                                                        )}
                                                    >
                                                        <item.icon />
                                                        <span>
                                                            {item.label}
                                                        </span>
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
                                        onClick={() =>
                                            setConfigurationOpen(
                                                (current) => !current,
                                            )
                                        }
                                    >
                                        <CalendarCog className="size-4" />
                                        <span>Konfigurasi</span>
                                        <ChevronRight
                                            className={`ml-auto transition-transform group-data-[collapsible=icon]:hidden ${configurationOpen ? 'rotate-90' : ''}`}
                                        />
                                    </SidebarMenuButton>

                                    {configurationOpen && (
                                        <SidebarMenuSub>
                                            {configurationItems.map((item) => (
                                                <SidebarMenuSubItem
                                                    key={item.key}
                                                >
                                                    <SidebarMenuSubButton
                                                        href={buildConfigurationHref(
                                                            item.target as any,
                                                            userId,
                                                        )}
                                                    >
                                                        <item.icon />
                                                        <span>
                                                            {item.label}
                                                        </span>
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
                                className="h-auto w-full justify-start rounded-xl border border-sidebar-border bg-sidebar-accent/35 px-3 py-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:px-0"
                            />
                        }
                    >
                        <Avatar size="sm">
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1 text-left group-data-[collapsible=icon]:hidden">
                            <p className="truncate text-xs font-medium text-sidebar-foreground">
                                {userName}
                            </p>
                            <p className="truncate text-[11px] text-sidebar-foreground/70">
                                {userId}
                            </p>
                        </div>
                        <ChevronDown className="size-4 shrink-0 text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden" />
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
    target:
        | 'catatan-pengolahan-limbah-air-create'
        | 'penyimpanan-limbah-b3-create'
        | 'catatan-pengolahan-limbah-air-index'
        | 'penyimpanan-limbah-b3-index',
    userId: string,
): string {
    if (target === 'catatan-pengolahan-limbah-air-create') {
        return catatanPengolahanLimbahAirCreate.url({
            query: { user_id: userId },
        });
    }

    if (target === 'penyimpanan-limbah-b3-create') {
        return b3StorageCreate.url({ query: { user_id: userId } });
    }

    if (target === 'catatan-pengolahan-limbah-air-index') {
        return catatanPengolahanLimbahAirIndex.url({
            query: { user_id: userId },
        });
    }

    return b3StorageIndex.url({ query: { user_id: userId } });
}

function buildMasterDataHref(module: string, userId: string): string {
    return masterDataIndex.url(module, { query: { user_id: userId } });
}

function buildManagementHref(module: string, userId: string): string {
    return managementIndex.url(module, { query: { user_id: userId } });
}

function SidebarCollapseToggle() {
    const { state, toggleSidebar, isMobile } = useSidebar();
    const isCollapsed = state === 'collapsed' && !isMobile;
    const label = isCollapsed ? 'Expand sidebar' : 'Collapse sidebar';
    const Icon = isCollapsed ? PanelLeftOpen : PanelLeftClose;

    return (
        <Tooltip>
            <TooltipTrigger
                render={
                    <Button
                        type="button"
                        variant={isCollapsed ? 'outline' : 'ghost'}
                        size="icon-sm"
                        aria-label={label}
                        title={label}
                        className="shrink-0 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:border-sidebar-border group-data-[collapsible=icon]:bg-background group-data-[collapsible=icon]:shadow-sm"
                        onClick={toggleSidebar}
                    />
                }
            >
                <Icon className="size-4" />
            </TooltipTrigger>
            <TooltipContent side="right" align="center">
                {label}
            </TooltipContent>
        </Tooltip>
    );
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
