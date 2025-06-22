// ========================================
// ARCHIVO: src/routes/stats.routes.js 
// ========================================

import { Router } from 'express';
import * as statsController from '../controllers/stats.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// --- Rutas para Estadísticas (Protegidas para Admin) ---

// Endpoint para generar y enviar el reporte por correo
router.post('/send-report', [verifyToken, isAdmin], statsController.sendStatisticsReport);

export default router;