// =================================================================
// ARCHIVO: src/routes/usuario.routes.js
// =================================================================

import { Router } from 'express';
import * as usuarioController from '../controllers/usuario.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', [verifyToken, isAdmin], usuarioController.createUser);
router.get('/', [verifyToken, isAdmin], usuarioController.getAllUsers);
// Aquí añadirías las demás rutas (GET por ID, PUT, DELETE)

export default router;