// =================================================================
// ARCHIVO: src/routes/mesa.routes.js
// =================================================================

import { Router } from 'express';
import * as mesaController from '../controllers/mesa.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// --- Rutas para Mesas ---

// Obtener todas las mesas (público, para que los meseros vean el estado)
router.get('/', mesaController.getAllMesas);

// Crear una nueva mesa (protegido para admin)
router.post('/', [verifyToken, isAdmin], mesaController.createMesa);

// Actualizar el estado de una mesa (protegido, meseros o admin pueden hacerlo)
router.put('/:id/estado', [verifyToken], mesaController.updateMesaEstado);

// Eliminar una mesa (protegido para admin)
router.delete('/:id', [verifyToken, isAdmin], mesaController.deleteMesa);

export default router;