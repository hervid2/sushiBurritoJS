// =================================================================
// ARCHIVO: src/models/categoria.model.js
// =================================================================

export default (sequelize, DataTypes) => {
  const Categoria = sequelize.define('Categoria', {
      categoria_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      nombre: { type: DataTypes.ENUM('entradas','platos_fuertes','bebidas','acompañamientos','infantil','postres'), allowNull: false, unique: true }
  }, { tableName: 'categorias', timestamps: false });
  return Categoria;
};