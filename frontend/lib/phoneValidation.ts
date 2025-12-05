import { z } from 'zod';

export const phoneSchema = z.object({
  phone: z.string().min(1, 'Phone number is required').refine(
    (val) => {
      // Remove all non-digit characters for validation
      const digitsOnly = val.replace(/\D/g, '');
      // Check if it has at least 7 digits (minimum for a valid phone number)
      return digitsOnly.length >= 7 && digitsOnly.length <= 15;
    },
    {
      message: 'Please enter a valid phone number',
    }
  ),
});

export type PhoneFormData = z.infer<typeof phoneSchema>;

