<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\VisaApplication;
use Illuminate\Http\Request;

class VisaApplicationController extends Controller
{
    public function index($contactId)
    {
        $contact = Contact::findOrFail($contactId);

        // Check access
        $user = auth()->user();
        if ($user->hasRole('admin')) {
            // Admin can see all
        } elseif ($user->isStaff() && $contact->assigned_to !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        } else {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $applications = $contact->visaApplications;

        return response()->json($applications);
    }

    public function update(Request $request, $id)
    {
        $application = VisaApplication::with('contact')->findOrFail($id);
        $user = auth()->user();

        // Check access
        if ($user->hasRole('admin')) {
            // Admin can update all
        } elseif ($user->isStaff() && $application->contact->assigned_to !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        } else {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'country' => 'sometimes|string|max:255',
            'visa_type' => 'sometimes|string|max:255',
            'travel_dates_start' => 'nullable|date',
            'travel_dates_end' => 'nullable|date',
            'status' => 'sometimes|in:DRAFT,SUBMITTED,UNDER_REVIEW,APPROVED,REJECTED',
            'notes' => 'nullable|string',
        ]);

        $application->update($validated);

        return response()->json($application);
    }

    public function submit($id)
    {
        $application = VisaApplication::findOrFail($id);

        if ($application->status !== 'DRAFT') {
            return response()->json(['message' => 'Application can only be submitted from DRAFT status'], 400);
        }

        $application->update([
            'status' => 'SUBMITTED',
            'application_date' => now(),
        ]);

        return response()->json($application);
    }
}
