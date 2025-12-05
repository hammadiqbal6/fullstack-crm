<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Contact;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = Invoice::with(['contact', 'items']);

        if ($user->hasRole('admin')) {
            // Admin sees all
        } elseif ($user->isStaff()) {
            $query->whereHas('contact', function ($q) use ($user) {
                $q->where('assigned_to', $user->id);
            });
        } elseif ($user->isCustomer()) {
            $query->whereHas('contact', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        $invoices = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($invoices);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'contact_id' => 'required|exists:contacts,id',
            'issue_date' => 'required|date',
            'due_date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $contact = Contact::findOrFail($validated['contact_id']);

        // Check access
        $user = auth()->user();
        if ($user->hasRole('admin')) {
            // Admin can create for any contact
        } elseif ($user->isStaff() && $contact->assigned_to !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        } else {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $invoice = Invoice::create([
            'contact_id' => $validated['contact_id'],
            'invoice_number' => Invoice::generateInvoiceNumber(),
            'issue_date' => $validated['issue_date'],
            'due_date' => $validated['due_date'],
            'notes' => $validated['notes'] ?? null,
            'subtotal' => 0,
            'tax' => 0,
            'total' => 0,
        ]);

        $subtotal = 0;
        foreach ($validated['items'] as $itemData) {
            $total = $itemData['quantity'] * $itemData['unit_price'];
            $subtotal += $total;

            $invoice->items()->create([
                'description' => $itemData['description'],
                'quantity' => $itemData['quantity'],
                'unit_price' => $itemData['unit_price'],
                'total' => $total,
            ]);
        }

        $invoice->update([
            'subtotal' => $subtotal,
            'total' => $subtotal, // Tax can be added later
        ]);

        return response()->json($invoice->load('items'), 201);
    }

    public function show($id)
    {
        $invoice = Invoice::with(['contact', 'items'])->findOrFail($id);
        
        // Check access
        $user = auth()->user();
        if ($user->hasRole('admin')) {
            // Admin can see all
        } elseif ($user->isStaff() && $invoice->contact->assigned_to !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        } elseif ($user->isCustomer() && $invoice->contact->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($invoice);
    }

    public function update(Request $request, $id)
    {
        $invoice = Invoice::with('contact')->findOrFail($id);
        
        // Check access
        $user = auth()->user();
        if ($user->hasRole('admin')) {
            // Admin can update all
        } elseif ($user->isStaff() && $invoice->contact->assigned_to !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        } else {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'issue_date' => 'sometimes|date',
            'due_date' => 'sometimes|date',
            'status' => 'sometimes|in:UNPAID,PAID,VOID,REFUNDED',
            'notes' => 'nullable|string',
        ]);

        $invoice->update($validated);

        return response()->json($invoice->load('items'));
    }

    public function addItem(Request $request, $id)
    {
        $invoice = Invoice::findOrFail($id);
        
        $validated = $request->validate([
            'description' => 'required|string',
            'quantity' => 'required|integer|min:1',
            'unit_price' => 'required|numeric|min:0',
        ]);

        $total = $validated['quantity'] * $validated['unit_price'];
        $item = $invoice->items()->create([
            ...$validated,
            'total' => $total,
        ]);

        // Recalculate invoice totals
        $subtotal = $invoice->items->sum('total');
        $invoice->update([
            'subtotal' => $subtotal,
            'total' => $subtotal,
        ]);

        return response()->json($item, 201);
    }

    public function updateItem(Request $request, $id, $itemId)
    {
        $invoice = Invoice::findOrFail($id);
        $item = $invoice->items()->findOrFail($itemId);

        $validated = $request->validate([
            'description' => 'sometimes|string',
            'quantity' => 'sometimes|integer|min:1',
            'unit_price' => 'sometimes|numeric|min:0',
        ]);

        if (isset($validated['quantity']) || isset($validated['unit_price'])) {
            $quantity = $validated['quantity'] ?? $item->quantity;
            $unitPrice = $validated['unit_price'] ?? $item->unit_price;
            $validated['total'] = $quantity * $unitPrice;
        }

        $item->update($validated);

        // Recalculate invoice totals
        $subtotal = $invoice->items->sum('total');
        $invoice->update([
            'subtotal' => $subtotal,
            'total' => $subtotal,
        ]);

        return response()->json($item);
    }

    public function send($id)
    {
        $invoice = Invoice::with(['contact', 'items'])->findOrFail($id);
        
        // TODO: Implement PDF generation and email sending job
        // dispatch(new \App\Jobs\SendInvoiceEmailJob($invoice));

        return response()->json(['message' => 'Invoice queued for sending']);
    }
}

