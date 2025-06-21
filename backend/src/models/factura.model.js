// =================================================================
// ARCHIVO: src/models/factura.model.js
// =================================================================

export default (sequelize, DataTypes) => {
    const Factura = sequelize.define('Factura', {
        factura_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        pedido_id: { type: DataTypes.INTEGER, unique: true },
        subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        impuesto_total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        propina: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },
        total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        fecha_factura: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        metodo_pago_id: { type: DataTypes.INTEGER }
    }, { tableName: 'facturas', timestamps: false });
    return Factura;
};