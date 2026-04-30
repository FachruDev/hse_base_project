import { Badge } from '@/components/ui/badge';
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
    SidebarSeparator,
} from '@/components/ui/sidebar';
import { dashboardNavigation } from '@/modules/dashboard/config/navigation';
import { dashboard } from '@/routes';

type DashboardSidebarProps = {
    appName: string;
    permissions: string[];
    userId: string;
};

export function DashboardSidebar({ appName, permissions, userId }: DashboardSidebarProps) {
    const navigation = dashboardNavigation.filter((item) => {
        return item.permission === undefined || permissions.includes(item.permission);
    });

    const buildHref = (sectionId: string): string => {
        return `${dashboard.url({ query: { user_id: userId } })}#${sectionId}`;
    };

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <div className="flex items-center gap-3 rounded-lg border border-sidebar-border bg-sidebar-accent/40 px-3 py-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500 text-xs font-semibold text-black">
                        IP
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-sidebar-foreground">{appName}</p>
                        <p className="truncate text-[11px] text-sidebar-foreground/70">Monitoring Hybrid Portal</p>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigasi</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navigation.map((item) => (
                                <SidebarMenuItem key={item.key}>
                                    <SidebarMenuButton
                                        render={
                                            <a href={buildHref(item.sectionId)}>
                                                <item.icon />
                                                <span>{item.label}</span>
                                            </a>
                                        }
                                        tooltip={item.label}
                                    />
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarSeparator />
            <SidebarFooter>
                <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/30 px-3 py-3 text-[11px] leading-relaxed text-sidebar-foreground/70">
                    <div className="mb-2 flex items-center justify-between">
                        <span>Akses Aktif</span>
                        <Badge variant="outline">{permissions.length}</Badge>
                    </div>
                    <p>Menu di sidebar difilter langsung dari permission user yang dikirim backend.</p>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
