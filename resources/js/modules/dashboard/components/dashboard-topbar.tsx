import { Bell, ChevronDown, ShieldCheck, Waves } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';

type DashboardTopbarProps = {
    appName: string;
    userName: string;
    departmentName?: string | null;
    roles: string[];
};

export function DashboardTopbar({ appName, userName, departmentName, roles }: DashboardTopbarProps) {
    const initials = userName
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <header className="sticky top-0 z-20 border-b border-border/60 bg-background/95 backdrop-blur">
            <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-6">
                <div className="flex items-center gap-3">
                    <SidebarTrigger />
                    <div>
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>{appName}</BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                        <p className="mt-1 text-[11px] text-muted-foreground">Portal monitoring untuk web app dan iframe induk.</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="hidden lg:inline-flex">
                        <Waves />
                        Iframe Ready
                    </Badge>

                    <Button variant="outline" size="icon-sm">
                        <Bell />
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="outline" size="lg" />}>
                            <Avatar size="sm">
                                <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <span className="hidden text-left sm:block">
                                <span className="block">{userName}</span>
                            </span>
                            <ChevronDown className="hidden sm:block" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuGroup>
                                <div className="px-2 py-1.5 text-xs text-muted-foreground">Akun Aktif</div>
                                <DropdownMenuItem>{userName}</DropdownMenuItem>
                                <DropdownMenuItem>{departmentName ?? 'Tanpa departemen'}</DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <ShieldCheck />
                                <span>Role: {roles.join(', ') || 'Tanpa role'}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Badge variant="secondary" className="hidden lg:inline-flex">
                        {roles[0] ?? 'user'}
                    </Badge>
                </div>
            </div>
        </header>
    );
}
