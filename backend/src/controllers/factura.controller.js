// ===================================================
// ARCHIVO: src/controllers/factura.controller.js 
// ===================================================

import db from '../models/index.js';
const { Pedido, Factura, Producto, MetodoPago, sequelize } = db;

// Crear una nueva factura basada en un pedido
export const createInvoice = async (req, res) => {
    const { pedido_id, metodo_pago_id, propina } = req.body;

    if (!pedido_id || !metodo_pago_id) {
        return res.status(400).send({ message: "El ID del pedido y el método de pago son requeridos." });
    }

    const t = await sequelize.transaction();
    try {
        const pedido = await Pedido.findByPk(pedido_id, {
            include: [{ model: Producto, through: { attributes: ['cantidad'] } }],
            transaction: t
        });

        if (!pedido) {
            await t.rollback();
            return res.status(404).send({ message: "Pedido no encontrado." });
        }
        if (pedido.estado !== 'entregado') {
             await t.rollback();
             return res.status(400).send({ message: `El pedido no se puede facturar en estado: ${pedido.estado}` });
        }

        let subtotal = 0;
        pedido.Productos.forEach(producto => {
            const cantidad = producto.DetallePedido.cantidad;
            subtotal += cantidad * parseFloat(producto.valor_neto);
        });
        
        const impuesto_total = subtotal * 0.08;
        const propina_valor = parseFloat(propina) || 0;
        const total = subtotal + impuesto_total + propina_valor;

        const nuevaFactura = await Factura.create({
            pedido_id, metodo_pago_id, subtotal, impuesto_total,
            propina: propina_valor, total
        }, { transaction: t });

        await pedido.update({ estado: 'pagado' }, { transaction: t });
        await t.commit();
        res.status(201).send({ message: "Factura creada exitosamente.", factura: nuevaFactura });

    } catch (error) {
        await t.rollback();
        res.status(500).send({ message: "Error al crear la factura: " + error.message });
    }
};

// Obtener una factura específica por su ID
export const getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const factura = await Factura.findByPk(id, {
            // Incluimos el pedido asociado y su método de pago para tener todos los detalles
            include: [
                { model: Pedido },
                { model: MetodoPago }
            ]
        });

        if (factura) {
            res.status(200).send(factura);
        } else {
            res.status(404).send({ message: `Factura con id=${id} no encontrada.` });
        }
    } catch (error) {
        res.status(500).send({ message: "Error al obtener la factura: " + error.message });
    }
};