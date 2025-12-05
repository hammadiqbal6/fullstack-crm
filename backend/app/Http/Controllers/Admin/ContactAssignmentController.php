<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\User;
use Illuminate\Http\Request;

class ContactAssignmentController extends Controller
{
    public function assign(Request $request, $id)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $contact = Contact::findOrFail($id);
        $user = User::findOrFail($validated['user_id']);

        // Ensure user is staff
        if (!$user->isStaff()) {
            return response()->json(['message' => 'User must be staff to be assigned contacts'], 400);
        }

        $contact->update(['assigned_to' => $validated['user_id']]);

        return response()->json([
            'message' => 'Contact assigned successfully',
            'contact' => $contact->load('assignedTo'),
        ]);
    }

    public function unassigned()
    {
        $contacts = Contact::whereNull('assigned_to')
            ->with('user')
            ->paginate(20);

        return response()->json($contacts);
    }
}

