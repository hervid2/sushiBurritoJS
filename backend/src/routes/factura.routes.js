// ========================================
// ARCHIVO: src/routes/factura.routes.js 
// ========================================

import { Router } from 'express';
import * as facturaController from '../controllers/factura.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Crear una nueva factura
router.post('/', [verifyToken], facturaController.createInvoice);
// Obtener una factura por su ID
router.get('/:id', [verifyToken], facturaController.getInvoiceById);

export default router;