import { Link } from '@inertiajs/react';
import {
    LayoutGrid, Users, Clock, UserCircle, Banknote,
    PercentCircle, CalendarDays, BarChart3, Search,
} from 'lucide-react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';

const NAV_GROUPS = [
    {
        label: 'Overview',
        items: [
            { title: 'Dashboard', href: '/superadmin/dashboard', icon: LayoutGrid },
        ],
    },
    {
        label: 'Staff Management',
        items: [
            { title: 'All Staff',          href: '/superadmin/staff',      icon: Users },
            { title: 'Pending Approvals',  href: '/superadmin/approvals',  icon: Clock },
        ],
    },
    {
        label: 'Cooperative',
        items: [
            { title: 'All Members', href: '/superadmin/members', icon: UserCircle },
            { title: 'All Loans',   href: '/superadmin/loans',   icon: Banknote },
        ],
    },
    {
        label: 'System Settings',
        items: [
            { title: 'Interest & Penalties', href: '/superadmin/settings/interest', icon: PercentCircle },
        ],
    },
    {
        label: 'Reports',
        items: [
            { title: 'Annual Meetings',   href: '/superadmin/reports/annual',    icon: CalendarDays },
            { title: 'Financial Reports', href: '/superadmin/reports/financial', icon: BarChart3 },
        ],
    },
    {
        label: 'Audit',
        items: [
            { title: 'Audit Logs', href: '/superadmin/audit', icon: Search },
        ],
    },
];

export function NavSuperadmin() {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <>
            {NAV_GROUPS.map((group) => (
                <SidebarGroup key={group.label} className="px-2 py-0">
                    <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                    <SidebarMenu>
                        {group.items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isCurrentUrl(item.href)}
                                    tooltip={{ children: item.title }}
                                >
                                    <Link href={item.href} prefetch>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    );
}
