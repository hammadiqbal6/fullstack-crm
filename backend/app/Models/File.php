<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class File extends Model
{
    use HasFactory;

    protected $fillable = [
        'attachable_type',
        'attachable_id',
        'file_path',
        'filename',
        'content_type',
        'size',
        'category',
    ];

    public function attachable()
    {
        return $this->morphTo();
    }
}

