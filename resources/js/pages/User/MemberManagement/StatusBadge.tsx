import React from 'react';

interface StatusBadgeProps {
    status: 'pending' | 'approved' | 'rejected' | 'good' | 'warning' | 'non-compliant' | 'active' | 'suspended' | 'pending_deletion';
    label?: string;
}

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800',
    active: 'bg-emerald-100 text-emerald-800',
    suspended: 'bg-red-100 text-red-800',
    pending_deletion: 'bg-amber-100 text-amber-800',
    good: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    'non-compliant': 'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<string, string> = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    active: 'Active',
    suspended: 'Suspended',
    pending_deletion: 'Pending Deletion',
    good: 'Good',
    warning: 'Warning',
    'non-compliant': 'Non-Compliant',
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
    const displayLabel = label || STATUS_LABELS[status] || status;
    const colorClass = STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';

    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${colorClass}`}>
            {displayLabel}
        </span>
    );
}

