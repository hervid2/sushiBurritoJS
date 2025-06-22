// ==============================================
// ARCHIVO: src/controllers/stats.controller.js 
// ==============================================

import db from '../models/index.js';
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import { Op } from 'sequelize';

const { Factura, Pedido, DetallePedido, Producto, Usuario, sequelize } = db;

// --- Lógica para generar y enviar el reporte ---
export const sendStatisticsReport = async (req, res) => {
    const { startDate, endDate } = req.body;
    const userId = req.userId; // ID del admin logueado

    if (!startDate || !endDate) {
        return res.status(400).send({ message: "Se requieren fechas de inicio y fin." });
    }

    try {
        // 1. Obtener los datos estadísticos
        const stats = await getStatisticsData(startDate, endDate);
        
        // 2. Obtener el email del admin
        const admin = await Usuario.findByPk(userId);
        if (!admin) {
            return res.status(404).send({ message: "Usuario administrador no encontrado." });
        }

        // 3. Generar el PDF en memoria
        const pdfBuffer = await createPdfBuffer(stats, startDate, endDate);

        // 4. Enviar el correo con el PDF adjunto
        await sendEmailWithAttachment(admin.correo, pdfBuffer, startDate, endDate);

        res.status(200).send({ message: `Reporte enviado exitosamente a ${admin.correo}` });

    } catch (error) {
        console.error("Error al generar o enviar el reporte:", error);
        res.status(500).send({ message: "Error interno al procesar el reporte." });
    }
};

// --- Funciones auxiliares ---

async function getStatisticsData(startDate, endDate) {
    // Calcular total de pedidos e ingresos
    const summary = await Factura.findAll({
        attributes: [
            [sequelize.fn('COUNT', sequelize.col('factura_id')), 'totalOrders'],
            [sequelize.fn('SUM', sequelize.col('total')), 'totalRevenue']
        ],
        where: {
            fecha_factura: {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            }
        },
        raw: true
    });

    // Calcular ranking de productos
    const ranking = await DetallePedido.findAll({
        attributes: [
            [sequelize.col('Producto.nombre_producto'), 'name'],
            [sequelize.fn('SUM', sequelize.col('cantidad')), 'quantity']
        ],
        include: [{
            model: Producto,
            attributes: []
        }, {
            model: Pedido,
            attributes: [],
            where: {
                fecha_creacion: {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                }
            }
        }],
        group: ['Producto.nombre_producto'],
        order: [[sequelize.fn('SUM', sequelize.col('cantidad')), 'DESC']],
        raw: true
    });

    return {
        summary: summary[0],
        ranking: ranking
    };
}

async function createPdfBuffer(stats, startDate, endDate) {
    return new Promise((resolve) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            resolve(Buffer.concat(buffers));
        });

        // Contenido del PDF
        doc.fontSize(20).text('Reporte de Estadísticas - Sushi Burrito', { align: 'center' });
        doc.fontSize(12).text(`Periodo: ${startDate} al ${endDate}`, { align: 'center' });
        doc.moveDown(2);

        // Resumen
        doc.fontSize(16).text('Resumen General', { underline: true });
        doc.moveDown();
        doc.fontSize(12).text(`Total de Pedidos: ${stats.summary.totalOrders || 0}`);
        doc.text(`Ingresos Totales: $${parseFloat(stats.summary.totalRevenue || 0).toFixed(2)}`);
        doc.moveDown(2);

        // Ranking
        doc.fontSize(16).text('Ranking de Productos Vendidos', { underline: true });
        doc.moveDown();
        
        // Encabezados de la tabla
        const tableTop = doc.y;
        doc.fontSize(10).text('Producto', 50, tableTop, { width: 300, continued: true }).text('Cantidad', 370, tableTop);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        
        // Filas de la tabla
        stats.ranking.forEach(item => {
            doc.moveDown();
            const y = doc.y;
            doc.fontSize(10).text(item.name, 50, y, { width: 300, continued: true }).text(item.quantity, 370, y);
        });

        doc.end();
    });
}

async function sendEmailWithAttachment(recipientEmail, pdfBuffer, startDate, endDate) {
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    await transporter.sendMail({
        from: `"Reportes Sushi Burrito" <${process.env.EMAIL_USER}>`,
        to: recipientEmail,
        subject: `Reporte de Estadísticas (${startDate} a ${endDate})`,
        text: 'Adjunto encontrarás el reporte de estadísticas de ventas generado para el periodo seleccionado.',
        attachments: [{
            filename: `reporte_${startDate}_${endDate}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
        }]
    });
}