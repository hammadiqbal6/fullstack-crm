import api from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  roles: Role[];
  contact?: Contact;
}

export interface Role {
  id: number;
  name: string;
  slug: string;
}

export interface Contact {
  id: number;
  primary_contact_name: string;
  email: string;
  phone?: string;
  company?: string;
}

export interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  status: 'NEW' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CONVERTED';
  source?: string;
  rejection_reason?: string;
}

export interface CustomerProfile {
  user?: User;
  contact?: Contact & {
    target_country?: string;
    visa_type?: string;
  };
}

export const auth = {
  async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      // Set cookie for middleware
      document.cookie = `token=${response.data.token}; path=/; max-age=604800`; // 7 days
    }
    return response.data;
  },

  async logout() {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Clear cookie
    document.cookie = 'token=; path=/; max-age=0';
  },

  async me() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  hasRole(role: string): boolean {
    const user = this.getUser();
    return user?.roles?.some((r: Role) => r.slug === role) || false;
  },

  isCustomer(): boolean {
    return this.hasRole('customer');
  },

  isStaff(): boolean {
    return this.hasRole('admin') || this.hasRole('user') || this.hasRole('sales_rep');
  },

  isAdmin(): boolean {
    return this.hasRole('admin');
  },
};

