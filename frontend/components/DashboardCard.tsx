'use client';

import { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export default function DashboardCard({ 
  title, 
  children, 
  className = '',
  action 
}: DashboardCardProps) {
  return (
    <div className={`dashboard-card ${className}`}>
      <div className="dashboard-card-header">
        <h3 className="dashboard-card-title">{title}</h3>
        {action && <div className="dashboard-card-action">{action}</div>}
      </div>
      <div className="dashboard-card-content">
        {children}
      </div>
    </div>
  );
}
