<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // Leads
            ['name' => 'View Leads', 'slug' => 'leads.view', 'description' => 'View leads'],
            ['name' => 'Create Leads', 'slug' => 'leads.create', 'description' => 'Create new leads'],
            ['name' => 'Update Leads', 'slug' => 'leads.update', 'description' => 'Update leads'],
            ['name' => 'Delete Leads', 'slug' => 'leads.delete', 'description' => 'Delete leads'],
            ['name' => 'Approve Leads', 'slug' => 'leads.approve', 'description' => 'Approve leads'],
            ['name' => 'Reject Leads', 'slug' => 'leads.reject', 'description' => 'Reject leads'],

            // Contacts
            ['name' => 'View Contacts', 'slug' => 'contacts.view', 'description' => 'View contacts'],
            ['name' => 'Create Contacts', 'slug' => 'contacts.create', 'description' => 'Create new contacts'],
            ['name' => 'Update Contacts', 'slug' => 'contacts.update', 'description' => 'Update contacts'],
            ['name' => 'Delete Contacts', 'slug' => 'contacts.delete', 'description' => 'Delete contacts'],
            ['name' => 'Assign Contacts to Staff', 'slug' => 'contacts.assign', 'description' => 'Assign contacts to staff'],

            // Customers
            ['name' => 'View Own Profile', 'slug' => 'customers.view_own', 'description' => 'View own customer profile'],
            ['name' => 'Update Own Profile', 'slug' => 'customers.update_own', 'description' => 'Update own customer profile'],
            ['name' => 'Upload Documents', 'slug' => 'customers.upload_documents', 'description' => 'Upload documents'],

            // Questionnaires
            ['name' => 'View Questionnaires', 'slug' => 'questionnaires.view', 'description' => 'View questionnaires'],
            ['name' => 'Create Questionnaires', 'slug' => 'questionnaires.create', 'description' => 'Create questionnaires'],
            ['name' => 'Update Questionnaires', 'slug' => 'questionnaires.update', 'description' => 'Update questionnaires'],
            ['name' => 'Complete Questionnaires', 'slug' => 'questionnaires.complete', 'description' => 'Complete questionnaires'],

            // Visa Applications
            ['name' => 'View Visa Applications', 'slug' => 'visa_applications.view', 'description' => 'View visa applications'],
            ['name' => 'Create Visa Applications', 'slug' => 'visa_applications.create', 'description' => 'Create visa applications'],
            ['name' => 'Update Visa Applications', 'slug' => 'visa_applications.update', 'description' => 'Update visa applications'],

            // Invoices
            ['name' => 'View Invoices', 'slug' => 'invoices.view', 'description' => 'View invoices'],
            ['name' => 'Create Invoices', 'slug' => 'invoices.create', 'description' => 'Create invoices'],
            ['name' => 'Update Invoices', 'slug' => 'invoices.update', 'description' => 'Update invoices'],
            ['name' => 'Delete Invoices', 'slug' => 'invoices.delete', 'description' => 'Delete invoices'],
            ['name' => 'Send Invoices', 'slug' => 'invoices.send', 'description' => 'Send invoices via email'],

            // Users
            ['name' => 'View Users', 'slug' => 'users.view', 'description' => 'View users'],
            ['name' => 'Create Users', 'slug' => 'users.create', 'description' => 'Create users'],
            ['name' => 'Update Users', 'slug' => 'users.update', 'description' => 'Update users'],
            ['name' => 'Delete Users', 'slug' => 'users.delete', 'description' => 'Delete users'],
            ['name' => 'Assign Roles', 'slug' => 'users.assign_roles', 'description' => 'Assign roles to users'],
            ['name' => 'Assign Contacts to Users', 'slug' => 'users.assign_contacts', 'description' => 'Assign contacts to users'],

            // Files
            ['name' => 'Upload Files', 'slug' => 'files.upload', 'description' => 'Upload files'],
            ['name' => 'Download Files', 'slug' => 'files.download', 'description' => 'Download files'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['slug' => $permission['slug']], $permission);
        }
    }
}
