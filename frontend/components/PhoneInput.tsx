'use client';

import { useEffect, useRef, useState } from 'react';
// @ts-ignore - intl-tel-input doesn't have perfect TypeScript support
import intlTelInput from 'intl-tel-input';
import 'intl-tel-input/build/css/intlTelInput.css';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  error?: string;
  required?: boolean;
  id?: string;
  name?: string;
  placeholder?: string;
  className?: string;
}

interface IntlTelInputPlugin {
  getNumber: () => string;
  isValidNumber: () => boolean;
  setNumber: (number: string) => void;
  destroy: () => void;
}

export default function PhoneInput({
  value,
  onChange,
  onValidationChange,
  error,
  required = false,
  id = 'phone',
  name = 'phone',
  placeholder = 'Enter phone number',
  className = '',
}: PhoneInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const itiRef = useRef<IntlTelInputPlugin | null>(null);
  const [isValid, setIsValid] = useState<boolean>(true);

  useEffect(() => {
    if (!inputRef.current) return;

    // Initialize intl-tel-input
    const iti = intlTelInput(inputRef.current, {
      initialCountry: 'us',
      preferredCountries: ['us', 'gb', 'ca', 'au'],
      utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@24.1.0/build/js/utils.js',
      separateDialCode: true,
      formatOnDisplay: true,
      nationalMode: false,
    }) as IntlTelInputPlugin;

    itiRef.current = iti;

    // Handle input changes
    const handleInput = () => {
      const phoneNumber = iti.getNumber();
      onChange(phoneNumber);
      
      // Validate phone number
      const valid = iti.isValidNumber();
      setIsValid(valid);
      onValidationChange?.(valid);
    };

    inputRef.current.addEventListener('input', handleInput);
    inputRef.current.addEventListener('blur', handleInput);
    inputRef.current.addEventListener('countrychange', handleInput);

    // Set initial value if provided
    if (value) {
      iti.setNumber(value);
    }

    return () => {
      if (inputRef.current) {
        inputRef.current.removeEventListener('input', handleInput);
        inputRef.current.removeEventListener('blur', handleInput);
        inputRef.current.removeEventListener('countrychange', handleInput);
      }
      iti.destroy();
    };
  }, []);

  // Update value when prop changes
  useEffect(() => {
    if (itiRef.current && value && value !== itiRef.current.getNumber()) {
      itiRef.current.setNumber(value);
    }
  }, [value]);

  const hasError = error || (!isValid && value);

  return (
    <div className="w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="tel"
          id={id}
          name={name}
          required={required}
          placeholder={placeholder}
          className={`input-modern ${hasError ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
          autoComplete="tel"
        />
      </div>
      {hasError && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400" style={{ animation: 'fadeIn 0.3s ease-in' }}>
          {error || 'Please enter a valid phone number'}
        </p>
      )}
    </div>
  );
}
