// =================================================================
// ARCHIVO: src/routes/auth.routes.js
// =================================================================

import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validateLogin } from '../middleware/validation.middleware.js';

const router = Router();

// Ruta para el inicio de sesión
router.post('/login', authController.login);

// Ruta para solicitar el enlace de restablecimiento
router.post('/forgot-password', authController.forgotPassword);

// Ruta para enviar la nueva contraseña con el token
router.post('/reset-password', authController.resetPassword);

// Ruta para refrescar el token de acceso
router.post('/refresh-token', authController.refreshToken);

export default router;