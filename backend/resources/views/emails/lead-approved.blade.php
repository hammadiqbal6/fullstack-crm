<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome! Complete Your Onboarding</title>
</head>
<body>
    <h1>Welcome, {{ $lead->full_name }}!</h1>
    <p>Your application has been approved. Please complete your onboarding by clicking the link below:</p>
    <p><a href="{{ $onboardingUrl }}">Complete Onboarding</a></p>
    <p>This link will expire in 24 hours.</p>
    <p>If you did not request this, please ignore this email.</p>
</body>
</html>

