// =================================================================
// ARCHIVO: src/models/pedido.model.js
// ROL: Define el modelo de Sequelize para la tabla 'pedidos'.
//      Esta es la entidad central que representa una orden de un
//      cliente y gestiona el flujo de trabajo del restaurante.
// =================================================================

/**
 * Define y exporta el modelo 'Pedido' de Sequelize.
 *
 * @param {object} sequelize - La instancia de conexión de Sequelize.
 * @param {object} DataTypes - El objeto que contiene los tipos de datos de Sequelize.
 * @returns {object} El modelo 'Pedido' inicializado.
 */
export default (sequelize, DataTypes) => {
    const Pedido = sequelize.define('Pedido', {
        // --- Definición de Atributos (Columnas) ---

        pedido_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        // Clave foránea que referencia a la tabla 'usuarios'.
        usuario_id: {
            type: DataTypes.INTEGER
        },
        // Clave foránea que referencia a la tabla 'mesas'.
        mesa_id: {
            type: DataTypes.INTEGER
        },
        // El estado del pedido, que dicta su posición en el flujo de trabajo.
        estado: { 
            type: DataTypes.STRING(50), 
            allowNull: false, 
            // Por defecto, un nuevo pedido siempre se crea en estado 'pendiente'.
            defaultValue: 'pendiente' 
        },

    }, { 
        // --- Opciones Adicionales del Modelo ---

        tableName: 'pedidos', 
        
        // 'timestamps: true' le indica a Sequelize que gestione automáticamente
        // las columnas de fecha y hora de creación y actualización.
        timestamps: true,
        
        // 'createdAt' y 'updatedAt' son alias. Le dicen a Sequelize que use
        // los nombres de columna especificados ('fecha_creacion', 'fecha_modificacion')
        // en lugar de los nombres por defecto ('createdAt', 'updatedAt').
        createdAt: 'fecha_creacion',
        updatedAt: 'fecha_modificacion'
    });

    // Este modelo es central y se asociará con Usuario, Mesa, Producto y Factura en 'index.js'.
    return Pedido;
};
