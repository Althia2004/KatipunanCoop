<?php

namespace App\Enums;

enum LoanStatus: string
{
    case Pending = 'pending';
    case BodApproval = 'bod_approval';
    case Approved = 'approved';
    case Rejected = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::BodApproval => 'BOD Approval',
            self::Approved => 'Approved',
            self::Rejected => 'Rejected',
        };
    }
}
