// =================================================================
// ARCHIVO: src/controllers/mesa.controller.js
// ROL: Controlador que maneja la lógica de negocio para las
//      operaciones CRUD de la entidad 'Mesa'.
// =================================================================

import db from '../models/index.js';
const Mesa = db.Mesa; // Se obtiene el modelo Mesa desde el objeto db.

/**
 * Crea una nueva mesa en la base de datos.
 * @param {object} req - El objeto de la petición de Express.
 * @param {object} res - El objeto de la respuesta de Express.
 */
export const createMesa = async (req, res) => {
    try {
        // Se extraen los datos del cuerpo de la petición.
        const { numero_mesa, estado } = req.body;
        // Se valida que el número de mesa sea proporcionado.
        if (!numero_mesa) {
            return res.status(400).send({ message: "El número de mesa es requerido." });
        }
        // Se crea el nuevo registro en la base de datos.
        const nuevaMesa = await Mesa.create({ numero_mesa, estado });
        // Se envía la nueva mesa creada con un estado 201 (Created).
        res.status(201).send(nuevaMesa);
    } catch (error) {
        // Manejo de errores generales del servidor.
        res.status(500).send({ message: error.message });
    }
};

/**
 * Obtiene una lista de todas las mesas, ordenadas por su número.
 * @param {object} req - El objeto de la petición de Express.
 * @param {object} res - El objeto de la respuesta de Express.
 */
export const getAllMesas = async (req, res) => {
    try {
        // Se obtienen todos los registros, ordenados ascendentemente por 'numero_mesa'.
        const mesas = await Mesa.findAll({ order: [['numero_mesa', 'ASC']] });
        // Se envía la lista de mesas con un estado 200 (OK).
        res.status(200).send(mesas);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

/**
 * Actualiza el estado de una mesa específica.
 * @param {object} req - El objeto de la petición de Express.
 * @param {object} res - El objeto de la respuesta de Express.
 */
export const updateMesaEstado = async (req, res) => {
    try {
        // Se obtiene el ID de la mesa de los parámetros de la URL.
        const { id } = req.params;
        // Se obtiene el nuevo estado del cuerpo de la petición.
        const { estado } = req.body;
        if (!estado) {
            return res.status(400).send({ message: "El nuevo estado es requerido." });
        }
        // Se actualiza el registro que coincida con el ID proporcionado.
        const [num] = await Mesa.update({ estado: estado }, { where: { mesa_id: id } });
        
        if (num == 1) {
            res.send({ message: "Estado de la mesa actualizado exitosamente." });
        } else {
            // Si no se actualizó ninguna fila, la mesa no fue encontrada.
            res.status(404).send({ message: `No se encontró la mesa con id=${id}.` });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

/**
 * Marca una mesa específica como 'disponible'.
 * @param {object} req - El objeto de la petición de Express.
 * @param {object} res - El objeto de la respuesta de Express.
 */
export const markTableAsAvailable = async (req, res) => {
    try {
        const { id } = req.params;
        // Se actualiza el estado de la mesa a 'disponible'.
        const [num] = await Mesa.update({ estado: 'disponible' }, { where: { mesa_id: id } });
        
        if (num == 1) {
            res.send({ message: "Mesa marcada como disponible." });
        } else {
            res.status(404).send({ message: `No se encontró la mesa con id=${id}.` });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

/**
 * Elimina una mesa de la base de datos.
 * @param {object} req - El objeto de la petición de Express.
 * @param {object} res - El objeto de la respuesta de Express.
 */
export const deleteMesa = async (req, res) => {
    try {
        const { id } = req.params;
        // Se elimina el registro que coincida con el ID proporcionado.
        const num = await Mesa.destroy({ where: { mesa_id: id } });
        
        if (num == 1) {
            res.send({ message: "Mesa eliminada exitosamente." });
        } else {
            // Si no se eliminó ninguna fila, la mesa no fue encontrada.
            res.status(404).send({ message: `No se pudo eliminar la mesa con id=${id}.` });
        }
    } catch (error) {
        res.status(500).send({ message: "Error al eliminar la mesa." });
    }
};