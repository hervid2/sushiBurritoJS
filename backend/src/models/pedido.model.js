// =================================================================
// ARCHIVO: src/models/pedido.model.js
// =================================================================

export default (sequelize, DataTypes) => {
  const Pedido = sequelize.define('Pedido', {
    pedido_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    usuario_id: { type: DataTypes.INTEGER },
    mesa_id: { type: DataTypes.INTEGER },
    
    estado: { 
      type: DataTypes.STRING(50), 
      allowNull: false, 
      defaultValue: 'pendiente' 
    },

  }, { 
    tableName: 'pedidos', 
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_modificacion'
  });
  return Pedido;
};