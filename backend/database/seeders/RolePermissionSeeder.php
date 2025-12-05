<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $admin = Role::where('slug', 'admin')->first();
        $user = Role::where('slug', 'user')->first();
        $salesRep = Role::where('slug', 'sales_rep')->first();
        $viewer = Role::where('slug', 'viewer')->first();
        $customer = Role::where('slug', 'customer')->first();

        // Admin gets all permissions
        if ($admin) {
            $admin->permissions()->sync(Permission::pluck('id'));
        }

        // User (Staff) permissions
        if ($user) {
            $userPermissions = Permission::whereIn('slug', [
                'leads.view',
                'contacts.view',
                'contacts.update',
                'contacts.create',
                'questionnaires.view',
                'questionnaires.update',
                'visa_applications.view',
                'visa_applications.update',
                'invoices.view',
                'invoices.create',
                'invoices.update',
                'invoices.send',
                'files.upload',
                'files.download',
            ])->pluck('id');
            $user->permissions()->sync($userPermissions);
        }

        // Sales Rep permissions
        if ($salesRep) {
            $salesRepPermissions = Permission::whereIn('slug', [
                'leads.view',
                'contacts.view',
                'contacts.update',
                'visa_applications.view',
                'invoices.view',
                'invoices.create',
                'files.download',
            ])->pluck('id');
            $salesRep->permissions()->sync($salesRepPermissions);
        }

        // Viewer permissions (read-only)
        if ($viewer) {
            $viewerPermissions = Permission::whereIn('slug', [
                'leads.view',
                'contacts.view',
                'questionnaires.view',
                'visa_applications.view',
                'invoices.view',
                'files.download',
            ])->pluck('id');
            $viewer->permissions()->sync($viewerPermissions);
        }

        // Customer permissions
        if ($customer) {
            $customerPermissions = Permission::whereIn('slug', [
                'customers.view_own',
                'customers.update_own',
                'customers.upload_documents',
                'questionnaires.view',
                'questionnaires.complete',
                'visa_applications.view',
                'visa_applications.create',
                'visa_applications.update',
                'invoices.view',
                'files.upload',
                'files.download',
            ])->pluck('id');
            $customer->permissions()->sync($customerPermissions);
        }
    }
}
