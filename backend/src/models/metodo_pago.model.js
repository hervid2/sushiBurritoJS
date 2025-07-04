// =================================================================
// ARCHIVO: src/models/metodo_pago.model.js
// ROL: Define el modelo de Sequelize para la tabla 'metodos_pago'.
//      Esta tabla actúa como una tabla de consulta (lookup table)
//      para las formas de pago aceptadas por el restaurante.
// =================================================================

/**
 * Define y exporta el modelo 'MetodoPago' de Sequelize.
 *
 * @param {object} sequelize - La instancia de conexión de Sequelize.
 * @param {object} DataTypes - El objeto que contiene los tipos de datos de Sequelize.
 * @returns {object} El modelo 'MetodoPago' inicializado.
 */
export default (sequelize, DataTypes) => {
    const MetodoPago = sequelize.define('MetodoPago', {
        // --- Definición de Atributos (Columnas) ---

        metodo_pago_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nombre_metodo: {
            // El nombre del método de pago (ej. 'Efectivo', 'Tarjeta de Crédito').
            type: DataTypes.STRING(50),
            allowNull: false, // Es un campo obligatorio.
            unique: true      // No pueden existir dos métodos de pago con el mismo nombre.
        }
    }, {
        // --- Opciones Adicionales del Modelo ---

        tableName: 'metodos_pago',
        timestamps: false // No se necesitan las columnas 'createdAt' y 'updatedAt' para esta tabla.
    });

    // Este modelo será utilizado en 'index.js' para establecer sus asociaciones
    // con los modelos Factura y TransaccionPago.
    return MetodoPago;
};
