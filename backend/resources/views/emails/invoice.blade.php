<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice #{{ $invoice->invoice_number }}</title>
</head>
<body>
    <h1>Invoice #{{ $invoice->invoice_number }}</h1>
    <p>Dear {{ $invoice->contact->primary_contact_name }},</p>
    <p>Please find attached your invoice.</p>
    <p><strong>Total Amount:</strong> ${{ number_format($invoice->total, 2) }}</p>
    <p><strong>Due Date:</strong> {{ $invoice->due_date->format('F d, Y') }}</p>
    @if($invoice->notes)
    <p><strong>Notes:</strong> {{ $invoice->notes }}</p>
    @endif
    <p>Thank you for your business.</p>
</body>
</html>

