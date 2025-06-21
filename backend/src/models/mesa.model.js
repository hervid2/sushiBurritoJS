// =================================================================
// ARCHIVO: src/models/mesa.model.js
// =================================================================

export default (sequelize, DataTypes) => {
  const Mesa = sequelize.define('Mesa', {
      mesa_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      numero_mesa: { type: DataTypes.INTEGER, allowNull: false, unique: true },
      estado: { type: DataTypes.ENUM('disponible','ocupada','limpieza','inactiva'), allowNull: false, defaultValue: 'disponible' }
  }, { tableName: 'mesas', timestamps: false });
  return Mesa;
};
