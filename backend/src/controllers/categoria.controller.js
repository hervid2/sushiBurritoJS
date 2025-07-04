// =================================================================
// ARCHIVO: src/controllers/categoria.controller.js
// ROL: Controlador que maneja la lógica de negocio para las
//      operaciones CRUD (Crear, Leer, Actualizar, Eliminar)
//      de la entidad 'Categoria'.
// =================================================================

import db from '../models/index.js';
const Categoria = db.Categoria; // Se obtiene el modelo Categoria desde el objeto db.

/**
 * Crea una nueva categoría en la base de datos.
 * @param {object} req - El objeto de la petición de Express.
 * @param {object} res - El objeto de la respuesta de Express.
 */
export const createCategory = async (req, res) => {
    try {
        // Se extrae el nombre de la categoría del cuerpo de la petición.
        const { nombre } = req.body;
        // Se valida que el nombre no esté vacío.
        if (!nombre) {
            return res.status(400).send({ message: 'El nombre de la categoría es requerido.' });
        }
        // Se utiliza el método 'create' de Sequelize para insertar una nueva fila.
        const nuevaCategoria = await Categoria.create({ nombre });
        // Se envía una respuesta 201 (Created) con un mensaje de éxito y el objeto creado.
        res.status(201).send({ message: 'Categoría creada exitosamente.', categoria: nuevaCategoria });
    } catch (error) {
        // Manejo de errores específico para la restricción de unicidad de Sequelize.
        if (error.name === 'SequelizeUniqueConstraintError') {
            // Si el nombre ya existe, se devuelve un error 409 (Conflict).
            return res.status(409).send({ message: 'La categoría ya existe.' });
        }
        // Para cualquier otro error, se devuelve un 500 (Internal Server Error).
        res.status(500).send({ message: error.message });
    }
};

/**
 * Obtiene una lista de todas las categorías.
 * @param {object} req - El objeto de la petición de Express.
 * @param {object} res - El objeto de la respuesta de Express.
 */
export const getAllCategories = async (req, res) => {
    try {
        // Se utiliza el método 'findAll' para obtener todos los registros de la tabla.
        const categorias = await Categoria.findAll();
        // Se envía la lista de categorías con un estado 200 (OK).
        res.status(200).send(categorias);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

/**
 * Obtiene una categoría específica por su ID.
 * @param {object} req - El objeto de la petición de Express.
 * @param {object} res - El objeto de la respuesta de Express.
 */
export const getCategoryById = async (req, res) => {
    try {
        // Se extrae el ID de los parámetros de la URL (ej. /api/categorias/5).
        const { id } = req.params;
        // Se utiliza 'findByPk' (Find By Primary Key) para una búsqueda eficiente por ID.
        const categoria = await Categoria.findByPk(id);
        
        if (categoria) {
            // Si se encuentra, se envía el objeto de la categoría.
            res.status(200).send(categoria);
        } else {
            // Si no se encuentra, se devuelve un error 404 (Not Found).
            res.status(404).send({ message: `Categoría con id=${id} no encontrada.` });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

/**
 * Actualiza una categoría existente.
 * @param {object} req - El objeto de la petición de Express.
 * @param {object} res - El objeto de la respuesta de Express.
 */
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        // 'update' devuelve un array donde el primer elemento es el número de filas afectadas.
        const [num] = await Categoria.update(req.body, { where: { categoria_id: id } });
        
        // Se comprueba si se actualizó exactamente una fila.
        if (num == 1) {
            res.send({ message: "Categoría actualizada exitosamente." });
        } else {
            // Si no se actualizó ninguna fila, significa que no se encontró el ID.
            res.status(404).send({ message: `No se pudo actualizar la categoría con id=${id}.` });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

/**
 * Elimina una categoría existente.
 * @param {object} req - El objeto de la petición de Express.
 * @param {object} res - El objeto de la respuesta de Express.
 */
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        // 'destroy' devuelve el número de filas eliminadas.
        const num = await Categoria.destroy({ where: { categoria_id: id } });
        
        // Se comprueba si se eliminó exactamente una fila.
        if (num == 1) {
            res.send({ message: "Categoría eliminada exitosamente." });
        } else {
            // Si no se eliminó ninguna fila, significa que no se encontró el ID.
            res.send({ message: `No se pudo eliminar la categoría con id=${id}. Quizás no fue encontrada.` });
        }
    } catch (error) {
        res.status(500).send({ message: "Error al eliminar la categoría." });
    }
};
