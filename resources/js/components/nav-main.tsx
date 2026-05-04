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
    featureItems = [],
    loanItems = [],
    userItems = [],
}: {
    featureItems: NavItem[];
    loanItems: NavItem[];
    userItems: NavItem[];
}) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <>
            {featureItems.length > 0 && (
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>Features</SidebarGroupLabel>
                    {renderMenu(featureItems, isCurrentUrl)}
                </SidebarGroup>
            )}

            {loanItems.length > 0 && (
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>Loan Management</SidebarGroupLabel>
                    {renderMenu(loanItems, isCurrentUrl)}
                </SidebarGroup>
            )}

            {userItems.length > 0 && (
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>User Management</SidebarGroupLabel>
                    {renderMenu(userItems, isCurrentUrl)}
                </SidebarGroup>
            )}
        </>
    );
}
