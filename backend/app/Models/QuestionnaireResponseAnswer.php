<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuestionnaireResponseAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'response_id',
        'question_id',
        'answer_text',
        'answer_file_path',
    ];

    public function response()
    {
        return $this->belongsTo(QuestionnaireResponse::class, 'response_id');
    }

    public function question()
    {
        return $this->belongsTo(QuestionnaireQuestion::class, 'question_id');
    }
}

