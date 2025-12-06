'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { auth } from '@/lib/auth';
import { hasAnyRole } from '@/lib/roles';
import DashboardCard from '@/components/DashboardCard';

interface InvoiceItem {
  id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface Contact {
  id: number;
  primary_contact_name: string;
  email: string;
}

export default function CreateInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = auth.getUser();
  const invoiceId = searchParams.get('id');

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactId, setContactId] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<'UNPAID' | 'PAID' | 'VOID' | 'REFUNDED'>('UNPAID');
  const [tax, setTax] = useState(0);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unit_price: 0, total: 0 },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !hasAnyRole(user, ['admin', 'user', 'sales_rep'])) {
      router.push('/dashboard');
      return;
    }

    fetchContacts();

    if (invoiceId) {
      fetchInvoice();
    }
  }, [user, router, invoiceId]);

  const fetchContacts = async () => {
    try {
      const response = await api.get('/contacts');
      setContacts(response.data.data || response.data);
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    }
  };

  const fetchInvoice = async () => {
    try {
      const response = await api.get(`/invoices/${invoiceId}`);
      const invoice = response.data;
      setContactId(invoice.contact_id.toString());
      setIssueDate(invoice.issue_date);
      setDueDate(invoice.due_date);
      setStatus(invoice.status);
      setTax(invoice.tax);
      setNotes(invoice.notes || '');
      setItems(invoice.items || []);
    } catch (err) {
      setError('Failed to load invoice');
    }
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };

    // Recalculate total for this item
    if (field === 'quantity' || field === 'unit_price') {
      updated[index].total = updated[index].quantity * updated[index].unit_price;
    }

    setItems(updated);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + tax;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        contact_id: parseInt(contactId),
        issue_date: issueDate,
        due_date: dueDate,
        status,
        tax,
        notes: notes || null,
        items: items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      };

      if (invoiceId) {
        await api.put(`/invoices/${invoiceId}`, payload);
      } else {
        await api.post('/invoices', payload);
      }

      router.push('/invoices');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {invoiceId ? 'Edit Invoice' : 'Create Invoice'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Create a new invoice for a customer
        </p>
      </div>

      {error && (
        <div className="error-message mb-6">
          <span className="flex-1">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <DashboardCard title="Invoice Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-modern">
                Customer <span className="text-red-500">*</span>
              </label>
              <select
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                className="input-modern"
                required
              >
                <option value="">Select a customer</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.primary_contact_name} ({contact.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-modern">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="input-modern"
                required
              >
                <option value="UNPAID">Unpaid</option>
                <option value="PAID">Paid</option>
                <option value="VOID">Void</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>

            <div>
              <label className="label-modern">
                Issue Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="input-modern"
                required
              />
            </div>

            <div>
              <label className="label-modern">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input-modern"
                required
              />
            </div>
          </div>
        </DashboardCard>

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Line Items</h2>
          <button
            type="button"
            onClick={addItem}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            + Add Item
          </button>
        </div>

        {items.map((item, index) => (
          <DashboardCard
            key={index}
            title={`Item ${index + 1}`}
            action={
              items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                >
                  Remove
                </button>
              )
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="label-modern">
                  Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  className="input-modern"
                  required
                  placeholder="Item description"
                />
              </div>

              <div>
                <label className="label-modern">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                  className="input-modern"
                  required
                />
              </div>

              <div>
                <label className="label-modern">
                  Unit Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unit_price}
                  onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                  className="input-modern"
                  required
                />
              </div>
            </div>

            <div className="mt-3 text-right">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total: </span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(item.total)}
              </span>
            </div>
          </DashboardCard>
        ))}

        <DashboardCard title="Additional Information">
          <div className="space-y-4">
            <div>
              <label className="label-modern">Tax Amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={tax}
                onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                className="input-modern"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="label-modern">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-modern resize-none"
                rows={4}
                placeholder="Additional notes or payment terms (optional)"
              />
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Subtotal:</span>
                    <span className="font-semibold">{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Tax:</span>
                    <span className="font-semibold">{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white border-t border-gray-300 dark:border-gray-600 pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DashboardCard>

        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="btn-primary" style={{ width: 'auto' }}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner"></span>
                Saving...
              </span>
            ) : (
              'Save Invoice'
            )}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
