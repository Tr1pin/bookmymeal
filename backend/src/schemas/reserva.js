import { z } from 'zod';

const reservaSchema = z.object({
    usuario_id: z.string().uuid({ message: 'usuario_id debe ser un UUID válido' }),
    mesa_id: z.string().uuid({ message: 'mesa_id debe ser un UUID válido' }),
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'fecha debe estar en formato YYYY-MM-DD' }),
    hora: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, { message: 'hora debe estar en formato HH:MM:SS' }),
    estado: z.enum(['pendiente', 'confirmada', 'cancelada'], { message: 'estado inválido' })
});

export function validateReserva(input) {
    return reservaSchema.safeParse(input);
}

export function validatePartialReserva(input) {
    return reservaSchema.partial().safeParse(input);
}