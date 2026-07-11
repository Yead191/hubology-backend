import { z } from 'zod';
import { USER_ROLES } from '../../../enums/user';

const createVerifyEmailZodSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }),
    oneTimeCode: z.number({ required_error: 'One time code is required' }),
  }),
});

const createLoginZodSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }),
    password: z.string({ required_error: 'Password is required' }),
  }),
});

const createForgetPasswordZodSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }),
  }),
});

const createResetPasswordZodSchema = z.object({
  body: z.object({
    newPassword: z.string({ required_error: 'Password is required' }),
    confirmPassword: z.string({
      required_error: 'Confirm Password is required',
    }),
  }),
});

const createChangePasswordZodSchema = z.object({
  body: z.object({
    currentPassword: z.string({
      required_error: 'Current Password is required',
    }),
    newPassword: z.string({ required_error: 'New Password is required' }),
    confirmPassword: z.string({
      required_error: 'Confirm Password is required',
    }),
  }),
});

// const createRegisterZodSchema = z.object({
//   body: z.object({
//     name: z.string({ required_error: 'Name is required' }),
//     email: z.string({ required_error: 'Email is required' }),
//     password: z.string({ required_error: 'Password is required' }),
//     role: z.enum([USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.VENDOR, USER_ROLES.SUPER_ADMIN])
//   })
// })
const createRegisterUserZodSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Name is required',
      })
      .min(2, 'Name must be at least 2 characters'),

    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Please provide a valid email'),

    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(8, 'Password must be at least 8 characters'),

    company: z.string().optional(),

    interest: z
      .string({
        required_error: 'Please tell us what you need help with',
      })
      .min(2, 'Interest is required'),
  }),
});

const createRegisterVendorZodSchema = z.object({
  body: z.object({
    // Basic Information
    fullName: z
      .string({
        required_error: 'Full name is required',
      })
      .min(2, 'Please enter your full name'),

    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Please provide a valid email'),

    contactNo: z
      .string({
        required_error: 'Contact number is required',
      })
      .regex(/^[+()\-\s\d]+$/, 'Enter a valid contact number'),

    company: z
      .string({
        required_error: 'Company name is required',
      })
      .min(2, 'Please enter your company'),

    jobTitle: z
      .string({
        required_error: 'Job title is required',
      })
      .min(2, 'Please enter your job title'),

    bio: z
      .string({
        required_error: 'Bio is required',
      })
      .min(40, 'Tell members a bit more about yourself')
      .max(600, 'Bio should be under 600 characters'),

    // Expertise
    expertise: z
      .array(z.string())
      .min(1, 'Select at least one area of expertise')
      .max(6, 'Maximum 6 expertise areas'),

    yearsExperience: z.string({
      required_error: 'Years of experience is required',
    }),

    degree: z.string().optional(),

    linkedin: z
      .string()
      .trim()
      .refine(
        value =>
          !value ||
          /(^https?:\/\/)?([\w-]+\.)*linkedin\.com\/.+/i.test(value),
        {
          message: 'Enter a valid LinkedIn profile URL',
        }
      )
      .optional(),

    // Consulting
    hourlyRate: z.string({
      required_error: 'Hourly rate is required',
    }),

    availability: z.string({
      required_error: 'Availability is required',
    }),

    consultationTypes: z
      .array(z.string())
      .min(1, 'Select at least one consultation type'),

    agree: z.literal(true, {
      errorMap: () => ({
        message: 'You must accept the terms and conditions',
      }),
    }),
  }),
});


export const AuthValidation = {
  createVerifyEmailZodSchema,
  createForgetPasswordZodSchema,
  createLoginZodSchema,
  createResetPasswordZodSchema,
  createChangePasswordZodSchema,
  createRegisterVendorZodSchema,
  createRegisterUserZodSchema
};
