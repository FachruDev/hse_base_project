import { Bell, ChevronDown, ChevronRight, LayoutGrid, Settings2 } from 'lucide-react';
import * as React from 'react';

import {
    catatanPengolahanLimbahAirIndex,
    index as dashboardIndex,
} from '@/actions/App/Http/Controllers/Web/DashboardController';
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
import { dashboardNavigation, managementNavigation } from '@/modules/dashboard/config/navigation';

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
    const [managementOpen, setManagementOpen] = React.useState(true);
    const { theme, setTheme } = useTheme();

    const managementItems = managementNavigation.filter((item) => {
        return item.permission === undefined || permissions.includes(item.permission);
    });

    const initials = userName
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

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
                            <p className="truncate text-sm font-semibold text-sidebar-foreground">{appName}</p>
                            <p className="truncate text-xs text-sidebar-foreground/70">IPAL Workspace</p>
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
                                            <a href={buildWorkspaceHref(item.target, userId)}>
                                                <item.icon />
                                                <span>{item.label}</span>
                                            </a>
                                        }
                                        tooltip={item.label}
                                    />
                                </SidebarMenuItem>
                            ))}

                            {managementItems.length > 0 ? (
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        tooltip="Management User"
                                        onClick={() => setManagementOpen((current) => !current)}
                                    >
                                        <Users2Icon />
                                        <span>Management User</span>
                                        <ChevronRight className={`ml-auto transition-transform ${managementOpen ? 'rotate-90' : ''}`} />
                                    </SidebarMenuButton>

                                    {managementOpen ? (
                                        <SidebarMenuSub>
                                            {managementItems.map((item) => (
                                                <SidebarMenuSubItem key={item.key}>
                                                    <SidebarMenuSubButton href={buildDashboardSectionHref(item.sectionId, userId)}>
                                                        <item.icon />
                                                        <span>{item.label}</span>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    ) : null}
                                </SidebarMenuItem>
                            ) : null}
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
                            <p className="truncate text-xs font-medium text-sidebar-foreground">{userName}</p>
                            <p className="truncate text-[11px] text-sidebar-foreground/70">{userId}</p>
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
                                    <p className="truncate text-sm font-medium">{userName}</p>
                                    <p className="truncate text-xs text-muted-foreground">{departmentName ?? userId}</p>
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
                            <DropdownMenuItem onClick={() => setTheme(nextTheme)}>
                                <LayoutGrid className="size-4" />
                                <span>{nextTheme === 'dark' ? 'Ubah ke mode gelap' : 'Ubah ke mode terang'}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Bell className="size-4" />
                                <span>Notifikasi</span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator />

                        <div className="flex items-center justify-between px-2 py-1.5">
                            <span className="text-xs text-muted-foreground">Role aktif</span>
                            <Badge variant="outline">{roles[0] ?? 'user'}</Badge>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarFooter>
        </Sidebar>
    );
}

function buildWorkspaceHref(target: 'dashboard' | 'catatan-pengolahan-limbah-air', userId: string): string {
    if (target === 'catatan-pengolahan-limbah-air') {
        return catatanPengolahanLimbahAirIndex.url({ query: { user_id: userId } });
    }

    return dashboardIndex.url({ query: { user_id: userId } });
}

function buildDashboardSectionHref(sectionId: string, userId: string): string {
    return `${dashboardIndex.url({ query: { user_id: userId } })}#${sectionId}`;
}

function Users2Icon() {
    return <LayoutGrid className="size-4" />;
}
