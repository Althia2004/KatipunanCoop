<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Member extends Model
{
    use HasFactory;

    // Status constants
    const STATUS_PENDING          = 'pending';
    const STATUS_APPROVED         = 'approved';
    const STATUS_REJECTED         = 'rejected';
    const STATUS_MEMBER           = 'member';
    const STATUS_REGULAR          = 'regular';
    const STATUS_INACTIVE         = 'inactive';
    const STATUS_DELINQUENT       = 'delinquent';
    const STATUS_PENDING_DELETION = 'pending_deletion';
    const STATUS_ARCHIVED         = 'archived';
    const STATUS_PENDING_ARCHIVE  = 'pending_archive';
    const STATUS_PENDING_RESTORE  = 'pending_restore';

    // Membership Status constants
    const MEMBERSHIP_GOOD = 'good';
    const MEMBERSHIP_WARNING = 'warning';
    const MEMBERSHIP_NON_COMPLIANT = 'non-compliant';

    protected $fillable = [
        'user_id',
        'member_registration_id',
        'name',
        'gender',
        'status',
        'membership_status',
        'standing',
        'start_date',
        'last_login',
        'savings_balance',
        'share_capital',
        'capital_share_target',
        'capital_share_subscription_date',
        'capital_share_payment_frequency',
        'copra_sales_ytd',
        'patronage_amount',
        'migs_score',
        'migs_classification',
        'migs_breakdown',
        'migs_calculated_at',
        'is_archived',
        'archived_at',
        'archived_by',
        'archive_reason',
        'archive_year',
        'archive_requested',
        'archive_requested_at',
        'archive_requested_by',
        'archive_request_reason',
        'restore_requested',
        'restore_requested_at',
        'restore_requested_by',
        'restore_request_reason',
    ];

    protected $casts = [
        'start_date'         => 'date',
        'last_login'         => 'datetime',
        'created_at'         => 'datetime',
        'updated_at'         => 'datetime',
        'migs_breakdown'     => 'array',
        'migs_calculated_at' => 'datetime',
        'savings_balance'    => 'decimal:2',
        'share_capital'      => 'decimal:2',
        'capital_share_target' => 'decimal:2',
        'capital_share_subscription_date' => 'date',
        'copra_sales_ytd'    => 'decimal:2',
        'patronage_amount'   => 'decimal:2',
        'is_archived'          => 'boolean',
        'archived_at'          => 'datetime',
        'archive_requested'    => 'boolean',
        'archive_requested_at' => 'datetime',
        'restore_requested'    => 'boolean',
        'restore_requested_at' => 'datetime',
    ];

    // ── Computed name from registration ──────────────────────────────────────

    public function getNameAttribute(): string
    {
        if ($this->relationLoaded('memberRegistration') && $this->memberRegistration) {
            return trim($this->memberRegistration->first_name . ' ' . $this->memberRegistration->last_name);
        }
        return $this->attributes['name'] ?? '';
    }

    // ── Auto-upgrade ─────────────────────────────────────────────────────────

    /**
     * Upgrade member to Regular status when share_capital ≥ capital_share_target.
     * Safe to call multiple times — only acts when conditions are met.
     */
    public function checkAndUpgradeToRegular(): void
    {
        if ($this->status === self::STATUS_REGULAR) return;

        $target = (float) ($this->attributes['capital_share_target'] ?? 10000);
        $paid   = (float) ($this->attributes['share_capital'] ?? 0);

        if ($paid >= $target) {
            $this->update(['status' => self::STATUS_REGULAR]);
        }
    }

    // ── Capital Share computed attributes ────────────────────────────────────

    public function getCapitalShareProgressAttribute(): float
    {
        $target = (float) ($this->attributes['capital_share_target'] ?? 10000);
        if ($target <= 0) return 100.0;
        $paid = (float) ($this->attributes['share_capital'] ?? 0);
        return min(100.0, round(($paid / $target) * 100, 2));
    }

    public function getCapitalShareRemainingAttribute(): float
    {
        $target = (float) ($this->attributes['capital_share_target'] ?? 10000);
        $paid   = (float) ($this->attributes['share_capital'] ?? 0);
        return max(0.0, $target - $paid);
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function memberRegistration(): BelongsTo
    {
        return $this->belongsTo(MemberRegistration::class);
    }

    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class, 'member_id', 'user_id');
    }

    public function copraSales(): HasMany
    {
        return $this->hasMany(CopraSale::class);
    }

    public function savingsTransactions(): HasMany
    {
        return $this->hasMany(SavingsTransaction::class);
    }

    public function capitalShareTransactions(): HasMany
    {
        return $this->hasMany(CapitalShareTransaction::class);
    }

    public function archivedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'archived_by');
    }

    public function archiveRequestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'archive_requested_by');
    }

    public function restoreRequestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'restore_requested_by');
    }

    // ── Archive helpers ───────────────────────────────────────────────────────

    public function archive(string $reason, int $archivedByUserId): void
    {
        $this->update([
            'is_archived'          => true,
            'status'               => self::STATUS_ARCHIVED, // archived is a separate tracking status
            'archived_at'          => now(),
            'archived_by'          => $archivedByUserId,
            'archive_reason'       => $reason,
            'archive_year'         => now()->year,
            'archive_requested'    => false,
            'archive_requested_at' => null,
            'archive_requested_by' => null,
            'archive_request_reason' => null,
        ]);
    }

    public function restore(): void
    {
        $this->update([
            'is_archived'            => false,
            'status'                 => self::STATUS_MEMBER,
            'archived_at'            => null,
            'archived_by'            => null,
            'archive_reason'         => null,
            'archive_year'           => null,
            'restore_requested'      => false,
            'restore_requested_at'   => null,
            'restore_requested_by'   => null,
            'restore_request_reason' => null,
        ]);
    }

    public function requestArchive(string $reason, int $requestedBy): bool
    {
        return $this->update([
            'archive_requested'      => true,
            'archive_requested_at'   => now(),
            'archive_requested_by'   => $requestedBy,
            'archive_request_reason' => $reason,
            'status'                 => self::STATUS_PENDING_ARCHIVE,
        ]);
    }

    public function requestRestore(string $reason, int $requestedBy): bool
    {
        return $this->update([
            'restore_requested'      => true,
            'restore_requested_at'   => now(),
            'restore_requested_by'   => $requestedBy,
            'restore_request_reason' => $reason,
            'status'                 => self::STATUS_PENDING_RESTORE,
        ]);
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    public function scopeApproved($query)
    {
        return $query->whereIn('status', [self::STATUS_APPROVED, self::STATUS_MEMBER, self::STATUS_REGULAR]);
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', [self::STATUS_MEMBER, self::STATUS_REGULAR]);
    }

    public function scopeMigs($query)
    {
        return $query->where('migs_classification', 'migs');
    }

    public function scopeNotArchived($query)
    {
        return $query->where('is_archived', false);
    }

    public function scopeArchived($query)
    {
        return $query->where('is_archived', true);
    }

    public function scopeArchivedYear($query, int $year)
    {
        return $query->where('archive_year', $year);
    }

    public function scopePendingArchive($query)
    {
        return $query->where('archive_requested', true)->where('is_archived', false);
    }

    public function scopePendingRestore($query)
    {
        return $query->where('restore_requested', true)->where('is_archived', true);
    }
}
