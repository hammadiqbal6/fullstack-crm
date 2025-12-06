<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    /**
     * Get all customers (users with customer role)
     */
    public function index(Request $request)
    {
        $query = User::whereHas('roles', function ($q) {
            $q->where('slug', 'customer');
        })->with(['roles', 'lead']);

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $customers = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($customers);
    }

    /**
     * Get a specific customer
     */
    public function show($id)
    {
        $customer = User::whereHas('roles', function ($q) {
            $q->where('slug', 'customer');
        })->with(['roles', 'lead', 'documents', 'visaApplications'])->findOrFail($id);

        return response()->json($customer);
    }
}
