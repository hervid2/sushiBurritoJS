// =================================================================
// ARCHIVO: src/models/pedido.model.js
// =================================================================

export default (sequelize, DataTypes) => {
  const Pedido = sequelize.define('Pedido', {
      pedido_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      usuario_id: { type: DataTypes.INTEGER },
      mesa_id: { type: DataTypes.INTEGER },
      estado: { type: DataTypes.ENUM('pendiente','en_preparacion','preparado','entregado','pagado','cancelado'), allowNull: false, defaultValue: 'pendiente' },
      fecha_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      fecha_modificacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, onUpdate: DataTypes.NOW }
  }, { tableName: 'pedidos', timestamps: false });
  return Pedido;
};