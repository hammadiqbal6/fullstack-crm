<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'assigned_to',
        'lead_id',
        'company',
        'primary_contact_name',
        'email',
        'phone',
        'address',
        'target_country',
        'visa_type',
        'intended_travel_date',
        'purpose_of_visit',
        'previous_visa_history',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'intended_travel_date' => 'date',
            'metadata' => 'array',
        ];
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    public function visaApplications()
    {
        return $this->hasMany(VisaApplication::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function questionnaireResponses()
    {
        return $this->hasMany(QuestionnaireResponse::class);
    }

    public function files()
    {
        return $this->morphMany(File::class, 'attachable');
    }
}

