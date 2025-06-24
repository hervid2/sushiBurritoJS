// src/models/transaccion_pago.model.js
export default (sequelize, DataTypes) => {
    const TransaccionPago = sequelize.define('TransaccionPago', {
        transaccion_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        factura_id: { type: DataTypes.INTEGER, allowNull: false },
        metodo_pago_id: { type: DataTypes.INTEGER, allowNull: false },
        monto_pagado: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
    }, {
        tableName: 'transacciones_pago',
        timestamps: false
    });
    return TransaccionPago;
};