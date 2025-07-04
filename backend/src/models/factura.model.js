// =================================================================
// ARCHIVO: src/models/factura.model.js
// ROL: Define el modelo de Sequelize para la tabla 'facturas'.
//      Este modelo representa el registro financiero de un pedido
//      completado y pagado.
// =================================================================

/**
 * Define y exporta el modelo 'Factura' de Sequelize.
 *
 * @param {object} sequelize - La instancia de conexión de Sequelize.
 * @param {object} DataTypes - El objeto que contiene los tipos de datos de Sequelize.
 * @returns {object} El modelo 'Factura' inicializado.
 */
export default (sequelize, DataTypes) => {
    const Factura = sequelize.define('Factura', {
        // --- Definición de Atributos (Columnas) ---

        factura_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        // Clave foránea que referencia a la tabla 'pedidos'.
        pedido_id: {
            type: DataTypes.INTEGER,
            // 'unique: true' impone una relación de uno a uno. Un pedido solo puede tener una factura.
            unique: true
        },
        // Los campos monetarios se definen como DECIMAL para garantizar la precisión.
        subtotal: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        impuesto_total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        propina: {
            type: DataTypes.DECIMAL(10, 2),
            // 'defaultValue' establece un valor por defecto si no se proporciona uno.
            defaultValue: 0.0
        },
        total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        // 'defaultValue: DataTypes.NOW' inserta automáticamente la fecha y hora de creación.
        fecha_factura: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        // Clave foránea que referencia a la tabla 'metodos_pago'.
        metodo_pago_id: {
            type: DataTypes.INTEGER
        }
    }, {
        // --- Opciones Adicionales del Modelo ---

        tableName: 'facturas',
        // Se deshabilita la gestión automática de 'createdAt' y 'updatedAt'
        // porque ya se maneja 'fecha_factura'.
        timestamps: false
    });

    // Este modelo será utilizado en 'index.js' para establecer sus asociaciones
    // con los modelos Pedido, MetodoPago y TransaccionPago.
    return Factura;
};
