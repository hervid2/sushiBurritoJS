// =================================================================
// ARCHIVO: src/models/detalle_pedido.model.js
// ROL: Define el modelo de Sequelize para la tabla 'detalle_pedido'.
//      Esta es una tabla de unión (junction table) que gestiona la
//      relación de muchos a muchos entre Pedidos y Productos.
// =================================================================

/**
 * Define y exporta el modelo 'DetallePedido' de Sequelize.
 *
 * @param {object} sequelize - La instancia de conexión de Sequelize.
 * @param {object} DataTypes - El objeto que contiene los tipos de datos de Sequelize.
 * @returns {object} El modelo 'DetallePedido' inicializado.
 */
export default (sequelize, DataTypes) => {
    // sequelize.define() crea el modelo que representa la tabla de unión.
    const DetallePedido = sequelize.define('DetallePedido', {
        // --- Definición de Atributos (Columnas) ---

        detalle_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        // Clave foránea que referencia a la tabla 'pedidos'.
        pedido_id: {
            type: DataTypes.INTEGER
        },
        // Clave foránea que referencia a la tabla 'productos'.
        producto_id: {
            type: DataTypes.INTEGER
        },
        // Atributo adicional específico de la relación: la cantidad de un producto en un pedido.
        cantidad: {
            type: DataTypes.INTEGER,
            allowNull: false,
            // 'validate' es una regla a nivel de Sequelize para asegurar la integridad de los datos
            // antes de enviarlos a la base de datos.
            validate: {
                min: 1 // Asegura que la cantidad sea siempre un número positivo.
            }
        },
        // Atributo adicional: notas específicas para este producto dentro de este pedido.
        notas: {
            type: DataTypes.TEXT // TEXT es adecuado para cadenas de longitud variable y potencialmente largas.
        }
    }, {
        // --- Opciones Adicionales del Modelo ---

        tableName: 'detalle_pedido',
        timestamps: false
    });

    // Este modelo será utilizado en 'index.js' en la opción 'through' de la
    // asociación belongsToMany entre Pedido y Producto.
    return DetallePedido;
};
