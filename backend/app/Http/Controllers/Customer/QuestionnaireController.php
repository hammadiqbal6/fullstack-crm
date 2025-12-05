<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Questionnaire;
use App\Models\QuestionnaireResponse;
use App\Models\Contact;
use Illuminate\Http\Request;

class QuestionnaireController extends Controller
{
    public function index()
    {
        $questionnaires = Questionnaire::where('is_active', true)
            ->with('questions')
            ->get();

        return response()->json($questionnaires);
    }

    public function show($id)
    {
        $questionnaire = Questionnaire::with('questions')
            ->findOrFail($id);

        $user = auth()->user();
        $contact = $user->contact;

        if ($contact) {
            $response = QuestionnaireResponse::where('questionnaire_id', $id)
                ->where('contact_id', $contact->id)
                ->with('answers')
                ->first();

            $questionnaire->response = $response;
        }

        return response()->json($questionnaire);
    }

    public function storeResponse(Request $request, $id)
    {
        $questionnaire = Questionnaire::with('questions')->findOrFail($id);
        $user = auth()->user();
        $contact = $user->contact;

        if (!$contact) {
            return response()->json(['message' => 'Contact not found'], 404);
        }

        $validated = $request->validate([
            'answers' => 'required|array',
            'answers.*.question_id' => 'required|exists:questionnaire_questions,id',
            'answers.*.answer_text' => 'nullable|string',
            'answers.*.answer_file' => 'nullable|file',
        ]);

        // Create or update response
        $response = QuestionnaireResponse::updateOrCreate(
            [
                'questionnaire_id' => $id,
                'contact_id' => $contact->id,
            ],
            [
                'user_id' => $user->id,
                'status' => 'SUBMITTED',
                'submitted_at' => now(),
            ]
        );

        // Delete existing answers
        $response->answers()->delete();

        // Create new answers
        foreach ($validated['answers'] as $answerData) {
            $answer = [
                'response_id' => $response->id,
                'question_id' => $answerData['question_id'],
                'answer_text' => $answerData['answer_text'] ?? null,
            ];

            if (isset($answerData['answer_file'])) {
                $file = $answerData['answer_file'];
                $path = $file->store('questionnaire-answers', 'public');
                $answer['answer_file_path'] = $path;
            }

            $response->answers()->create($answer);
        }

        return response()->json($response->load('answers'), 201);
    }
}

