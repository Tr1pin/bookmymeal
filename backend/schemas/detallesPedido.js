import { z } from "zod";

const detallePedidoSchema = z.object({
    pedido_id: z.string().uuid({ message: 'pedido_id debe ser un UUID válido' }),
    producto_id: z.string().uuid({ message: 'producto_id debe ser un UUID válido' }),
    cantidad: z.number().int().positive({ message: 'cantidad debe ser un número entero positivo' }),
    subtotal: z.number().positive({ message: 'subtotal debe ser mayor que cero' })
});

export function validateDetallePedido(input) {
    return detallePedidoSchema.safeParse(input);
}

export function validatePartialDetallePedido(input) {
    return detallePedidoSchema.partial().safeParse(input);
}
