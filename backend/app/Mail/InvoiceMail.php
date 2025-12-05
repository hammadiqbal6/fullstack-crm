<?php

namespace App\Mail;

use App\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class InvoiceMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Invoice $invoice) {}

    public function build()
    {
        return $this->subject('Invoice #'.$this->invoice->invoice_number)
            ->view('emails.invoice')
            ->with(['invoice' => $this->invoice])
            ->attach(storage_path('app/public/invoices/'.$this->invoice->id.'.pdf'), [
                'as' => 'invoice-'.$this->invoice->invoice_number.'.pdf',
                'mime' => 'application/pdf',
            ]);
    }
}
