'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getNavItemsForUser } from '@/lib/roles';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = auth.getUser();
  const navItems = getNavItemsForUser(user);

  const handleLogout = async () => {
    try {
      await auth.logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      router.push('/login');
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          CRM System
        </h2>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user?.name || 'User'}</p>
            <p className="sidebar-user-email">{user?.email || ''}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-logout-btn"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
