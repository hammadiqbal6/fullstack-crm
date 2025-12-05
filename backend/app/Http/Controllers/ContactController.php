<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = Contact::with(['user', 'assignedTo', 'visaApplications']);

        // Role-based filtering
        if ($user->hasRole('admin')) {
            // Admin sees all
        } elseif ($user->isStaff()) {
            // Staff sees only assigned contacts
            $query->where('assigned_to', $user->id);
        } elseif ($user->isCustomer()) {
            // Customer sees only own contact
            $query->where('user_id', $user->id);
        } else {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $contacts = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($contacts);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'primary_contact_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'company' => 'nullable|string|max:255',
            'address' => 'nullable|string',
        ]);

        $contact = Contact::create($validated);

        return response()->json($contact, 201);
    }

    public function show($id)
    {
        $contact = Contact::with(['user', 'assignedTo', 'visaApplications', 'invoices', 'questionnaireResponses'])
            ->findOrFail($id);

        $user = auth()->user();

        // Check access
        if ($user->hasRole('admin')) {
            // Admin can see all
        } elseif ($user->isStaff() && $contact->assigned_to !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        } elseif ($user->isCustomer() && $contact->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($contact);
    }

    public function update(Request $request, $id)
    {
        $contact = Contact::findOrFail($id);
        $user = auth()->user();

        // Check access
        if ($user->hasRole('admin')) {
            // Admin can update all
        } elseif ($user->isStaff() && $contact->assigned_to !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        } elseif ($user->isCustomer() && $contact->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'primary_contact_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255',
            'phone' => 'nullable|string|max:20',
            'company' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'target_country' => 'nullable|string',
            'visa_type' => 'nullable|string',
            'intended_travel_date' => 'nullable|date',
            'purpose_of_visit' => 'nullable|string',
            'previous_visa_history' => 'nullable|string',
        ]);

        $contact->update($validated);

        return response()->json($contact->load('user', 'assignedTo'));
    }

    public function destroy($id)
    {
        $contact = Contact::findOrFail($id);

        if (!auth()->user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $contact->delete();

        return response()->json(['message' => 'Contact deleted successfully']);
    }
}

