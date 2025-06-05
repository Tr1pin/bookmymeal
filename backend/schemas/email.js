import { z } from "zod";

const emailSchema = z.object({
  to: z.string().email({ message: 'Correo electrónico del destinatario inválido' }),
  toName: z.string().min(1, { message: 'El nombre del destinatario es requerido' }).max(255),
  subject: z.enum(['registro', 'login', 'pedido', 'reserva'], {
    errorMap: () => ({ message: "El asunto solo puede ser: registro, login, pedido o reserva" })
  }),
  message: z.string().min(1, { message: 'El contenido de texto plano (message) es requerido' }).optional() // Opcionalmente, podrías llamarlo 'text'
});

export function validateEmail(input) {
  return emailSchema.safeParse(input);
}
