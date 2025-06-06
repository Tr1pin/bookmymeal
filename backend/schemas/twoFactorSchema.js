import { z } from "zod";

const twoFactorSchema = z.object({
    user_id: z.string({ message: 'User ID must be a string' })
        .uuid({ message: 'User ID must be a valid UUID' }),
    codigo: z.number({ message: 'Code must be a number' })
        .int({ message: 'Code must be an integer' })
        .gte(100000, { message: 'Code must be at least 6 digits' })
        .lte(999999, { message: 'Code must be at most 6 digits' }),
    activo: z.boolean({ message: 'Active must be a boolean' }),
    fecha_creacion: z.date({ message: 'Creation date must be a date' })
});

export function validateTwoFactor(input) {
    return twoFactorSchema.safeParse(input);
}

export function validatePartialTwoFactor(input) {
    return twoFactorSchema.partial().safeParse(input);
}
