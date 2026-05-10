// resources/js/components/app-member-sidebar.tsx

import { Link } from '@inertiajs/react';
import { 
    Banknote, 
    BookOpen, 
    FolderGit2, 
    PiggyBank // Added icon for Share Capital
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';

export function AppMemberSidebar() {
    const dashboardUrl = '/member/dashboard';

    const featureNavItems: NavItem[] = [
        {
            title: 'Capital Shares',
            href: '/member/capital-shares',
            icon: PiggyBank,
        },
    ];


    const loanNavItems: NavItem[] = [
        {
            title: 'Loan Request',
            href: '/loan/management',
            icon: Banknote,
        },
    ];

    const userNavItems: NavItem[] = [];

    const footerNavItems: NavItem[] = [
        {
            title: 'Repository',
            href: 'https://github.com/laravel/react-starter-kit',
            icon: FolderGit2,
        },
        {
            title: 'Documentation',
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboardUrl} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain
                    featureItems={featureNavItems}
                    loanItems={loanNavItems}
                    userItems={userNavItems}
                />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}