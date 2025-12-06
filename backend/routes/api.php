<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\OnboardingController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/leads', [LeadController::class, 'store']);

// Onboarding route (public with token)
Route::get('/onboard/{token}', [OnboardingController::class, 'show'])->name('onboard.show');
Route::post('/onboard/{token}', [OnboardingController::class, 'complete']);

// Authentication routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Leads
    Route::get('/leads/{id}', [LeadController::class, 'show']);

    // Admin routes
    Route::prefix('admin')->middleware('role:admin')->group(function () {
        Route::get('/leads', [App\Http\Controllers\Admin\LeadController::class, 'index']);
        Route::post('/leads/{id}/approve', [App\Http\Controllers\Admin\LeadController::class, 'approve']);
        Route::post('/leads/{id}/reject', [App\Http\Controllers\Admin\LeadController::class, 'reject']);

        // Customers (converted leads)
        Route::get('/customers', [App\Http\Controllers\Admin\CustomerController::class, 'index']);
        Route::get('/customers/{id}', [App\Http\Controllers\Admin\CustomerController::class, 'show']);

        // Roles and permissions
        Route::get('/roles', [App\Http\Controllers\Admin\RoleController::class, 'index']);
        Route::get('/permissions', [App\Http\Controllers\Admin\RoleController::class, 'permissions']);
        Route::get('/users/{id}/roles', [App\Http\Controllers\Admin\UserRoleController::class, 'index']);
        Route::post('/users/{id}/roles', [App\Http\Controllers\Admin\UserRoleController::class, 'store']);
        Route::delete('/users/{id}/roles/{roleId}', [App\Http\Controllers\Admin\UserRoleController::class, 'destroy']);

        // Contact assignment
        Route::post('/contacts/{id}/assign', [App\Http\Controllers\Admin\ContactAssignmentController::class, 'assign']);
        Route::get('/contacts/unassigned', [App\Http\Controllers\Admin\ContactAssignmentController::class, 'unassigned']);
    });

    // Contacts
    Route::get('/contacts', [App\Http\Controllers\ContactController::class, 'index']);
    Route::post('/contacts', [App\Http\Controllers\ContactController::class, 'store']);
    Route::get('/contacts/{id}', [App\Http\Controllers\ContactController::class, 'show']);
    Route::put('/contacts/{id}', [App\Http\Controllers\ContactController::class, 'update']);
    Route::delete('/contacts/{id}', [App\Http\Controllers\ContactController::class, 'destroy']);

    // Customer routes
    Route::prefix('customer')->middleware('role:customer')->group(function () {
        Route::get('/profile', [App\Http\Controllers\Customer\ProfileController::class, 'show']);
        Route::put('/profile', [App\Http\Controllers\Customer\ProfileController::class, 'update']);
        Route::get('/documents', [App\Http\Controllers\Customer\DocumentController::class, 'index']);
        Route::post('/documents', [App\Http\Controllers\Customer\DocumentController::class, 'store']);
        Route::delete('/documents/{id}', [App\Http\Controllers\Customer\DocumentController::class, 'destroy']);
        Route::get('/questionnaires', [App\Http\Controllers\Customer\QuestionnaireController::class, 'index']);
        Route::get('/questionnaires/{id}', [App\Http\Controllers\Customer\QuestionnaireController::class, 'show']);
        Route::post('/questionnaires/{id}/responses', [App\Http\Controllers\Customer\QuestionnaireController::class, 'storeResponse']);
        Route::get('/visa-applications', [App\Http\Controllers\Customer\VisaApplicationController::class, 'index']);
        Route::post('/visa-applications', [App\Http\Controllers\Customer\VisaApplicationController::class, 'store']);
        Route::put('/visa-applications/{id}', [App\Http\Controllers\Customer\VisaApplicationController::class, 'update']);
        Route::get('/invoices', [App\Http\Controllers\InvoiceController::class, 'index']);
    });

    // Questionnaires
    Route::get('/questionnaires', [App\Http\Controllers\QuestionnaireController::class, 'index']);
    Route::post('/questionnaires', [App\Http\Controllers\QuestionnaireController::class, 'store']);
    Route::get('/questionnaires/{id}', [App\Http\Controllers\QuestionnaireController::class, 'show']);
    Route::put('/questionnaires/{id}', [App\Http\Controllers\QuestionnaireController::class, 'update']);
    Route::delete('/questionnaires/{id}', [App\Http\Controllers\QuestionnaireController::class, 'destroy']);

    // Visa Applications
    Route::get('/contacts/{id}/visa-applications', [App\Http\Controllers\VisaApplicationController::class, 'index']);
    Route::put('/visa-applications/{id}', [App\Http\Controllers\VisaApplicationController::class, 'update']);
    Route::post('/visa-applications/{id}/submit', [App\Http\Controllers\VisaApplicationController::class, 'submit']);

    // Invoices
    Route::post('/invoices', [App\Http\Controllers\InvoiceController::class, 'store']);
    Route::get('/invoices/{id}', [App\Http\Controllers\InvoiceController::class, 'show']);
    Route::put('/invoices/{id}', [App\Http\Controllers\InvoiceController::class, 'update']);
    Route::post('/invoices/{id}/items', [App\Http\Controllers\InvoiceController::class, 'addItem']);
    Route::put('/invoices/{id}/items/{itemId}', [App\Http\Controllers\InvoiceController::class, 'updateItem']);
    Route::post('/invoices/{id}/send', [App\Http\Controllers\InvoiceController::class, 'send']);

    // Files
    Route::post('/uploads', [App\Http\Controllers\FileController::class, 'store']);
    Route::get('/uploads/{id}', [App\Http\Controllers\FileController::class, 'show']);
});
