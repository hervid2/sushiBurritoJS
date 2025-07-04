// =================================================================
// ARCHIVO: src/models/rol.model.js
// ROL: Define el modelo de Sequelize para la tabla 'roles'.
//      Esta tabla actúa como una tabla de consulta para los
//      diferentes niveles de permiso dentro de la aplicación.
// =================================================================

/**
 * Define y exporta el modelo 'Rol' de Sequelize.
 *
 * @param {object} sequelize - La instancia de conexión de Sequelize.
 * @param {object} DataTypes - El objeto que contiene los tipos de datos de Sequelize.
 * @returns {object} El modelo 'Rol' inicializado.
 */
export default (sequelize, DataTypes) => {
    const Rol = sequelize.define('Rol', {
        // --- Definición de Atributos (Columnas) ---

        rol_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nombre_rol: {
            // El nombre del rol (ej. 'administrador', 'mesero').
            type: DataTypes.STRING(50),
            allowNull: false, // Es un campo obligatorio.
            unique: true      // No pueden existir dos roles con el mismo nombre.
        }
    }, {
        // --- Opciones Adicionales del Modelo ---

        tableName: 'roles',
        timestamps: false // No se necesitan las columnas 'createdAt' y 'updatedAt'.
    });

    // Este modelo será utilizado en 'index.js' para establecer su asociación
    // 'hasMany' con el modelo Usuario, formando la base del control de acceso.
    return Rol;
};