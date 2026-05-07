import { Link } from '@inertiajs/react';
import { BookOpen, CreditCard, FileText, FolderGit2, PiggyBank } from 'lucide-react';
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

    const overviewNavItems: NavItem[] = [
        {
            title: 'Overview',
            href: '/member/dashboard?tab=overview',
            icon: BookOpen,
        },
        {
            title: 'Loan Application',
            href: '/member/dashboard?tab=loan-application',
            icon: CreditCard,
        },
        {
            title: 'Loan Tracking',
            href: '/member/dashboard?tab=loan-tracking',
            icon: CreditCard,
        },
        {
            title: 'View Savings',
            href: '/member/dashboard?tab=view-savings',
            icon: PiggyBank,
        },
        {
            title: 'View Return Patronage',
            href: '/member/dashboard?tab=view-patronage',
            icon: PiggyBank,
        },
        {
            title: 'Download Reports',
            href: '/member/dashboard?tab=reports',
            icon: FileText,
        },
    ];

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
                    overviewItems={overviewNavItems}
                    overviewLabel="Overview"
                    featureItems={[]}
                    loanItems={[]}
                    userItems={[]}
                />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
