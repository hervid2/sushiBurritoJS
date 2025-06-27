// =================================================================
// ARCHIVO: src/controllers/pedido.controller.js (VERSIÓN FINAL CORREGIDA)
// =================================================================

import db from '../models/index.js';

// Desestructuramos TODOS los modelos y objetos que necesitamos al principio.
const { Pedido, DetallePedido, Mesa, Producto, sequelize } = db;

// Crear un nuevo pedido con sus detalles en una transacción
export const createPedido = async (req, res) => {
    const usuario_id = req.userId;
    const { mesa_id, items } = req.body;

    if (!mesa_id || !items || items.length === 0) {
        return res.status(400).send({ message: "La mesa y al menos un artículo son requeridos." });
    }

    const t = await sequelize.transaction();
    try {
        const pedido = await Pedido.create({
            usuario_id,
            mesa_id,
            estado: 'pendiente'
        }, { transaction: t });

        const detallesPedido = items.map(item => ({
            pedido_id: pedido.pedido_id,
            producto_id: item.producto_id,
            cantidad: item.cantidad,
            notas: item.notas
        }));
        await DetallePedido.bulkCreate(detallesPedido, { transaction: t });

        await Mesa.update({ estado: 'ocupada' }, { where: { mesa_id: mesa_id }, transaction: t });

        await t.commit();
        res.status(201).send({ message: "Pedido creado exitosamente.", pedido });

    } catch (error) {
        await t.rollback();
        res.status(500).send({ message: "Error al crear el pedido: " + error.message });
    }
};

// Obtener todos los pedidos (versión robusta final)
export const getAllPedidos = async (req, res) => {
    try {
        const whereClause = {};
        if (req.query.estado) {
            whereClause.estado = req.query.estado;
        }

        const pedidosBasicos = await Pedido.findAll({
            where: whereClause,
            order: [['fecha_creacion', 'DESC']],
        });

        if (!pedidosBasicos.length) {
            return res.status(200).send([]);
        }

        const pedidosCompletos = await Promise.all(
            pedidosBasicos.map(async (pedido) => {
                const [usuario, mesa, productos] = await Promise.all([
                    pedido.getUsuario({ attributes: ['nombre'], required: false }),
                    pedido.getMesa({ attributes: ['numero_mesa'], required: false }),
                    pedido.getProductos({
                        attributes: ['nombre_producto', 'valor_neto'],
                        through: { attributes: ['cantidad', 'notas'] }
                    })
                ]);

                const pedidoJSON = pedido.toJSON();
                pedidoJSON.Usuario = usuario;
                pedidoJSON.Mesa = mesa;
                pedidoJSON.Productos = productos.map(p => {
                    const productoJSON = p.toJSON();
                    productoJSON.DetallePedido = productoJSON.detalle_pedido;
                    delete productoJSON.detalle_pedido;
                    return productoJSON;
                });

                return pedidoJSON;
            })
        );
        res.status(200).send(pedidosCompletos);
    } catch (error) {
        console.error("Error en getAllPedidos (versión robusta final):", error);
        res.status(500).send({ message: "Error al obtener los pedidos." });
    }
};

// Obtener un pedido por ID con sus productos
export const getPedidoById = async (req, res) => {
    try {
        const { id } = req.params;
        const pedido = await Pedido.findByPk(id, {
            include: [{
                model: Producto,
                through: { attributes: ['cantidad', 'notas'] }
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

// Actualizar los items de un pedido
export const updatePedidoItems = async (req, res) => {
    const { id } = req.params;
    const { items } = req.body;
    const t = await sequelize.transaction();
    try {
        await DetallePedido.destroy({ where: { pedido_id: id }, transaction: t });
        const nuevosDetalles = items.map(item => ({
            pedido_id: id,
            producto_id: item.producto_id,
            cantidad: item.cantidad,
            notas: item.notas
        }));
        await DetallePedido.bulkCreate(nuevosDetalles, { transaction: t });
        await t.commit();
        res.status(200).send({ message: "Pedido actualizado exitosamente." });
    } catch (error) {
        await t.rollback();
        res.status(500).send({ message: "Error al actualizar el pedido: " + error.message });
    }
};

// Cancelar/Eliminar un pedido
export const deletePedido = async (req, res) => {
    const { id } = req.params;
    const t = await sequelize.transaction();
    try {
        const pedido = await Pedido.findByPk(id, { transaction: t });
        if (!pedido) {
            await t.rollback();
            return res.status(404).send({ message: "Pedido no encontrado." });
        }
        await Mesa.update({ estado: 'disponible' }, { where: { mesa_id: pedido.mesa_id }, transaction: t });
        await Pedido.destroy({ where: { pedido_id: id }, transaction: t });
        await t.commit();
        res.status(200).send({ message: "Pedido cancelado y eliminado exitosamente." });
    } catch (error) {
        await t.rollback();
        res.status(500).send({ message: "Error al cancelar el pedido: " + error.message });
    }
};