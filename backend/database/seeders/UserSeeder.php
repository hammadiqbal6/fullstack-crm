<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Get roles
        $adminRole = Role::where('slug', 'admin')->first();
        $userRole = Role::where('slug', 'user')->first();
        $salesRepRole = Role::where('slug', 'sales_rep')->first();
        $viewerRole = Role::where('slug', 'viewer')->first();
        $customerRole = Role::where('slug', 'customer')->first();

        // Admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@crm.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'is_active' => true,
            ]
        );
        if ($adminRole && !$admin->hasRole('admin')) {
            $admin->roles()->attach($adminRole->id);
        }

        // Staff user
        $staff = User::firstOrCreate(
            ['email' => 'staff@crm.com'],
            [
                'name' => 'Staff User',
                'password' => Hash::make('password'),
                'is_active' => true,
            ]
        );
        if ($userRole && !$staff->hasRole('user')) {
            $staff->roles()->attach($userRole->id);
        }

        // Sales Rep user
        $salesRep = User::firstOrCreate(
            ['email' => 'sales@crm.com'],
            [
                'name' => 'Sales Representative',
                'password' => Hash::make('password'),
                'is_active' => true,
            ]
        );
        if ($salesRepRole && !$salesRep->hasRole('sales_rep')) {
            $salesRep->roles()->attach($salesRepRole->id);
        }

        // Viewer user
        $viewer = User::firstOrCreate(
            ['email' => 'viewer@crm.com'],
            [
                'name' => 'Viewer User',
                'password' => Hash::make('password'),
                'is_active' => true,
            ]
        );
        if ($viewerRole && !$viewer->hasRole('viewer')) {
            $viewer->roles()->attach($viewerRole->id);
        }

        // Customer user
        $customer = User::firstOrCreate(
            ['email' => 'customer@crm.com'],
            [
                'name' => 'Customer User',
                'password' => Hash::make('password'),
                'is_active' => true,
            ]
        );
        if ($customerRole && !$customer->hasRole('customer')) {
            $customer->roles()->attach($customerRole->id);
        }
    }
}
