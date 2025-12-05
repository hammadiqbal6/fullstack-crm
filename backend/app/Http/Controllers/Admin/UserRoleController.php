<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserRoleController extends Controller
{
    public function index($id)
    {
        $user = User::with('roles')->findOrFail($id);
        return response()->json($user->roles);
    }

    public function store(Request $request, $id)
    {
        $validated = $request->validate([
            'role_ids' => 'required|array',
            'role_ids.*' => 'exists:roles,id',
        ]);

        $user = User::findOrFail($id);
        $user->roles()->sync($validated['role_ids']);

        return response()->json([
            'message' => 'Roles assigned successfully',
            'roles' => $user->load('roles')->roles,
        ]);
    }

    public function destroy($id, $roleId)
    {
        $user = User::findOrFail($id);
        $user->roles()->detach($roleId);

        return response()->json(['message' => 'Role removed successfully']);
    }
}

