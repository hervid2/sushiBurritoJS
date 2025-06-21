// =================================================================
// ARCHIVO: src/models/usuario.model.js
// =================================================================

import bcrypt from 'bcryptjs';

export default (sequelize, DataTypes) => {
    const Usuario = sequelize.define('Usuario', {
        usuario_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        nombre: { type: DataTypes.STRING(100), allowNull: false },
        rol: { type: DataTypes.ENUM('administrador', 'mesero', 'cocinero'), allowNull: false },
        correo: { type: DataTypes.STRING(100), allowNull: false, unique: true, validate: { isEmail: true } },
        contraseña: { type: DataTypes.STRING(255), allowNull: false }
    }, {
        tableName: 'usuarios',
        timestamps: false,
        hooks: {
            beforeCreate: async (usuario) => {
                if (usuario.contraseña) {
                    const salt = await bcrypt.genSalt(10);
                    usuario.contraseña = await bcrypt.hash(usuario.contraseña, salt);
                }
            }
        }
    });
    return Usuario;
};

