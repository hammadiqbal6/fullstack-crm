<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'lead_id',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    // Relationships
    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    public function roles()
    {
        return $this->belongsToMany(\App\Models\Role::class, 'user_roles');
    }

    public function contact()
    {
        return $this->hasOne(\App\Models\Contact::class);
    }

    public function assignedContacts()
    {
        return $this->hasMany(\App\Models\Contact::class, 'assigned_to');
    }

    // Helper methods
    public function hasRole($role): bool
    {
        if (is_string($role)) {
            return $this->roles()->where('slug', $role)->exists();
        }

        return $this->roles()->where('id', $role)->exists();
    }

    public function hasAnyRole(array $roles): bool
    {
        return $this->roles()->whereIn('slug', $roles)->exists();
    }

    public function hasPermission($permission): bool
    {
        return $this->roles()
            ->whereHas('permissions', function ($query) use ($permission) {
                $query->where('slug', $permission);
            })
            ->exists();
    }

    public function hasAnyPermission(array $permissions): bool
    {
        return $this->roles()
            ->whereHas('permissions', function ($query) use ($permissions) {
                $query->whereIn('slug', $permissions);
            })
            ->exists();
    }

    public function permissions()
    {
        $roleIds = $this->roles()->pluck('id')->toArray();
        if (empty($roleIds)) {
            return collect();
        }

        return Permission::whereHas('roles', function ($query) use ($roleIds) {
            $query->whereIn('id', $roleIds);
        })->get();
    }

    public function isCustomer(): bool
    {
        return $this->hasRole('customer');
    }

    public function isStaff(): bool
    {
        return $this->hasAnyRole(['admin', 'user', 'sales_rep']);
    }
}
