// ========================================
// ARCHIVO: src/routes/stats.routes.js 
// ========================================

import { Router } from 'express';
import * as statsController from '../controllers/stats.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// --- Rutas para Estadísticas (Protegidas para Admin) ---

// Ruta para la página de estadísticas (filtros)
router.get('/', [verifyToken, isAdmin], statsController.getStatistics);

// Ruta para enviar el reporte PDF
router.post('/send-report', [verifyToken, isAdmin], statsController.sendStatisticsReport);

// Ruta para el resumen del dashboard
router.get('/dashboard-summary', [verifyToken, isAdmin], statsController.getDashboardSummary);

// Ruta para la actividad reciente del dashboard
router.get('/recent-activity', [verifyToken, isAdmin], statsController.getRecentActivity);


export default router;
