'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getPrimaryRole } from '@/lib/roles';
import DashboardCard from '@/components/DashboardCard';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(auth.getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.getUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    setLoading(false);
  }, [router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  const primaryRole = getPrimaryRole(user);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome back, {user.name}!
        </p>
      </div>

      <div className="dashboard-grid">
        {/* Admin Dashboard */}
        {primaryRole === 'admin' && (
          <>
            <DashboardCard title="Leads Overview">
              <div className="space-y-4">
                <div className="stat-item">
                  <p className="stat-label">Total Leads</p>
                  <p className="stat-value">-</p>
                </div>
                <Link href="/leads" className="btn-primary text-center block">
                  Manage Leads
                </Link>
              </div>
            </DashboardCard>

            <DashboardCard title="Quick Stats">
              <div className="space-y-3">
                <div className="stat-row">
                  <span className="text-sm text-gray-600 dark:text-gray-400">New Leads</span>
                  <span className="font-semibold">-</span>
                </div>
                <div className="stat-row">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Under Review</span>
                  <span className="font-semibold">-</span>
                </div>
                <div className="stat-row">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Approved</span>
                  <span className="font-semibold">-</span>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard title="Recent Activity">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No recent activity
              </p>
            </DashboardCard>
          </>
        )}

        {/* Staff Dashboard (user, sales_rep) */}
        {(primaryRole === 'user' || primaryRole === 'sales_rep') && (
          <>
            <DashboardCard title="My Contacts">
              <div className="space-y-4">
                <div className="stat-item">
                  <p className="stat-label">Assigned Contacts</p>
                  <p className="stat-value">-</p>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard title="Questionnaires">
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage customer questionnaires
                </p>
                <Link href="/questionnaires" className="btn-primary text-center block">
                  View Questionnaires
                </Link>
              </div>
            </DashboardCard>

            <DashboardCard title="Invoices">
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage customer invoices
                </p>
                <Link href="/invoices" className="btn-primary text-center block">
                  View Invoices
                </Link>
              </div>
            </DashboardCard>
          </>
        )}

        {/* Viewer Dashboard */}
        {primaryRole === 'viewer' && (
          <>
            <DashboardCard title="Analytics">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View-only access to system data
              </p>
            </DashboardCard>

            <DashboardCard title="Reports">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Access system reports
              </p>
            </DashboardCard>
          </>
        )}

        {/* Customer Dashboard */}
        {primaryRole === 'customer' && (
          <>
            <DashboardCard title="My Profile">
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage your profile information
                </p>
                <Link href="/customer/profile" className="btn-primary text-center block">
                  View Profile
                </Link>
              </div>
            </DashboardCard>

            <DashboardCard title="Questionnaires">
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Complete required questionnaires
                </p>
                <Link href="/questionnaires" className="btn-primary text-center block">
                  View Questionnaires
                </Link>
              </div>
            </DashboardCard>

            <DashboardCard title="Invoices">
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  View your invoices and payment status
                </p>
                <Link href="/invoices" className="btn-primary text-center block">
                  View Invoices
                </Link>
              </div>
            </DashboardCard>
          </>
        )}
      </div>
    </div>
  );
}
