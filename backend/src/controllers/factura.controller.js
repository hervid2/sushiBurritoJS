// ===================================================
// ARCHIVO: src/controllers/factura.controller.js 
// ===================================================

import db from '../models/index.js';
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';

const { Pedido, Factura, Producto, MetodoPago, DetallePedido, sequelize } = db;

// --- Bloque de Funciones para crear y obtener facturas ---

// --- Función para crear una nueva factura ---
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

// --- Función para obtener una factura por ID ---
export const getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const factura = await Factura.findByPk(id, {
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


// --- Función para Enviar Factura por Correo ---
export const sendInvoiceByEmail = async (req, res) => {
    const { id } = req.params; // ID de la factura
    const { email } = req.body; // Correo del cliente proporcionado en el frontend

    if (!email) {
        return res.status(400).send({ message: "La dirección de correo es requerida." });
    }

    try {
        // 1. Obtener los datos completos de la factura
        const factura = await Factura.findByPk(id, {
            include: [
                {
                    model: Pedido,
                    include: [{
                        model: Producto,
                        through: { attributes: ['cantidad', 'notas'] }
                    }]
                },
                { model: MetodoPago }
            ]
        });

        if (!factura) {
            return res.status(404).send({ message: "Factura no encontrada." });
        }

        // 2. Generar el PDF de la factura en memoria
        const pdfBuffer = await createInvoicePdfBuffer(factura);

        // 3. Enviar el correo con el PDF adjunto
        await sendEmailWithAttachment(email, pdfBuffer, factura.factura_id);

        res.status(200).send({ message: `Factura enviada exitosamente a ${email}` });

    } catch (error) {
        console.error("Error al enviar la factura por correo:", error);
        res.status(500).send({ message: "Error interno al procesar el envío de la factura." });
    }
};

// --- Funciones Auxiliares para PDF y Correo ---
async function createInvoicePdfBuffer(factura) {
    return new Promise((resolve) => {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // --- Contenido del PDF ---
        doc.fontSize(20).text(`Factura #${factura.factura_id}`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Fecha: ${new Date(factura.fecha_factura).toLocaleString()}`);
        doc.text(`Pedido: #${factura.pedido_id}`);
        doc.text(`Método de Pago: ${factura.MetodoPago.nombre_metodo}`);
        doc.moveDown(2);

        // Tabla de productos
        const tableTop = doc.y;
        doc.font('Helvetica-Bold');
        doc.text('Producto', 50, tableTop).text('Cant.', 300, tableTop).text('P. Unit.', 370, tableTop, {width: 60, align: 'right'}).text('Subtotal', 450, tableTop, {width: 60, align: 'right'});
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown();
        doc.font('Helvetica');

        factura.Pedido.Productos.forEach(item => {
            const y = doc.y;
            const subtotalItem = item.DetallePedido.cantidad * parseFloat(item.valor_neto);
            doc.text(item.nombre_producto, 50, y, {width: 250});
            doc.text(item.DetallePedido.cantidad, 300, y);
            doc.text(`$${parseFloat(item.valor_neto).toFixed(2)}`, 370, y, {width: 60, align: 'right'});
            doc.text(`$${subtotalItem.toFixed(2)}`, 450, y, {width: 60, align: 'right'});
            doc.moveDown();
        });
        
        // Totales
        const totalsY = doc.y + 20;
        doc.font('Helvetica-Bold').text('Subtotal:', 370, totalsY).text(`$${factura.subtotal}`, 450, totalsY, {width: 60, align: 'right'});
        doc.font('Helvetica').text('Impuesto (8%):', 370, totalsY + 15).text(`$${factura.impuesto_total}`, 450, totalsY + 15, {width: 60, align: 'right'});
        doc.text('Propina:', 370, totalsY + 30).text(`$${factura.propina}`, 450, totalsY + 30, {width: 60, align: 'right'});
        doc.font('Helvetica-Bold').text('TOTAL:', 370, totalsY + 45).text(`$${factura.total}`, 450, totalsY + 45, {width: 60, align: 'right'});

        doc.end();
    });
}

async function sendEmailWithAttachment(recipientEmail, pdfBuffer, invoiceId) {
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    await transporter.sendMail({
        from: `"Facturación Sushi Burrito" <${process.env.EMAIL_USER}>`,
        to: recipientEmail,
        subject: `Tu Factura #${invoiceId} de Sushi Burrito`,
        text: '¡Gracias por tu compra! Adjunto encontrarás tu factura en formato PDF.',
        attachments: [{
            filename: `factura_${invoiceId}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
        }]
    });
}