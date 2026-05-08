<?php

namespace App\Models;

use App\Concerns\HasTeams;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

#[Fillable(['name', 'email', 'password', 'current_team_id', 'role'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasTeams, Notifiable, TwoFactorAuthenticatable;

    protected function casts(): array
    {
        return [
            'email_verified_at'       => 'datetime',
            'password'                => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isSuperadmin(): bool
    {
        return $this->role === 'superadmin';
    }

    public function dashboardRouteName(): string
    {
        return match($this->role) {
            'superadmin' => 'superadmin.dashboard',
            'admin'      => 'admin.dashboard',
            'manager'    => 'manager.dashboard',
            'bookkeeper' => 'bookkeeper.dashboard',
            'hr'         => 'hr.dashboard',
            'board'      => 'board.dashboard',
            'member'     => 'member.dashboard',
            default      => 'superadmin.dashboard',
        };
    }

    public function dashboardUrl(): string
    {
        if ($this->role === 'admin') {
            $team = $this->currentTeam ?? $this->personalTeam();
            if ($team) {
                return '/' . $team->slug . '/dashboard';
            }
        }

        return match($this->role) {
            'superadmin' => '/superadmin/dashboard',
            'manager'    => '/manager/dashboard',
            'bookkeeper' => '/bookkeeper/dashboard',
            'hr'         => '/hr/dashboard',
            'board'      => '/board/dashboard',
            'member'     => '/member/dashboard',
            default      => '/login',
        };
    }

    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class, 'member_id');
    }
}