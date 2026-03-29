// src/shared/validators/job-validator.ts
import { z } from 'zod';

/**
 * Schema for the example transaction job.
 */
export const TransactionJobSchema = z.object({
  transactionId: z.string().optional(),
  amount: z.number().min(0, 'Amount must be positive'),
  currency: z.string().length(3, 'Currency must be a 3-letter ISO code').default('USD'),
});

export type TransactionJobInput = z.infer<typeof TransactionJobSchema>;
