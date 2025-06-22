// =================================================================
// ARCHIVO: src/controllers/pedido.controller.js
// =================================================================

import db from '../models/index.js';
const Pedido = db.Pedido;
const DetallePedido = db.DetallePedido;
const Mesa = db.Mesa;
const Producto = db.Producto;

// Crear un nuevo pedido con sus detalles en una transacción
export const createPedido = async (req, res) => {
    // El usuario_id viene del token verificado por el middleware
    const usuario_id = req.userId;
    const { mesa_id, items } = req.body;

    if (!mesa_id || !items || items.length === 0) {
        return res.status(400).send({ message: "La mesa y al menos un artículo son requeridos." });
    }

    // Iniciar una transacción
    const t = await db.sequelize.transaction();

    try {
        // 1. Crear el pedido principal
        const pedido = await Pedido.create({
            usuario_id,
            mesa_id,
            estado: 'pendiente'
        }, { transaction: t });

        // 2. Preparar y crear los detalles del pedido
        const detallesPedido = items.map(item => {
            return {
                pedido_id: pedido.pedido_id,
                producto_id: item.producto_id,
                cantidad: item.cantidad,
                notas: item.notas
            };
        });
        await DetallePedido.bulkCreate(detallesPedido, { transaction: t });

        // 3. Actualizar el estado de la mesa a 'ocupada'
        await Mesa.update({ estado: 'ocupada' }, { where: { mesa_id: mesa_id }, transaction: t });

        // 4. Si todo va bien, confirmar la transacción
        await t.commit();
        res.status(201).send({ message: "Pedido creado exitosamente.", pedido });

    } catch (error) {
        // 5. Si algo falla, deshacer todos los cambios
        await t.rollback();
        res.status(500).send({ message: "Error al crear el pedido: " + error.message });
    }
};

// Obtener todos los pedidos (ejemplo simple)
export const getAllPedidos = async (req, res) => {
    try {
        const pedidos = await Pedido.findAll({ include: [db.Usuario, db.Mesa] });
        res.status(200).send(pedidos);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Obtener un pedido por ID con sus productos
export const getPedidoById = async (req, res) => {
    try {
        const { id } = req.params;
        const pedido = await Pedido.findByPk(id, {
            include: [{
                model: Producto,
                through: { attributes: ['cantidad', 'notas'] } // Incluye info de la tabla pivote
            }]
        });
        if (pedido) {
            res.status(200).send(pedido);
        } else {
            res.status(404).send({ message: `Pedido con id=${id} no encontrado.` });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Actualizar el estado de un pedido
export const updatePedidoStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        const [num] = await Pedido.update({ estado }, { where: { pedido_id: id } });
        if (num == 1) {
            res.send({ message: "Estado del pedido actualizado exitosamente." });
        } else {
            res.status(404).send({ message: `No se encontró el pedido con id=${id}.` });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};