import { z } from "zod";

// Define a schema for users.
const userSchema = z.object({
    nombre: z.string({ message: 'Username must be a string' })
        .min(3, { message: 'Username must be at least 3 characters long' }),
    telefono: z.string()
        .regex(/^\d{9}$/, { message: 'Phone number must be exactly 9 digits' }),
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string({ message: 'Password must be a string' })
        .min(6, { message: 'Password must be at least 6 characters long' })
});

// Function to validate a complete user object.
export function validateUser(input) {
    return userSchema.safeParse(input);
}

// Function to validate partial user updates.
export function validatePartialUser(input) {
    return userSchema.partial().safeParse(input);
}