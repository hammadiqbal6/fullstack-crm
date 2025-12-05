<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'Admin', 'slug' => 'admin', 'description' => 'Full system access'],
            ['name' => 'User', 'slug' => 'user', 'description' => 'Staff member - manages assigned contacts'],
            ['name' => 'Sales Rep', 'slug' => 'sales_rep', 'description' => 'Sales representative access'],
            ['name' => 'Viewer', 'slug' => 'viewer', 'description' => 'Read-only access'],
            ['name' => 'Customer', 'slug' => 'customer', 'description' => 'Converted lead - can only access own profile'],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['slug' => $role['slug']], $role);
        }
    }
}
