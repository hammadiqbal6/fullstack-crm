'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import api from '@/lib/api';
import { auth, Lead } from '@/lib/auth';
import { showSuccess, showError } from '@/lib/toast';

export default function AdminLeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [rejectingLead, setRejectingLead] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchLeads = useCallback(async () => {
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const response = await api.get('/admin/leads', { params });
      setLeads(response.data.data || response.data);
    } catch (err) {
      console.error(err);
      showError('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (!auth.isAdmin()) {
      router.push('/login');
      return;
    }

    fetchLeads();
  }, [router, fetchLeads]);

  const handleApprove = async (id: string) => {
    try {
      const response = await api.post(`/admin/leads/${id}/approve`);
      await fetchLeads();
      
      // Check if lead was converted to customer
      if (response.data.message?.includes('converted') || response.data.converted) {
        showSuccess('Lead approved and converted to customer successfully!');
      } else {
        showSuccess('Lead approved successfully!');
      }
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      showError(error.response?.data?.message || 'Failed to approve lead');
    }
  };

  const handleReject = async (id: string) => {
    setRejectingLead(id);
  };

  const confirmReject = async () => {
    if (!rejectingLead) return;
    
    try {
      await api.post(`/admin/leads/${rejectingLead}/reject`, { 
        rejection_reason: rejectionReason || undefined 
      });
      await fetchLeads();
      showSuccess('Lead rejected successfully');
      setRejectingLead(null);
      setRejectionReason('');
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      showError(error.response?.data?.message || 'Failed to reject lead');
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Leads Management</h1>
        
        <div className="mb-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border-gray-300"
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CONVERTED">Converted</option>
          </select>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{lead.full_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{lead.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded ${
                      lead.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      lead.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {lead.status === 'NEW' || lead.status === 'UNDER_REVIEW' ? (
                      <>
                        <button
                          onClick={() => handleApprove(lead.id)}
                          className="mr-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(lead.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

