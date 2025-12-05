'use client';

import { useState } from 'react';
import { AxiosError } from 'axios';
import api from '@/lib/api';
import PhoneInput from '@/components/PhoneInput';
import { phoneSchema } from '@/lib/phoneValidation';

export default function Home() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    source: 'website',
  });
  const [phoneError, setPhoneError] = useState('');
  const [phoneValid, setPhoneValid] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = (value: string) => {
    setFormData({ ...formData, phone: value });
    setPhoneError('');
  };

  const handlePhoneValidation = (isValid: boolean) => {
    setPhoneValid(isValid);
    if (!isValid && formData.phone) {
      setPhoneError('Please enter a valid phone number');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPhoneError('');

    // Validate phone number
    if (formData.phone) {
      const result = phoneSchema.safeParse({ phone: formData.phone });
      if (!result.success) {
        setPhoneError(result.error.errors[0].message);
        return;
      }
      if (!phoneValid) {
        setPhoneError('Please enter a valid phone number');
        return;
      }
    }

    setLoading(true);

    try {
      await api.post('/leads', formData);
      setSubmitted(true);
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        company: '',
        message: '',
        source: 'website',
      });
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      setError(error.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="page-wrapper">
        <div className="container-modern">
          <div className="card p-8 sm:p-10 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Thank You!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Your application has been submitted successfully. We will review it and get back to you soon.
              </p>
            </div>
            <button
              onClick={() => setSubmitted(false)}
              className="link-modern"
            >
              Submit another application
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container-modern">
        <div className="card p-8 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Services
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Fill out the form below and we'll get back to you shortly
            </p>
          </div>
          
          {error && (
            <div className="error-message mb-6">
              <span className="flex-1">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="full_name" className="label-modern">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="full_name"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="input-modern"
                placeholder="John Doe"
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="email" className="label-modern">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-modern"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="phone" className="label-modern">
                Phone Number
              </label>
              <PhoneInput
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                onValidationChange={handlePhoneValidation}
                error={phoneError}
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label htmlFor="company" className="label-modern">
                Company
              </label>
              <input
                type="text"
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="input-modern"
                placeholder="Your company name"
                autoComplete="organization"
              />
            </div>

            <div>
              <label htmlFor="message" className="label-modern">
                Message
              </label>
              <textarea
                id="message"
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="input-modern resize-none"
                placeholder="Tell us about your requirements..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="spinner"></span>
                  Submitting...
                </span>
              ) : (
                'Submit Application'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
