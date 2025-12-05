<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::with('permissions')->get();

        return response()->json($roles);
    }

    public function permissions()
    {
        $permissions = Permission::all();

        return response()->json($permissions);
    }
}
