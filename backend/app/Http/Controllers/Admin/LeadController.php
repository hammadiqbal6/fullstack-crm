<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class LeadController extends Controller
{
    public function index(Request $request)
    {
        $query = Lead::with(['approvedBy', 'createdBy', 'contact']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('company', 'like', "%{$search}%");
            });
        }

        $leads = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($leads);
    }

    public function approve(Request $request, $id)
    {
        $lead = Lead::findOrFail($id);

        if ($lead->status !== 'NEW' && $lead->status !== 'UNDER_REVIEW') {
            return response()->json(['message' => 'Lead cannot be approved'], 400);
        }

        // Generate secure token
        $token = Str::random(64);
        $hashedToken = Hash::make($token);

        $lead->update([
            'status' => 'APPROVED',
            'onboarding_token' => $hashedToken,
            'onboarding_expires_at' => Carbon::now()->addHours(24),
            'approved_by' => auth()->id(),
            'approved_at' => Carbon::now(),
        ]);

        // Send email with onboarding link
        \Illuminate\Support\Facades\Mail::to($lead->email)
            ->queue(new \App\Mail\LeadApprovedMail($lead, $token));

        return response()->json([
            'message' => 'Lead approved successfully',
            'lead' => $lead,
            'onboarding_token' => $token, // Return token for testing
        ]);
    }

    public function reject(Request $request, $id)
    {
        $lead = Lead::findOrFail($id);

        $validated = $request->validate([
            'rejection_reason' => 'nullable|string',
        ]);

        $lead->update([
            'status' => 'REJECTED',
            'rejection_reason' => $validated['rejection_reason'] ?? null,
            'rejected_at' => Carbon::now(),
        ]);

        // Send rejection email
        \Illuminate\Support\Facades\Mail::to($lead->email)
            ->queue(new \App\Mail\LeadRejectedMail($lead));

        return response()->json([
            'message' => 'Lead rejected successfully',
            'lead' => $lead,
        ]);
    }
}
