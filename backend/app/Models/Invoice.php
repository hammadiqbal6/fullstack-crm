<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'contact_id',
        'invoice_number',
        'issue_date',
        'due_date',
        'status',
        'subtotal',
        'tax',
        'total',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'issue_date' => 'date',
            'due_date' => 'date',
            'subtotal' => 'decimal:2',
            'tax' => 'decimal:2',
            'total' => 'decimal:2',
        ];
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    public function items()
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public static function generateInvoiceNumber(): string
    {
        $year = Carbon::now()->year;
        $month = Carbon::now()->format('m');

        $lastInvoice = self::whereYear('created_at', $year)
            ->whereMonth('created_at', Carbon::now()->month)
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastInvoice ? ((int) substr($lastInvoice->invoice_number, -4)) + 1 : 1;

        return sprintf('INV-%s-%s-%04d', $year, $month, $sequence);
    }
}
