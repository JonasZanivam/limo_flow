import { z } from 'zod';

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])[A-Za-z\d@$!%*?&#^()_\-+=]{8,}$/;

const passwordMessage =
  'Senha deve ter maiúscula, minúscula, número e caractere especial';

export const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().trim().email('E-mail inválido'),
  password: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(PASSWORD_REGEX, passwordMessage),
  role: z.enum(['ADMIN', 'DRIVER']),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().trim().email('E-mail inválido'),
  password: z
    .string()
    .regex(PASSWORD_REGEX, passwordMessage)
    .optional()
    .or(z.literal('')),
  role: z.enum(['ADMIN', 'DRIVER']),
});

export type CreateUserForm = z.infer<typeof createUserSchema>;
export type UpdateUserForm = z.infer<typeof updateUserSchema>;
