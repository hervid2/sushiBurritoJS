// ========================================
// ARCHIVO: src/routes/stats.routes.js 
// ========================================

import { Router } from 'express';
import * as statsController from '../controllers/stats.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// --- Rutas para Estadísticas (Protegidas para Admin) ---


// Endpoint para obtener el resumen del dashboard
router.get('/dashboard-summary', [verifyToken, isAdmin], statsController.getDashboardSummary);

// Endpoint para obtener los datos de la página de estadísticas
router.get('/', [verifyToken, isAdmin], statsController.getStatistics);

// Ruta para obtener la actividad reciente para el dashboard
router.get('/recent-activity', [verifyToken, isAdmin], statsController.getRecentActivity);

// Endpoint para generar y enviar el reporte por correo
router.post('/send-report', [verifyToken, isAdmin], statsController.sendStatisticsReport);


export default router;