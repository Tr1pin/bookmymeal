import { Router } from 'express';
import { StripeController } from '../../controllers/payments/stripeController.js';

const router = Router();

// Rutas de pagos con Stripe
router.post('/create-checkout-session', StripeController.createCheckoutSession);
router.get('/verify-payment/:session_id', StripeController.verifyPayment);
router.post('/webhook', StripeController.handleWebhook);
router.post('/refund', StripeController.createRefund);

export default router; 