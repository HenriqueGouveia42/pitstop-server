import { z } from 'zod';

// 1. O Schema (Runtime) - Valida o JS
export const CreateBillZodSchema = z.object({
  tableNumber: z.number().int().positive(),
  waiterId: z.string().uuid().optional(),
});

// 2. O Tipo (Compile time) - Ajuda o TypeScript
export type CreateBillInputDTO = z.infer<typeof CreateBillZodSchema>;