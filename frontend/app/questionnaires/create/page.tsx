'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { auth } from '@/lib/auth';
import { hasAnyRole } from '@/lib/roles';
import DashboardCard from '@/components/DashboardCard';

interface Question {
  id?: number;
  question_text: string;
  question_type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'file_upload' | 'date';
  options: string;
  required: boolean;
  order: number;
}

export default function CreateQuestionnairePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = auth.getUser();
  const questionnaireId = searchParams.get('id');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addQuestion = useCallback(() => {
    setQuestions((prev) => [
      ...prev,
      {
        question_text: '',
        question_type: 'text',
        options: '',
        required: false,
        order: prev.length,
      },
    ]);
  }, []);

  const fetchQuestionnaire = useCallback(async () => {
    if (!questionnaireId) return;
    
    try {
      const response = await api.get(`/questionnaires/${questionnaireId}`);
      const data = response.data;
      setTitle(data.title);
      setDescription(data.description || '');
      setIsActive(data.is_active);
      setQuestions(
        data.questions.map((q: any) => ({
          id: q.id,
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.options ? q.options.join('\n') : '',
          required: q.required,
          order: q.order,
        }))
      );
    } catch (err) {
      setError('Failed to load questionnaire');
    }
  }, [questionnaireId]);

  useEffect(() => {
    if (!user || !hasAnyRole(user, ['admin', 'user', 'sales_rep'])) {
      router.push('/dashboard');
      return;
    }

    if (questionnaireId) {
      fetchQuestionnaire();
    } else if (questions.length === 0) {
      addQuestion();
    }
  }, [questionnaireId, fetchQuestionnaire, addQuestion, questions.length, router, user]);

  const removeQuestion = useCallback((index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateQuestion = useCallback((index: number, field: keyof Question, value: any) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        title,
        description,
        is_active: isActive,
        questions: questions.map((q, idx) => ({
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.options ? q.options.split('\n').filter((o) => o.trim()) : null,
          required: q.required,
          order: idx,
        })),
      };

      if (questionnaireId) {
        await api.put(`/questionnaires/${questionnaireId}`, payload);
      } else {
        await api.post('/questionnaires', payload);
      }

      router.push('/questionnaires');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save questionnaire');
    } finally {
      setLoading(false);
    }
  };

  const questionTypes = [
    { value: 'text', label: 'Short Text' },
    { value: 'textarea', label: 'Long Text' },
    { value: 'select', label: 'Dropdown' },
    { value: 'radio', label: 'Multiple Choice' },
    { value: 'checkbox', label: 'Checkboxes' },
    { value: 'date', label: 'Date' },
    { value: 'file_upload', label: 'File Upload' },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {questionnaireId ? 'Edit Questionnaire' : 'Create Questionnaire'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Build a questionnaire for customers to complete
        </p>
      </div>

      {error && (
        <div className="error-message mb-6">
          <span className="flex-1">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <DashboardCard title="Questionnaire Details">
          <div className="space-y-4">
            <div>
              <label className="label-modern">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-modern"
                required
                placeholder="Enter questionnaire title"
              />
            </div>

            <div>
              <label className="label-modern">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-modern resize-none"
                rows={3}
                placeholder="Enter questionnaire description (optional)"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Active (visible to customers)
              </label>
            </div>
          </div>
        </DashboardCard>

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Questions</h2>
          <button
            type="button"
            onClick={addQuestion}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            + Add Question
          </button>
        </div>

        {questions.map((question, index) => (
          <DashboardCard
            key={index}
            title={`Question ${index + 1}`}
            action={
              <button
                type="button"
                onClick={() => removeQuestion(index)}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
              >
                Remove
              </button>
            }
          >
            <div className="space-y-4">
              <div>
                <label className="label-modern">
                  Question Text <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={question.question_text}
                  onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                  className="input-modern"
                  required
                  placeholder="Enter your question"
                />
              </div>

              <div>
                <label className="label-modern">Question Type</label>
                <select
                  value={question.question_type}
                  onChange={(e) => updateQuestion(index, 'question_type', e.target.value)}
                  className="input-modern"
                >
                  {questionTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {['select', 'radio', 'checkbox'].includes(question.question_type) && (
                <div>
                  <label className="label-modern">
                    Options (one per line) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={question.options}
                    onChange={(e) => updateQuestion(index, 'options', e.target.value)}
                    className="input-modern resize-none"
                    rows={4}
                    required
                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`required-${index}`}
                  checked={question.required}
                  onChange={(e) => updateQuestion(index, 'required', e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor={`required-${index}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Required question
                </label>
              </div>
            </div>
          </DashboardCard>
        ))}

        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="btn-primary" style={{ width: 'auto' }}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner"></span>
                Saving...
              </span>
            ) : (
              'Save Questionnaire'
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
      </form>
    </div>
  );
}
