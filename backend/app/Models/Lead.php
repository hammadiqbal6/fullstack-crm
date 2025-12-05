<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Lead extends Model
{
    use HasFactory;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'full_name',
        'email',
        'phone',
        'company',
        'message',
        'status',
        'source',
        'onboarding_token',
        'onboarding_expires_at',
        'approved_by',
        'approved_at',
        'rejected_at',
        'rejection_reason',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'onboarding_expires_at' => 'datetime',
            'approved_at' => 'datetime',
            'rejected_at' => 'datetime',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($lead) {
            if (empty($lead->id)) {
                $lead->id = (string) Str::uuid();
            }
        });
    }

    // Relationships
    public function user()
    {
        return $this->hasOne(User::class);
    }

    public function documents()
    {
        return $this->hasMany(LeadDocument::class);
    }

    public function contact()
    {
        return $this->hasOne(Contact::class);
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
