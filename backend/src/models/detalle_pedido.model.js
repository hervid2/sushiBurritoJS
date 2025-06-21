// =================================================================
// ARCHIVO: src/models/detalle_pedido.model.js
// =================================================================

export default (sequelize, DataTypes) => {
  const DetallePedido = sequelize.define('DetallePedido', {
      detalle_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      pedido_id: { type: DataTypes.INTEGER },
      producto_id: { type: DataTypes.INTEGER },
      cantidad: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
      notas: { type: DataTypes.TEXT }
  }, { tableName: 'detalle_pedido', timestamps: false });
  return DetallePedido;
};