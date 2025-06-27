// =================================================================
// ARCHIVO: src/models/pedido.model.js
// =================================================================

export default (sequelize, DataTypes) => {
  const Pedido = sequelize.define('Pedido', {
    pedido_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    usuario_id: { type: DataTypes.INTEGER },
    mesa_id: { type: DataTypes.INTEGER },
    estado: { type: DataTypes.ENUM('pendiente','en_preparacion','preparado','entregado','pagado','cancelado'), allowNull: false, defaultValue: 'pendiente' },
  }, { 
    tableName: 'pedidos', 
    timestamps: true, // Corregido: le decimos que SÍ maneje timestamps
    createdAt: 'fecha_creacion', // Le decimos cuál es la columna de creación
    updatedAt: 'fecha_modificacion' // Le decimos cuál es la columna de modificación
  });
  return Pedido;
};