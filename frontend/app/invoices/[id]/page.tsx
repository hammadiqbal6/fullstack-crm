'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { auth } from '@/lib/auth';
import { hasAnyRole } from '@/lib/roles';
import DashboardCard from '@/components/DashboardCard';

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface Invoice {
  id: number;
  invoice_number: string;
  contact: {
    id: number;
    primary_contact_name: string;
    email: string;
    phone: string;
    company: string;
  };
  issue_date: string;
  due_date: string;
  status: 'UNPAID' | 'PAID' | 'VOID' | 'REFUNDED';
  subtotal: number;
  tax: number;
  total: number;
  notes: string | null;
  items: InvoiceItem[];
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const user = auth.getUser();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isStaff = user && hasAnyRole(user, ['admin', 'user', 'sales_rep']);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchInvoice();
  }, [user, router, invoiceId]);

  const fetchInvoice = async () => {
    try {
      const endpoint = isStaff ? `/invoices/${invoiceId}` : `/customer/invoices/${invoiceId}`;
      const response = await api.get(endpoint);
      setInvoice(response.data);
    } catch (err) {
      console.error('Failed to fetch invoice:', err);
      setError('Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!confirm(`Are you sure you want to mark this invoice as ${newStatus}?`)) return;

    try {
      await api.put(`/invoices/${invoiceId}`, { status: newStatus });
      fetchInvoice();
    } catch (err) {
      alert('Failed to update invoice status');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PAID: 'badge-success',
      UNPAID: 'badge-warning',
      VOID: 'badge-error',
      REFUNDED: 'badge-info',
    };
    return badges[status as keyof typeof badges] || 'badge-info';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="dashboard-container">
        <div className="error-message">Invoice not found</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header print:hidden">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Invoice {invoice.invoice_number}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {isStaff ? `For ${invoice.contact.primary_contact_name}` : 'Invoice Details'}
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={handlePrint} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600">
              Print / Download
            </button>
            {isStaff && invoice.status === 'UNPAID' && (
              <button
                onClick={() => handleStatusChange('PAID')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
              >
                Mark as Paid
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message mb-6 print:hidden">
          <span className="flex-1">{error}</span>
        </div>
      )}

      {/* Invoice Document */}
      <div className="card p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">INVOICE</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">#{invoice.invoice_number}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Issue Date</p>
            <p className="font-semibold text-gray-900 dark:text-white">{formatDate(invoice.issue_date)}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Due Date</p>
            <p className="font-semibold text-gray-900 dark:text-white">{formatDate(invoice.due_date)}</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-8">
          <span className={`badge ${getStatusBadge(invoice.status)} text-base px-4 py-2`}>
            {invoice.status}
          </span>
        </div>

        {/* Bill To */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
            Bill To
          </h3>
          <div className="text-gray-900 dark:text-white">
            <p className="font-semibold text-lg">{invoice.contact.primary_contact_name}</p>
            {invoice.contact.company && <p className="text-gray-600 dark:text-gray-400">{invoice.contact.company}</p>}
            <p className="text-gray-600 dark:text-gray-400">{invoice.contact.email}</p>
            {invoice.contact.phone && <p className="text-gray-600 dark:text-gray-400">{invoice.contact.phone}</p>}
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                <th className="text-left py-3 text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Description
                </th>
                <th className="text-center py-3 text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Qty
                </th>
                <th className="text-right py-3 text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Unit Price
                </th>
                <th className="text-right py-3 text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-4 text-gray-900 dark:text-white">{item.description}</td>
                  <td className="py-4 text-center text-gray-900 dark:text-white">{item.quantity}</td>
                  <td className="py-4 text-right text-gray-900 dark:text-white">
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td className="py-4 text-right font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-2 text-gray-700 dark:text-gray-300">
              <span>Subtotal:</span>
              <span className="font-semibold">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between py-2 text-gray-700 dark:text-gray-300">
              <span>Tax:</span>
              <span className="font-semibold">{formatCurrency(invoice.tax)}</span>
            </div>
            <div className="flex justify-between py-3 border-t-2 border-gray-300 dark:border-gray-600 text-lg font-bold text-gray-900 dark:text-white">
              <span>Total:</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
              Notes
            </h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-4 print:hidden">
        <button onClick={() => router.back()} className="btn-primary" style={{ width: 'auto' }}>
          Back to Invoices
        </button>
        {isStaff && (
          <button
            onClick={() => router.push(`/invoices/create?id=${invoiceId}`)}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Edit Invoice
          </button>
        )}
      </div>
    </div>
  );
}
