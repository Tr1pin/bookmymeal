import { z } from "zod";

const productSchema = z.object({
    nombre: z.string({ message: 'Product name must be a string' })
        .min(3, { message: 'Product name must be at least 3 characters long' }),
    descripcion: z.string({ message: 'Description must be a string' })
        .min(10, { message: 'Description must be at least 10 characters long' }),
    precio: z.number({ message: 'Price must be a number' })
        .positive({ message: 'Price must be greater than zero' }),
    disponible: z.boolean({ message: 'Availability must be a boolean' })
});

export function validateProduct(input) {
    return productSchema.safeParse(input);
}

export function validatePartialProduct(input) {
    return productSchema.partial().safeParse(input);
}
