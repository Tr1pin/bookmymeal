import { z } from 'zod';

const reservaSchema = z.object({
    usuario_id: z.string().uuid({ message: 'El usuario_id debe ser un UUID válido' }),
    mesa_id: z.string().uuid({ message: 'La mesa_id debe ser un UUID válido' }),
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha debe estar en formato YYYY-MM-DD' }),
    hora: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, { message: 'La hora debe estar en formato HH:MM:SS' }),
    estado: z.enum(['pendiente', 'confirmada', 'cancelada', 'completada'], { message: 'estado inválido' }),
    personas: z.number().int().positive()
});

export function validateReserva(input) {
    return reservaSchema.safeParse(input);
}

export function validatePartialReserva(input) {
    return reservaSchema.partial().safeParse(input);
}