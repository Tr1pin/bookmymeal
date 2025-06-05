import { EmailService } from "../../services/email.service.js";
import { validateEmail } from "../../../schemas/email.js";

export class EmailController {
    /**
     * Crear una sesión de checkout de Stripe para un pedido
     */
    static async sendEmail(req, res) {
        try {
            const { to, toName, subject, message } = req.body;

            if (!to || !toName || !subject || !message) {
                return res.status(400).json({
                    message: 'Todos los campos son requeridos'
                });
            }

             const validation = validateEmail({ to, toName, subject, message });
             if (!validation.success) {
                throw new Error("Los datos no son correctos");
            }
            
            await EmailService.sendEmail({ to, toName, subject, message });
            
            res.status(200).json({
                message: 'Correo enviado correctamente'
            });
        } catch (error) {
            console.error('Error en createCheckoutSession:', error);
            res.status(500).json({
                message: 'Error al crear sesión de pago',
                error: error.message
            });
        }
}
}