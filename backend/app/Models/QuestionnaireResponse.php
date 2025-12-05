<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuestionnaireResponse extends Model
{
    use HasFactory;

    protected $fillable = [
        'questionnaire_id',
        'contact_id',
        'user_id',
        'submitted_at',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
        ];
    }

    public function questionnaire()
    {
        return $this->belongsTo(Questionnaire::class);
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function answers()
    {
        return $this->hasMany(QuestionnaireResponseAnswer::class, 'response_id');
    }
}
