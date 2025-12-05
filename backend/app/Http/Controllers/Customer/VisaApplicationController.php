<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\VisaApplication;
use Illuminate\Http\Request;

class VisaApplicationController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $contact = $user->contact;

        if (! $contact) {
            return response()->json(['message' => 'Contact not found'], 404);
        }

        $applications = $contact->visaApplications;

        return response()->json($applications);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'country' => 'required|string|max:255',
            'visa_type' => 'required|string|max:255',
            'travel_dates_start' => 'nullable|date',
            'travel_dates_end' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $user = auth()->user();
        $contact = $user->contact;

        if (! $contact) {
            return response()->json(['message' => 'Contact not found'], 404);
        }

        $application = VisaApplication::create([
            'contact_id' => $contact->id,
            ...$validated,
            'status' => 'DRAFT',
        ]);

        return response()->json($application, 201);
    }

    public function update(Request $request, $id)
    {
        $user = auth()->user();
        $contact = $user->contact;

        if (! $contact) {
            return response()->json(['message' => 'Contact not found'], 404);
        }

        $application = VisaApplication::where('id', $id)
            ->where('contact_id', $contact->id)
            ->firstOrFail();

        $validated = $request->validate([
            'country' => 'sometimes|string|max:255',
            'visa_type' => 'sometimes|string|max:255',
            'travel_dates_start' => 'nullable|date',
            'travel_dates_end' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $application->update($validated);

        return response()->json($application);
    }
}
