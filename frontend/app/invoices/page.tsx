'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { auth } from '@/lib/auth';
import { hasAnyRole } from '@/lib/roles';
import DashboardCard from '@/components/DashboardCard';

interface Invoice {
  id: number;
  invoice_number: string;
  contact: {
    id: number;
    primary_contact_name: string;
    email: string;
  };
  issue_date: string;
  due_date: string;
  status: 'UNPAID' | 'PAID' | 'VOID' | 'REFUNDED';
  total: number;
  subtotal: number;
  tax: number;
}

export default function InvoicesPage() {
  const router = useRouter();
  const user = auth.getUser();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isStaff = user && hasAnyRole(user, ['admin', 'user', 'sales_rep']);
  const isCustomer = user && hasAnyRole(user, ['customer']);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchInvoices();
  }, [user, router]);

  const fetchInvoices = async () => {
    try {
      const endpoint = isCustomer ? '/customer/invoices' : '/invoices';
      const response = await api.get(endpoint);
      setInvoices(response.data.data || response.data);
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
      setError('Failed to load invoices');
    } finally {
      setLoading(false);
    }
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Invoices</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {isStaff ? 'Manage customer invoices' : 'View your invoices'}
            </p>
          </div>
          {isStaff && (
            <Link href="/invoices/create" className="btn-primary" style={{ width: 'auto' }}>
              Create Invoice
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message mb-6">
          <span className="flex-1">{error}</span>
        </div>
      )}

      {invoices.length === 0 ? (
        <DashboardCard title="No Invoices">
          <p className="text-gray-600 dark:text-gray-400">
            {isStaff
              ? 'No invoices created yet. Click "Create Invoice" to get started.'
              : 'No invoices available at this time.'}
          </p>
        </DashboardCard>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Invoice #
                  </th>
                  {isStaff && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Customer
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Issue Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {invoice.invoice_number}
                    </td>
                    {isStaff && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        <div>
                          <div className="font-medium">{invoice.contact.primary_contact_name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{invoice.contact.email}</div>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {formatDate(invoice.issue_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {formatDate(invoice.due_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(invoice.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${getStatusBadge(invoice.status)}`}>{invoice.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
