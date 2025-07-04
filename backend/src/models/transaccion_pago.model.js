// =================================================================
// ARCHIVO: src/models/transaccion_pago.model.js
// ROL: Define el modelo de Sequelize para la tabla 'transacciones_pago'.
//      Este modelo registra cada pago individual asociado a una factura,
//      permitiendo la funcionalidad de pagos divididos.
// =================================================================

/**
 * Define y exporta el modelo 'TransaccionPago' de Sequelize.
 *
 * @param {object} sequelize - La instancia de conexión de Sequelize.
 * @param {object} DataTypes - El objeto que contiene los tipos de datos de Sequelize.
 * @returns {object} El modelo 'TransaccionPago' inicializado.
 */
export default (sequelize, DataTypes) => {
    const TransaccionPago = sequelize.define('TransaccionPago', {
        // --- Definición de Atributos (Columnas) ---

        transaccion_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        // Clave foránea que referencia a la tabla 'facturas'.
        factura_id: {
            type: DataTypes.INTEGER,
            allowNull: false // Un pago siempre debe estar asociado a una factura.
        },
        // Clave foránea que referencia a la tabla 'metodos_pago'.
        metodo_pago_id: {
            type: DataTypes.INTEGER,
            allowNull: false // Se debe especificar cómo se realizó el pago.
        },
        // El monto específico pagado en esta transacción.
        monto_pagado: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false // La transacción debe tener un monto.
        }
    }, {
        // --- Opciones Adicionales del Modelo ---

        tableName: 'transacciones_pago',
        timestamps: false // No se necesitan las columnas 'createdAt' y 'updatedAt'.
    });

    // Este modelo será utilizado en 'index.js' para establecer sus asociaciones
    // 'belongsTo' con los modelos Factura y MetodoPago.
    return TransaccionPago;
};
