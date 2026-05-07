import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

function renderMenu(items: NavItem[], isCurrentUrl: (href: NavItem['href']) => boolean) {
    return (
        <SidebarMenu>
            {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                        asChild
                        isActive={isCurrentUrl(item.href)}
                        tooltip={{ children: item.title }}
                    >
                        <Link href={item.href} prefetch>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
    );
}

export function NavMain({
    overviewItems = [],
    overviewLabel = 'Overview',
    featureItems = [],
    featureLabel = 'Features',
    loanItems = [],
    loanLabel = 'Loan Management',
    userItems = [],
    userLabel = 'User Management',
}: {
    overviewItems?: NavItem[];
    overviewLabel?: string;
    featureItems: NavItem[];
    featureLabel?: string;
    loanItems: NavItem[];
    loanLabel?: string;
    userItems: NavItem[];
    userLabel?: string;
}) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <>
            {overviewItems.length > 0 && (
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>{overviewLabel}</SidebarGroupLabel>
                    {renderMenu(overviewItems, isCurrentUrl)}
                </SidebarGroup>
            )}

            {featureItems.length > 0 && (
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>{featureLabel}</SidebarGroupLabel>
                    {renderMenu(featureItems, isCurrentUrl)}
                </SidebarGroup>
            )}

            {loanItems.length > 0 && (
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>{loanLabel}</SidebarGroupLabel>
                    {renderMenu(loanItems, isCurrentUrl)}
                </SidebarGroup>
            )}

            {userItems.length > 0 && (
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>{userLabel}</SidebarGroupLabel>
                    {renderMenu(userItems, isCurrentUrl)}
                </SidebarGroup>
            )}
        </>
    );
}
