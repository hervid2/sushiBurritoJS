// =================================================================
// ARCHIVO: src/models/metodo_pago.model.js
// =================================================================

export default (sequelize, DataTypes) => {
  const MetodoPago = sequelize.define('MetodoPago', {
      metodo_pago_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      nombre_metodo: { type: DataTypes.STRING(50), allowNull: false, unique: true }
  }, { tableName: 'metodos_pago', timestamps: false });
  return MetodoPago;
};