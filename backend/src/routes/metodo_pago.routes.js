// src/routes/metodo_pago.routes.js
import { Router } from 'express';
import * as metodoPagoController from '../controllers/metodo_pago.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', [verifyToken], metodoPagoController.getAllPaymentMethods);

export default router;