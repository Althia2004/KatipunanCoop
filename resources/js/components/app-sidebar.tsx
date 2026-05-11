import { Link, usePage } from '@inertiajs/react';
import {
    Archive,
    Banknote,
    BookOpen,
    BriefcaseBusiness,
    CreditCard,
    FileText,
    FolderGit2,
    LayoutGrid,
    Scale,
    TrendingUp,
    UserCircle,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavSuperadmin } from '@/components/nav-superadmin';
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
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const page = usePage();
    const { auth } = page.props;

    const userRole = auth?.user?.role as string | undefined;
    const dashboardUrl = userRole === 'superadmin'
        ? '/superadmin/dashboard'
        : userRole === 'admin'
            ? page.props.currentTeam
                ? dashboard(page.props.currentTeam.slug)
                : '/'
            : '/member/dashboard';

    const isAdminNav = userRole === 'admin' || userRole === 'superadmin';

    const featureNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboardUrl,
            icon: LayoutGrid,
        },
        {
            title: 'Annual Meeting Reports',
            href: '/reports/annual', // Update with the actual route for annual meeting reports
            icon: Archive,
        },
    ];

    const loanNavItems: NavItem[] = [
        {
            title: 'Member Registration',
            href: '/loan/member-registration',
            icon: BriefcaseBusiness,
        },
        {
            title: 'Seminar Tracking',
            href: '/loan/seminar-tracking',
            icon: Users,
        },
        {
            title: 'Loan Requests',
            href: '/loan/management',
            icon: FileText,
        },
    ];

    if (isAdminNav) {
        loanNavItems.push({
            title: 'Loan Management',
            href: '/loan/active',
            icon: FileText,
        });
    }

    const userNavItems: NavItem[] = [
        {
            title: 'Member Management',
            href: '/user/member-management',
            icon: UserCircle,
        },
        {
            title: 'Amortization Schedules',
            href: '/user/amortization',
            icon: BookOpen,
        },
        {
            title: 'Savings Interest',
            href: '/user/savings-interest',
            icon: Scale,
        },
        {
            title: 'Dividend Reports',
            href: '/user/dividend-reports',
            icon: Banknote,
        },
        {
            title: 'Patronage Reports',
            href: '/user/patronage-reports',
            icon: TrendingUp,
        },
        {
            title: 'Payment Dashboard',
            href: '/user/payments',
            icon: CreditCard,
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
                {userRole === 'superadmin' ? (
                    <NavSuperadmin />
                ) : (
                    <NavMain
                        featureItems={featureNavItems}
                        loanItems={loanNavItems}
                        userItems={userNavItems}
                    />
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
