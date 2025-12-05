<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Application Update</title>
</head>
<body>
    <h1>Application Update</h1>
    <p>Dear {{ $lead->full_name }},</p>
    <p>We regret to inform you that your application has been reviewed and we are unable to proceed at this time.</p>
    @if($lead->rejection_reason)
    <p><strong>Reason:</strong> {{ $lead->rejection_reason }}</p>
    @endif
    <p>Thank you for your interest.</p>
</body>
</html>

