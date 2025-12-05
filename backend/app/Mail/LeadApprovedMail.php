<?php

namespace App\Mail;

use App\Models\Lead;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class LeadApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Lead $lead,
        public string $token
    ) {}

    public function build()
    {
        $onboardingUrl = config('app.frontend_url', 'http://localhost:3000') . '/onboard/' . $this->token;

        return $this->subject('Welcome! Complete Your Onboarding')
            ->view('emails.lead-approved')
            ->with([
                'lead' => $this->lead,
                'onboardingUrl' => $onboardingUrl,
            ]);
    }
}

