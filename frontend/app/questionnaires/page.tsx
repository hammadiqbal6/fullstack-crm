'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { auth } from '@/lib/auth';
import { hasAnyRole } from '@/lib/roles';
import { showSuccess, showError } from '@/lib/toast';
import DashboardCard from '@/components/DashboardCard';

interface Questionnaire {
  id: number;
  title: string;
  description: string;
  is_active: boolean;
  created_at: string;
  questions_count?: number;
  response?: {
    id: number;
    status: string;
    submitted_at: string;
  };
}

export default function QuestionnairesPage() {
  const router = useRouter();
  const user = auth.getUser();
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isStaff = user && hasAnyRole(user, ['admin', 'user', 'sales_rep']);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchQuestionnaires();
  }, [user, router]);

  const fetchQuestionnaires = async () => {
    try {
      const endpoint = isStaff ? '/questionnaires' : '/customer/questionnaires';
      const response = await api.get(endpoint);
      setQuestionnaires(response.data.data || response.data);
    } catch (err) {
      console.error('Failed to fetch questionnaires:', err);
      setError('Failed to load questionnaires');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this questionnaire?')) return;

    try {
      await api.delete(`/questionnaires/${id}`);
      fetchQuestionnaires();
      showSuccess('Questionnaire deleted successfully');
    } catch (err) {
      showError('Failed to delete questionnaire');
    }
  };

  const toggleActive = async (id: number, currentStatus: boolean) => {
    try {
      await api.put(`/questionnaires/${id}`, { is_active: !currentStatus });
      fetchQuestionnaires();
    } catch (err) {
      alert('Failed to update questionnaire status');
    }
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Questionnaires
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {isStaff ? 'Manage customer questionnaires' : 'Complete your questionnaires'}
            </p>
          </div>
          {isStaff && (
            <Link href="/questionnaires/create" className="btn-primary" style={{ width: 'auto' }}>
              Create Questionnaire
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message mb-6">
          <span className="flex-1">{error}</span>
        </div>
      )}

      <div className="dashboard-grid">
        {questionnaires.length === 0 ? (
          <div className="col-span-full">
            <DashboardCard title="No Questionnaires">
              <p className="text-gray-600 dark:text-gray-400">
                {isStaff
                  ? 'No questionnaires created yet. Click "Create Questionnaire" to get started.'
                  : 'No questionnaires available at this time.'}
              </p>
            </DashboardCard>
          </div>
        ) : (
          questionnaires.map((questionnaire) => (
            <DashboardCard
              key={questionnaire.id}
              title={questionnaire.title}
              action={
                isStaff ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleActive(questionnaire.id, questionnaire.is_active)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        questionnaire.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                    >
                      {questionnaire.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                ) : questionnaire.response ? (
                  <span className="badge badge-success">Completed</span>
                ) : (
                  <span className="badge badge-warning">Pending</span>
                )
              }
            >
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {questionnaire.description || 'No description provided'}
              </p>

              <div className="flex gap-2 mt-4">
                <Link
                  href={`/questionnaires/${questionnaire.id}`}
                  className="btn-primary text-center"
                  style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  {isStaff ? 'View Details' : questionnaire.response ? 'View Response' : 'Fill Out'}
                </Link>

                {isStaff && (
                  <>
                    <Link
                      href={`/questionnaires/create?id=${questionnaire.id}`}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(questionnaire.id)}
                      className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>

              {isStaff && questionnaire.questions_count !== undefined && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
                  {questionnaire.questions_count} question{questionnaire.questions_count !== 1 ? 's' : ''}
                </p>
              )}

              {!isStaff && questionnaire.response && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
                  Submitted: {new Date(questionnaire.response.submitted_at).toLocaleDateString()}
                </p>
              )}
            </DashboardCard>
          ))
        )}
      </div>
    </div>
  );
}
