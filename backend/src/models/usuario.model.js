// =================================================================
// ARCHIVO: src/models/usuario.model.js
// ROL: Define el modelo de Sequelize para la tabla 'usuarios'.
//      Este modelo es fundamental para la autenticación y autorización,
//      e incluye un hook para el hasheo seguro de contraseñas.
// =================================================================

// Se importa la librería bcryptjs para el hasheo de contraseñas.
import bcrypt from 'bcryptjs';

/**
 * Define y exporta el modelo 'Usuario' de Sequelize.
 *
 * @param {object} sequelize - La instancia de conexión de Sequelize.
 * @param {object} DataTypes - El objeto que contiene los tipos de datos de Sequelize.
 * @returns {object} El modelo 'Usuario' inicializado.
 */
export default (sequelize, DataTypes) => {
    const Usuario = sequelize.define('Usuario', {
        // --- Definición de Atributos (Columnas) ---

        usuario_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        // Clave foránea que referencia a la tabla 'roles'.
        rol_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        correo: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            // 'validate' proporciona validaciones a nivel de modelo.
            validate: {
                isEmail: true // Sequelize comprobará que el valor tenga formato de email.
            }
        },
        contraseña: {
            // El tipo STRING(255) es adecuado para almacenar el hash de bcrypt.
            type: DataTypes.STRING(255),
            allowNull: false
        }
    }, {
        // --- Opciones Adicionales del Modelo ---

        tableName: 'usuarios',
        timestamps: false,
        
        // 'hooks' son funciones que se ejecutan automáticamente durante el ciclo de vida de un modelo.
        hooks: {
            /**
             * Hook 'beforeCreate': Se ejecuta automáticamente justo antes de que un nuevo
             * registro de usuario sea insertado en la base de datos.
             * Su propósito es hashear la contraseña en texto plano.
             * @param {object} usuario - La instancia del usuario que está a punto de ser creada.
             */
            beforeCreate: async (usuario) => {
                // Se asegura de que haya una contraseña para hashear.
                if (usuario.contraseña) {
                    // Se genera una 'salt' criptográfica para añadir aleatoriedad al hash.
                    const salt = await bcrypt.genSalt(10);
                    // Se hashea la contraseña y se sobrescribe el valor en texto plano.
                    usuario.contraseña = await bcrypt.hash(usuario.contraseña, salt);
                }
            }
        }
    });

    // Este modelo será utilizado en 'index.js' para establecer sus asociaciones
    // con los modelos Rol y Pedido.
    return Usuario;
};

