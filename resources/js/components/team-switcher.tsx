import { Badge } from '@/components/ui/badge';
import CreateTeamModal from '@/components/create-team-modal';
import { usePage } from '@inertiajs/react';
import { ChevronsUpDown, Plus } from 'lucide-react';
import { useState } from 'react';

import { dashboard } from '@/routes';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { Team } from '@/types/teams';

export function TeamSwitcher() {
    const { isMobile } = useSidebar();

    // ← added auth here
    const { currentTeam, teams, auth } = usePage().props as {
        currentTeam: Team;
        teams: Team[];
        auth: { user: { name: string } };
    };

    const [showCreateTeam, setShowCreateTeam] = useState(false);

    const isAdminTeam = (role?: string | null) =>
        role === 'owner' || role === 'admin';

    if (!currentTeam) return null;

    return (
        <>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <div className="flex flex-col items-start leading-tight">
                                    {/* ← now shows user's name instead of team name */}
                                    <span className="truncate font-semibold">
                                        {auth.user.name}
                                    </span>
                                    {isAdminTeam(currentTeam.role) ? (
                                        <Badge
                                            variant="secondary"
                                            className="mt-0.5 text-[10px] px-1.5 py-0"
                                        >
                                            Admin
                                        </Badge>
                                    ) : null}
                                </div>
                                <ChevronsUpDown className="ml-auto" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                            align="start"
                            side={isMobile ? 'bottom' : 'right'}
                            sideOffset={4}
                        >
                            <DropdownMenuLabel className="text-xs text-muted-foreground">
                                Teams
                            </DropdownMenuLabel>

                            {teams?.map((team: Team) => (
                                <DropdownMenuItem
                                    key={team.id}
                                    className="gap-2 p-2"
                                    asChild
                                >
                                    <a href={dashboard.url({ current_team: team.slug })}>
                                        <div className="flex flex-1 items-center justify-between">
                                            <span className="truncate">{team.name}</span>
                                            {isAdminTeam(team.role) ? (
                                                <Badge
                                                    variant="outline"
                                                    className="ml-2 text-[10px] px-1.5 py-0"
                                                >
                                                    Admin
                                                </Badge>
                                            ) : null}
                                        </div>
                                    </a>
                                </DropdownMenuItem>
                            ))}

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                className="gap-2 p-2 cursor-pointer"
                                onSelect={() => setShowCreateTeam(true)}
                            >
                                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                                    <Plus className="size-4" />
                                </div>
                                <div className="font-medium text-muted-foreground">
                                    Add team
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>

            <CreateTeamModal
                open={showCreateTeam}
                onOpenChange={setShowCreateTeam}
            />
        </>
    );
}