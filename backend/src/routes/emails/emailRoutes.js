import { Router } from 'express';
import { EmailController } from '../../controllers/emails/emailController.js';

const router = Router();

// Rutas de emails
router.post('/send', EmailController.sendEmail);

export default router;