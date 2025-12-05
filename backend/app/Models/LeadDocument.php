<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeadDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'lead_id',
        'file_path',
        'filename',
        'content_type',
        'size',
    ];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }
}

