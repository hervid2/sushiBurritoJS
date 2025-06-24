// ==================================
// ARCHIVO: src/models/rol.model.js 
// ==================================

export default (sequelize, DataTypes) => {
    const Rol = sequelize.define('Rol', {
        rol_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nombre_rol: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        }
    }, {
        tableName: 'roles',
        timestamps: false
    });

    return Rol;
};