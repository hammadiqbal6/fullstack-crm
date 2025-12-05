<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use Illuminate\Http\Request;

class LeadController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'company' => 'nullable|string|max:255',
            'message' => 'nullable|string',
            'source' => 'nullable|string|max:255',
        ]);

        $lead = Lead::create([
            ...$validated,
            'status' => 'NEW',
        ]);

        return response()->json($lead, 201);
    }

    public function show($id)
    {
        $lead = Lead::with(['documents', 'approvedBy', 'createdBy'])->findOrFail($id);
        
        // Check permission
        if (!auth()->user()->hasPermission('leads.view')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Staff can only see assigned leads
        if (auth()->user()->isStaff() && !auth()->user()->hasRole('admin')) {
            $contact = $lead->contact;
            if (!$contact || $contact->assigned_to !== auth()->id()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        return response()->json($lead);
    }
}

