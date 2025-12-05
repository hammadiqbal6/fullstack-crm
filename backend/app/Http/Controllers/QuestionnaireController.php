<?php

namespace App\Http\Controllers;

use App\Models\Questionnaire;
use Illuminate\Http\Request;

class QuestionnaireController extends Controller
{
    public function index()
    {
        $questionnaires = Questionnaire::with('questions', 'createdBy')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($questionnaires);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'questions' => 'required|array',
            'questions.*.question_text' => 'required|string',
            'questions.*.question_type' => 'required|in:text,textarea,select,radio,checkbox,file_upload,date',
            'questions.*.options' => 'nullable|array',
            'questions.*.required' => 'boolean',
            'questions.*.order' => 'integer',
        ]);

        $questionnaire = Questionnaire::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'created_by' => auth()->id(),
        ]);

        foreach ($validated['questions'] as $index => $questionData) {
            $questionnaire->questions()->create([
                'question_text' => $questionData['question_text'],
                'question_type' => $questionData['question_type'],
                'options' => $questionData['options'] ?? null,
                'required' => $questionData['required'] ?? false,
                'order' => $questionData['order'] ?? $index,
            ]);
        }

        return response()->json($questionnaire->load('questions'), 201);
    }

    public function show($id)
    {
        $questionnaire = Questionnaire::with('questions')->findOrFail($id);
        return response()->json($questionnaire);
    }

    public function update(Request $request, $id)
    {
        $questionnaire = Questionnaire::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $questionnaire->update($validated);

        return response()->json($questionnaire->load('questions'));
    }

    public function destroy($id)
    {
        $questionnaire = Questionnaire::findOrFail($id);
        $questionnaire->delete();

        return response()->json(['message' => 'Questionnaire deleted successfully']);
    }
}

