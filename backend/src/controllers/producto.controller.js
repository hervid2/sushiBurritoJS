// =================================================================
// ARCHIVO: src/controllers/producto.controller.js
// =================================================================

import db from '../models/index.js';
const Producto = db.Producto;
const Categoria = db.Categoria;

// Crear un nuevo producto
export const createProduct = async (req, res) => {
    try {
        const { nombre_producto, descripcion_ingredientes, valor_neto, categoria_id } = req.body;
        if (!nombre_producto || !valor_neto || !categoria_id) {
            return res.status(400).send({ message: "Nombre, valor y categoría son requeridos." });
        }
        const nuevoProducto = await Producto.create({ nombre_producto, descripcion_ingredientes, valor_neto, categoria_id });
        res.status(201).send(nuevoProducto);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Obtener todos los productos, incluyendo su categoría
export const getAllProducts = async (req, res) => {
    try {
        const productos = await Producto.findAll({
            include: [{
                model: Categoria,
                attributes: ['nombre'] // Incluye solo el nombre de la categoría
            }]
        });
        res.status(200).send(productos);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Obtener un producto por ID
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const producto = await Producto.findByPk(id, { include: [Categoria] });
        if (producto) {
            res.status(200).send(producto);
        } else {
            res.status(404).send({ message: `Producto con id=${id} no encontrado.` });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Actualizar un producto
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const num = await Producto.update(req.body, { where: { producto_id: id } });
        if (num == 1) {
            res.send({ message: "Producto actualizado exitosamente." });
        } else {
            res.send({ message: `No se pudo actualizar el producto con id=${id}.` });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Eliminar un producto
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const num = await Producto.destroy({ where: { producto_id: id } });
        if (num == 1) {
            res.send({ message: "Producto eliminado exitosamente." });
        } else {
            res.send({ message: `No se pudo eliminar el producto con id=${id}.` });
        }
    } catch (error) {
        res.status(500).send({ message: "Error al eliminar el producto." });
    }
};
