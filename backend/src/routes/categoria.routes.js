// =================================================================
// ARCHIVO: src/routes/categoria.routes.js
// =================================================================

import { Router } from 'express';
import * as categoriaController from '../controllers/categoria.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// --- Rutas para Categorías ---

// Obtener todas las categorías (ruta pública para que el frontend pueda usarlas en filtros)
router.get('/', categoriaController.getAllCategories);

// Crear una nueva categoría (ruta protegida solo para administradores)
router.post('/', [verifyToken, isAdmin], categoriaController.createCategory);

// Eliminar una categoría (ruta protegida solo para administradores)
router.delete('/:id', [verifyToken, isAdmin], categoriaController.deleteCategory);

export default router;