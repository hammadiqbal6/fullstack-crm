'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { auth } from '@/lib/auth';
import { hasAnyRole } from '@/lib/roles';
import DashboardCard from '@/components/DashboardCard';

interface Question {
  id: number;
  question_text: string;
  question_type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'file_upload' | 'date';
  options: string[] | null;
  required: boolean;
  order: number;
}

interface Questionnaire {
  id: number;
  title: string;
  description: string;
  is_active: boolean;
  questions: Question[];
  response?: {
    id: number;
    status: string;
    submitted_at: string;
    answers: Array<{
      question_id: number;
      answer_text: string;
      answer_file_path: string | null;
    }>;
  };
}

export default function QuestionnaireDetailPage() {
  const params = useParams();
  const router = useRouter();
  const user = auth.getUser();
  const questionnaireId = params.id as string;

  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isStaff = user && hasAnyRole(user, ['admin', 'user', 'sales_rep']);
  const isViewOnly = isStaff || (questionnaire?.response !== undefined);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchQuestionnaire();
  }, [user, router, questionnaireId]);

  const fetchQuestionnaire = async () => {
    try {
      const endpoint = isStaff
        ? `/questionnaires/${questionnaireId}`
        : `/customer/questionnaires/${questionnaireId}`;
      const response = await api.get(endpoint);
      const data = response.data;
      setQuestionnaire(data);

      // Pre-fill answers if response exists
      if (data.response?.answers) {
        const existingAnswers: Record<number, string> = {};
        data.response.answers.forEach((answer: any) => {
          existingAnswers[answer.question_id] = answer.answer_text || '';
        });
        setAnswers(existingAnswers);
      }
    } catch (err) {
      console.error('Failed to fetch questionnaire:', err);
      setError('Failed to load questionnaire');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const answersArray = questionnaire!.questions.map((q) => ({
        question_id: q.id,
        answer_text: answers[q.id] || '',
      }));

      await api.post(`/customer/questionnaires/${questionnaireId}/responses`, {
        answers: answersArray,
      });

      alert('Questionnaire submitted successfully!');
      router.push('/questionnaires');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit questionnaire');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: Question) => {
    const value = answers[question.id] || '';
    const isDisabled = isViewOnly;

    switch (question.question_type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
            className="input-modern"
            required={question.required}
            disabled={isDisabled}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
            className="input-modern resize-none"
            rows={4}
            required={question.required}
            disabled={isDisabled}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
            className="input-modern"
            required={question.required}
            disabled={isDisabled}
          >
            <option value="">Select an option</option>
            {question.options?.map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {question.options?.map((option, idx) => (
              <label key={idx} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={value === option}
                  onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                  required={question.required}
                  disabled={isDisabled}
                  className="w-4 h-4"
                />
                <span className="text-gray-700 dark:text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        const selectedValues = value ? value.split(',') : [];
        return (
          <div className="space-y-2">
            {question.options?.map((option, idx) => (
              <label key={idx} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={option}
                  checked={selectedValues.includes(option)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, option]
                      : selectedValues.filter((v) => v !== option);
                    setAnswers({ ...answers, [question.id]: newValues.join(',') });
                  }}
                  disabled={isDisabled}
                  className="w-4 h-4"
                />
                <span className="text-gray-700 dark:text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
            className="input-modern"
            required={question.required}
            disabled={isDisabled}
          />
        );

      case 'file_upload':
        return (
          <div>
            <input
              type="file"
              onChange={(e) => {
                // File upload would need special handling
                const file = e.target.files?.[0];
                if (file) {
                  setAnswers({ ...answers, [question.id]: file.name });
                }
              }}
              className="input-modern"
              required={question.required && !value}
              disabled={isDisabled}
            />
            {value && <p className="text-sm text-gray-600 mt-2">File: {value}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!questionnaire) {
    return (
      <div className="dashboard-container">
        <div className="error-message">Questionnaire not found</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {questionnaire.title}
        </h1>
        {questionnaire.description && (
          <p className="text-gray-600 dark:text-gray-400 mt-2">{questionnaire.description}</p>
        )}
        {isViewOnly && (
          <div className="mt-4">
            <span className="badge badge-info">
              {isStaff ? 'View Only (Staff)' : 'Already Submitted'}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message mb-6">
          <span className="flex-1">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {questionnaire.questions
          .sort((a, b) => a.order - b.order)
          .map((question, index) => (
            <DashboardCard key={question.id} title={`${index + 1}. ${question.question_text}`}>
              <div className="space-y-2">
                {question.required && !isViewOnly && (
                  <span className="text-red-500 text-sm">* Required</span>
                )}
                {renderQuestion(question)}
              </div>
            </DashboardCard>
          ))}

        {!isViewOnly && (
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ width: 'auto' }}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="spinner"></span>
                  Submitting...
                </span>
              ) : (
                'Submit Questionnaire'
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        )}

        {isViewOnly && (
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-primary"
            style={{ width: 'auto' }}
          >
            Back to Questionnaires
          </button>
        )}
      </form>
    </div>
  );
}
