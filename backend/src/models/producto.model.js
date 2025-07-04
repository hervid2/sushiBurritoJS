// =================================================================
// ARCHIVO: src/models/producto.model.js
// ROL: Define el modelo de Sequelize para la tabla 'productos'.
//      Este modelo representa cada ítem individual del menú
//      que el restaurante ofrece.
// =================================================================

/**
 * Define y exporta el modelo 'Producto' de Sequelize.
 *
 * @param {object} sequelize - La instancia de conexión de Sequelize.
 * @param {object} DataTypes - El objeto que contiene los tipos de datos de Sequelize.
 * @returns {object} El modelo 'Producto' inicializado.
 */
export default (sequelize, DataTypes) => {
    const Producto = sequelize.define('Producto', {
        // --- Definición de Atributos (Columnas) ---

        producto_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nombre_producto: {
            type: DataTypes.STRING(100),
            allowNull: false // Es obligatorio que un producto tenga nombre.
        },
        // Se usa TEXT para descripciones que pueden exceder los 255 caracteres.
        descripcion_ingredientes: {
            type: DataTypes.TEXT
        },
        // Se usa DECIMAL para valores monetarios para garantizar la precisión.
        valor_neto: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false // Es obligatorio que un producto tenga un precio.
        },
        // Clave foránea que referencia a la tabla 'categorias'.
        categoria_id: {
            type: DataTypes.INTEGER
        }
    }, {
        // --- Opciones Adicionales del Modelo ---

        tableName: 'productos',
        timestamps: false // No se necesitan las columnas 'createdAt' y 'updatedAt'.
    });

    // Este modelo será utilizado en 'index.js' para establecer sus asociaciones
    // con los modelos Categoria y Pedido (a través de DetallePedido).
    return Producto;
};