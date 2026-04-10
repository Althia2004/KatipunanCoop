import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { ROLE_LABELS } from '@/types/auth';
import type { User } from '@/types';

export function UserInfo({
    user,
    showEmail = false,
}: {
    user: User;
    showEmail?: boolean;
}) {
    const getInitials = useInitials();
    const showAvatar = Boolean(user.avatar && user.avatar !== '');
    const roleLabel = ROLE_LABELS[user.role] ?? user.role;

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-lg">
                {showAvatar ? (
                    <AvatarImage src={user.avatar} alt={user.name} />
                ) : null}
                <AvatarFallback className="rounded-lg bg-[#2d4734] text-white">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-[10px]">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-semibold">
                        {roleLabel}
                    </span>
                </span>
                {showEmail && (
                    <span className="truncate text-xs text-muted-foreground mt-0.5">
                        {user.email}
                    </span>
                )}
            </div>
        </>
    );
}
