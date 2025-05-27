import { z } from "zod";

const pedidoSchema = z.object({
    usuario_id: z.string().uuid({ message: 'usuario_id debe ser un UUID válido' }),
    total: z.number().positive({ message: 'total debe ser mayor que cero' }),
    estado: z.enum(['pendiente', 'en preparación', 'listo', 'entregado', 'cancelado'], { message: 'estado inválido' })
});

export function validatePedido(input) {
    return pedidoSchema.safeParse(input);
}

export function validatePartialPedido(input) {
    return pedidoSchema.partial().safeParse(input);
}