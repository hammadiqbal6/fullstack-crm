'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { hasAnyRole, UserRole } from '@/lib/roles';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles,
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const router = useRouter();
  const user = auth.getUser();

  useEffect(() => {
    if (!user) {
      router.push(redirectTo);
      return;
    }

    if (allowedRoles && !hasAnyRole(user, allowedRoles)) {
      router.push('/dashboard');
    }
  }, [user, allowedRoles, redirectTo, router]);

  if (!user) {
    return null;
  }

  if (allowedRoles && !hasAnyRole(user, allowedRoles)) {
    return null;
  }

  return <>{children}</>;
}
