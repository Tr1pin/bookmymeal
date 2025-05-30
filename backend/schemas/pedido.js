import { z } from "zod";

const pedidoSchema = z.object({
    usuario_id: z.string().uuid({ message: 'usuario_id debe ser un UUID válido' }).optional(),
    tipo_entrega: z.enum(['recogida', 'domicilio'], { message: 'tipo_entrega debe ser "recogida" o "domicilio"' }),
    metodo_pago: z.enum(['efectivo', 'tarjeta'], { message: 'metodo_pago debe ser "efectivo" o "tarjeta"' }),
    direccion_calle: z.string().max(255).optional(),
    direccion_ciudad: z.string().max(100).optional(),
    direccion_codigo_postal: z.string().max(10).optional(),
    direccion_telefono: z.string().max(15).optional(),
    total: z.number().positive({ message: 'total debe ser mayor que cero' }),
    estado: z.enum(['pendiente', 'en preparación', 'listo', 'entregado', 'cancelado'], { message: 'estado inválido' })
}).refine((data) => {
    // Si es domicilio, los campos de dirección son obligatorios
    if (data.tipo_entrega === 'domicilio') {
        return data.direccion_calle && data.direccion_ciudad && data.direccion_codigo_postal && data.direccion_telefono;
    }
    return true;
}, {
    message: 'Para entregas a domicilio son obligatorios: direccion_calle, direccion_ciudad, direccion_codigo_postal y direccion_telefono'
});

// Esquema específico para actualizaciones parciales (principalmente para cambiar estado)
const pedidoUpdateSchema = z.object({
    id: z.string().uuid({ message: 'id debe ser un UUID válido' }),
    estado: z.enum(['pendiente', 'en preparación', 'listo', 'entregado', 'cancelado'], { message: 'estado inválido' })
});

export function validatePedido(input) {
    return pedidoSchema.safeParse(input);
}

export function validatePartialPedido(input) {
    return pedidoUpdateSchema.safeParse(input);
}