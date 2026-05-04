import React from 'react';
import { Search as SearchIcon } from 'lucide-react';

interface MemberSearchProps {
    search: string;
    onSearchChange: (search: string) => void;
    placeholder?: string;
}

export default function MemberSearch({ 
    search, 
    onSearchChange,
    placeholder = 'Search members by name or ID...'
}: MemberSearchProps) {
    return (
        <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <input
                type="text"
                placeholder={placeholder}
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-4 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
        </div>
    );
}
