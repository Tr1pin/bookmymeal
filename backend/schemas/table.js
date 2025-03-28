import { z } from "zod";

const mesaSchema = z.object({
    numero: z.number({ message: 'Table number must be a number' })
        .positive({ message: 'Table number must be greater than zero' }),
    capacidad: z.number({ message: 'Capacity must be a number' })
        .positive({ message: 'Capacity must be greater than zero' })
});

export function validateMesa(input) {
    return mesaSchema.safeParse(input);
}

export function validatePartialMesa(input) {
    return mesaSchema.partial().safeParse(input);
}