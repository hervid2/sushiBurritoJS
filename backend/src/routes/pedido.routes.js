// =================================================================
// ARCHIVO: src/routes/pedido.routes.js
// =================================================================

import { Router } from 'express';
import * as pedidoController from '../controllers/pedido.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// --- Rutas para Pedidos ---

// Crear un nuevo pedido (protegido para usuarios logueados, ej. meseros)
router.post('/', [verifyToken], pedidoController.createPedido);

// Obtener todos los pedidos (protegido)
router.get('/', [verifyToken], pedidoController.getAllPedidos);

// Obtener un pedido específico con sus detalles (protegido)
router.get('/:id', [verifyToken], pedidoController.getPedidoById);

// Actualizar el estado de un pedido (ej. de 'pendiente' a 'en_preparacion')
router.put('/:id/estado', [verifyToken], pedidoController.updatePedidoStatus);

// Ruta para editar los productos de un pedido (protegido)
router.put('/:id', [verifyToken], pedidoController.updatePedidoItems); 

// Ruta para cancelar/eliminar un pedido (protegido)
router.delete('/:id', [verifyToken], pedidoController.deletePedido); 


export default router;