'use client';

import { ReactNode } from 'react';
import Sidebar from '@/components/Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * Shared layout for all protected routes
 * This layout provides the sidebar navigation and main content area
 * Used by: /dashboard, /leads, /questionnaires, /invoices, /customer
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
}
