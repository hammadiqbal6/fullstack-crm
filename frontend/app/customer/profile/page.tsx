'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { auth, CustomerProfile } from '@/lib/auth';
import DashboardCard from '@/components/DashboardCard';

export default function CustomerProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    company: '',
    address: '',
  });

  useEffect(() => {
    if (!auth.isCustomer()) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await api.get('/customer/profile');
        setProfile(response.data);
        setFormData({
          phone: response.data.phone || '',
          company: response.data.company || '',
          address: response.data.address || '',
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await api.put('/customer/profile', formData);
      setProfile(response.data);
      alert('Profile updated successfully');
    } catch {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="dashboard-container">
        <div className="error-message">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your profile information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info Card */}
        <DashboardCard title="Account Information">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {profile.contact?.primary_contact_name || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {profile.contact?.email || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
              <span className="badge badge-success">Active</span>
            </div>
          </div>
        </DashboardCard>

        {/* Edit Profile Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <DashboardCard 
              title="Contact Details"
              action={
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              }
            >
              <div className="space-y-4">
                <div>
                  <label className="label-modern">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-modern"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="label-modern">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="input-modern"
                    placeholder="Enter your company name"
                  />
                </div>

                <div>
                  <label className="label-modern">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="input-modern resize-none"
                    rows={3}
                    placeholder="Enter your address"
                  />
                </div>
              </div>
            </DashboardCard>
          </form>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <DashboardCard title="Questionnaires">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Complete required questionnaires
          </p>
          <button
            onClick={() => router.push('/questionnaires')}
            className="btn-primary text-center w-full"
          >
            View Questionnaires
          </button>
        </DashboardCard>

        <DashboardCard title="Invoices">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            View your invoices and payment status
          </p>
          <button
            onClick={() => router.push('/invoices')}
            className="btn-primary text-center w-full"
          >
            View Invoices
          </button>
        </DashboardCard>

        <DashboardCard title="Dashboard">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Return to your dashboard
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="btn-primary text-center w-full"
          >
            Go to Dashboard
          </button>
        </DashboardCard>
      </div>
    </div>
  );
}
