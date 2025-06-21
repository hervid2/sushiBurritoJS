// =================================================================
// ARCHIVO: src/models/producto.model.js
// =================================================================

export default (sequelize, DataTypes) => {
  const Producto = sequelize.define('Producto', {
      producto_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      nombre_producto: { type: DataTypes.STRING(100), allowNull: false },
      descripcion_ingredientes: { type: DataTypes.TEXT },
      valor_neto: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      categoria_id: { type: DataTypes.INTEGER }
  }, { tableName: 'productos', timestamps: false });
  return Producto;
};