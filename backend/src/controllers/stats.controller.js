// =================================================================
// ARCHIVO: src/controllers/stats.controller.js
// DESCRIPCIÓN: Controlador de estadísticas 
// =================================================================

import db from '../models/index.js';
import { Op } from 'sequelize';
import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';
import fs from 'fs'; // Importar 'fs' para leer la imagen del logo

const { Factura, Pedido, DetallePedido, Producto, Usuario, MetodoPago, TransaccionPago, sequelize } = db;

// --- Función Auxiliar para obtener todos los datos ---
const getStatisticsData = async (startDate, endDate) => {
    const finalEndDate = new Date(endDate);
    finalEndDate.setDate(finalEndDate.getDate() + 1);
    const dateFilter = { [Op.gte]: new Date(startDate), [Op.lt]: finalEndDate };

    const [summary, productsRanking, paymentMethods] = await Promise.all([
        Factura.findOne({
            attributes: [[sequelize.fn('COUNT', sequelize.col('factura_id')), 'totalOrders'], [sequelize.fn('SUM', sequelize.col('total')), 'totalRevenue']],
            where: { fecha_factura: dateFilter }, raw: true
        }),
        DetallePedido.findAll({
            attributes: [[sequelize.col('Producto.nombre_producto'), 'name'], [sequelize.fn('SUM', sequelize.col('cantidad')), 'quantity']],
            include: [{ model: Producto, attributes: [] }, { model: Pedido, attributes: [], where: { fecha_creacion: dateFilter }, required: false }],
            group: ['Producto.nombre_producto'], order: [[sequelize.fn('SUM', sequelize.col('cantidad')), 'DESC']], limit: 10, raw: true
        }),
        TransaccionPago.findAll({
            attributes: [[sequelize.col('MetodoPago.nombre_metodo'), 'name'], [sequelize.fn('SUM', sequelize.col('monto_pagado')), 'totalAmount']],
            include: [{ model: MetodoPago, attributes: [] }, { model: Factura, attributes: [], where: { fecha_factura: dateFilter }, required: true }],
            group: ['MetodoPago.nombre_metodo'], raw: true
        })
    ]);

    return {
        summary: { totalOrders: summary.totalOrders || 0, totalRevenue: parseFloat(summary.totalRevenue || 0).toFixed(2) },
        productsRanking,
        paymentMethods
    };
};

// --- Función Auxiliar para dibujar tablas en el PDF ---
function drawTable(doc, startY, title, headers, data) {
    let currentY = startY;
    const tableTop = startY + 25;
    const rowHeight = 25;
    const colWidths = [350, 150]; // Ancho para las dos columnas
    const tableRight = 50 + colWidths[0] + colWidths[1];

    doc.fontSize(14).font('Helvetica-Bold').text(title, 50, currentY);
    currentY += 35;

    // Dibujar encabezado
    doc.font('Helvetica-Bold');
    headers.forEach((header, i) => {
        doc.text(header, 50 + (i * colWidths[i-1] || 0), currentY, { width: colWidths[i], align: 'left' });
    });
    doc.moveTo(50, currentY + rowHeight - 5).lineTo(tableRight, currentY + rowHeight - 5).stroke();
    currentY += rowHeight;

    // Dibujar filas de datos
    doc.font('Helvetica');
    data.forEach(row => {
        row.forEach((cell, i) => {
            doc.text(String(cell), 50 + (i * colWidths[i-1] || 0), currentY, { width: colWidths[i], align: 'left' });
        });
        doc.moveTo(50, currentY + rowHeight - 5).lineTo(tableRight, currentY + rowHeight - 5).stroke();
        currentY += rowHeight;
    });

    // Dibujar bordes verticales
    doc.moveTo(50, tableTop - 10).lineTo(50, currentY - 5).stroke(); // Borde izquierdo
    doc.moveTo(50 + colWidths[0], tableTop - 10).lineTo(50 + colWidths[0], currentY - 5).stroke(); // Borde medio
    doc.moveTo(tableRight, tableTop - 10).lineTo(tableRight, currentY - 5).stroke(); // Borde derecho

    return currentY; // Devuelve la posición Y final para encadenar tablas
}

// --- Función para crear el buffer del PDF ---
async function createPdfBuffer(stats, startDate, endDate) {
    return new Promise((resolve) => {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // Añadir el logo
        if (fs.existsSync('assets/logo.jpg')) {
            doc.image('assets/logo.jpg', {
                fit: [60, 60],
                x: 50,
                y: 45
            });
        }
        
        // Títulos principales
        doc.fontSize(18).font('Helvetica-Bold').text('Reporte de Estadísticas - Sushi Burrito', { align: 'center' });
        doc.fontSize(12).font('Helvetica').text(`Periodo: ${startDate} al ${endDate}`, { align: 'center' });
        doc.moveDown(3);

        let currentY = doc.y;

        // Tabla de Resumen General
        const summaryData = [
            ['Total de Pedidos Facturados', stats.summary.totalOrders],
            ['Ingresos Totales', `$${stats.summary.totalRevenue}`]
        ];
        currentY = drawTable(doc, currentY, 'Resumen General', ['Descripción', 'Valor'], summaryData);
        currentY += 20;

        // Tabla de Desglose por Método de Pago
        const paymentData = stats.paymentMethods.length > 0 
            ? stats.paymentMethods.map(method => [method.name, `$${parseFloat(method.totalAmount).toFixed(2)}`])
            : [['No hay datos para este período.', '']];
        currentY = drawTable(doc, currentY, 'Desglose por Método de Pago', ['Método', 'Monto Total'], paymentData);
        currentY += 20;

        // Tabla de Ranking de Productos
        const rankingData = stats.productsRanking.length > 0 
            ? stats.productsRanking.map(item => [item.name, item.quantity])
            : [['No hay ranking para este período.', '']];
        currentY = drawTable(doc, currentY, 'Ranking de Productos', ['Producto', 'Cantidad Vendida'], rankingData);
        
        doc.end();
    });
}

// --- Endpoint para la página de estadísticas ---
export const getStatistics = async (req, res) => {
    try {
        const stats = await getStatisticsData(req.query.startDate, req.query.endDate);
        res.status(200).send(stats);
    } catch (error) {
        res.status(500).send({ message: "Error al procesar las estadísticas." });
    }
};

// --- Endpoint para generar y enviar el PDF ---
export const sendStatisticsReport = async (req, res) => {
    const { startDate, endDate } = req.body;
    try {
        const [stats, admin] = await Promise.all([ getStatisticsData(startDate, endDate), Usuario.findByPk(req.userId) ]);
        if (!admin) return res.status(404).send({ message: "Usuario administrador no encontrado." });
        const pdfBuffer = await createPdfBuffer(stats, startDate, endDate);
        await sendEmailWithAttachment(admin.correo, pdfBuffer, startDate, endDate);
        res.status(200).send({ message: `Reporte enviado exitosamente a ${admin.correo}` });
    } catch (error) {
        res.status(500).send({ message: "Error al procesar el reporte." });
    }
};

// --- Endpoint para el resumen del Dashboard ---
export const getDashboardSummary = async (req, res) => {
    try {
        const [pendingOrders, totalUsers, dailySales] = await Promise.all([
            Pedido.count({ where: { estado: { [Op.in]: ['pendiente', 'en_preparacion'] } } }),
            Usuario.count(),
            Factura.sum('total', {
                where: {
                    fecha_factura: {
                        [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)),
                        [Op.lt]: new Date(new Date().setHours(23, 59, 59, 999))
                    }
                }
            })
        ]);
        res.status(200).send({
            pendingOrdersCount: pendingOrders || 0,
            registeredUsersCount: totalUsers || 0,
            dailySalesAmount: parseFloat(dailySales || 0).toFixed(2)
        });
    } catch (error) {
        res.status(500).send({ message: "Error al procesar las estadísticas del dashboard." });
    }
};

// --- Endpoint para la actividad reciente del Dashboard ---
export const getRecentActivity = async (req, res) => {
    try {
        const recentOrders = await Pedido.findAll({ limit: 5, order: [['fecha_creacion', 'DESC']], attributes: ['pedido_id', 'fecha_creacion'] });
        const recentInvoices = await Factura.findAll({ limit: 5, order: [['fecha_factura', 'DESC']], attributes: ['factura_id', 'pedido_id', 'fecha_factura'] });
        const activities = [
            ...recentOrders.map(order => ({ type: 'pedido', date: order.fecha_creacion, description: `Nuevo pedido #${order.pedido_id} fue creado.` })),
            ...recentInvoices.map(invoice => ({ type: 'factura', date: invoice.fecha_factura, description: `Se generó la factura #${invoice.factura_id} para el pedido #${invoice.pedido_id}.` }))
        ];
        const sortedActivities = activities.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
        res.status(200).send(sortedActivities);
    } catch (error) {
        res.status(500).send({ message: "Error interno al procesar la actividad." });
    }
};

// --- Función para enviar correo con el reporte ---
async function sendEmailWithAttachment(recipientEmail, pdfBuffer, startDate, endDate) {
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD }
    });
    await transporter.sendMail({
        from: `"Reporte ventas y estadísticas Sushi Burrito" <${process.env.EMAIL_USER}>`,
        to: recipientEmail,
        subject: `Reporte de (${startDate} a ${endDate})`,
        text: 'Adjunto encontrarás el reporte de estadísticas de ventas generado para el periodo seleccionado.',
        attachments: [{
            filename: `reporte_${startDate}_${endDate}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
        }]
    });
}
