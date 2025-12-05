<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show()
    {
        $user = auth()->user();
        $contact = $user->contact;

        if (!$contact) {
            return response()->json(['message' => 'Contact not found'], 404);
        }

        return response()->json([
            'user' => $user,
            'contact' => $contact,
        ]);
    }

    public function update(Request $request)
    {
        $user = auth()->user();
        $contact = $user->contact;

        if (!$contact) {
            return response()->json(['message' => 'Contact not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'company' => 'nullable|string|max:255',
            'target_country' => 'nullable|string',
            'visa_type' => 'nullable|string',
            'intended_travel_date' => 'nullable|date',
            'purpose_of_visit' => 'nullable|string',
            'previous_visa_history' => 'nullable|string',
        ]);

        if (isset($validated['name'])) {
            $user->update(['name' => $validated['name']]);
        }

        $contact->update($validated);

        return response()->json([
            'user' => $user->fresh(),
            'contact' => $contact->fresh(),
        ]);
    }
}

