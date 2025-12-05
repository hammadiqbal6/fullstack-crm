<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\User;
use App\Models\Contact;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class OnboardingController extends Controller
{
    public function show($token)
    {
        // Find lead by checking if token matches (stored as hashed)
        $lead = Lead::whereNotNull('onboarding_token')->get()->first(function ($lead) use ($token) {
            return Hash::check($token, $lead->onboarding_token);
        });

        if (!$lead) {
            return response()->json(['message' => 'Invalid token'], 404);
        }

        if ($lead->onboarding_expires_at && $lead->onboarding_expires_at->isPast()) {
            return response()->json(['message' => 'Token has expired'], 410);
        }

        if ($lead->status !== 'APPROVED') {
            return response()->json(['message' => 'Lead not approved'], 403);
        }

        return response()->json([
            'lead' => $lead,
            'token' => $token,
        ]);
    }

    public function complete(Request $request, $token)
    {
        // Find lead by checking if token matches (stored as hashed)
        $lead = Lead::whereNotNull('onboarding_token')->get()->first(function ($lead) use ($token) {
            return Hash::check($token, $lead->onboarding_token);
        });

        if (!$lead) {
            return response()->json(['message' => 'Invalid token'], 404);
        }

        if ($lead->onboarding_expires_at && $lead->onboarding_expires_at->isPast()) {
            return response()->json(['message' => 'Token has expired'], 410);
        }

        if ($lead->status !== 'APPROVED') {
            return response()->json(['message' => 'Lead not approved'], 403);
        }

        $validated = $request->validate([
            'password' => 'required|min:8|confirmed',
            'company' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
        ]);

        // Create user
        $user = User::create([
            'name' => $lead->full_name,
            'email' => $lead->email,
            'password' => Hash::make($validated['password']),
            'lead_id' => $lead->id,
            'is_active' => true,
        ]);

        // Assign CUSTOMER role
        $customerRole = Role::where('slug', 'customer')->first();
        if ($customerRole) {
            $user->roles()->attach($customerRole->id);
        }

        // Create contact
        $contact = Contact::create([
            'user_id' => $user->id,
            'lead_id' => $lead->id,
            'primary_contact_name' => $lead->full_name,
            'email' => $lead->email,
            'phone' => $validated['phone'] ?? $lead->phone,
            'company' => $validated['company'] ?? $lead->company,
            'address' => $validated['address'] ?? null,
        ]);

        // Update lead
        $lead->update([
            'status' => 'CONVERTED',
            'onboarding_token' => null,
            'onboarding_expires_at' => null,
        ]);

        // Generate token for immediate login
        $authToken = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Onboarding completed successfully',
            'user' => $user->load('roles', 'contact'),
            'token' => $authToken,
        ], 201);
    }
}

