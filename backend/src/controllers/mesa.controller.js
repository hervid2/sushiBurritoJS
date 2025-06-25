// =================================================================
// ARCHIVO: src/controllers/mesa.controller.js
// =================================================================

import db from '../models/index.js';
const Mesa = db.Mesa;

// Crear una nueva mesa
export const createMesa = async (req, res) => {
    try {
        const { numero_mesa, estado } = req.body;
        if (!numero_mesa) {
            return res.status(400).send({ message: "El número de mesa es requerido." });
        }
        const nuevaMesa = await Mesa.create({ numero_mesa, estado });
        res.status(201).send(nuevaMesa);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Obtener todas las mesas
export const getAllMesas = async (req, res) => {
    try {
        const mesas = await Mesa.findAll({ order: [['numero_mesa', 'ASC']] });
        res.status(200).send(mesas);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Actualizar solo el estado de una mesa
export const updateMesaEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        if (!estado) {
            return res.status(400).send({ message: "El nuevo estado es requerido." });
        }
        const [num] = await Mesa.update({ estado: estado }, { where: { mesa_id: id } });
        if (num == 1) {
            res.send({ message: "Estado de la mesa actualizado exitosamente." });
        } else {
            res.status(404).send({ message: `No se encontró la mesa con id=${id}.` });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Marcar una mesa como disponible (después de la limpieza)
export const markTableAsAvailable = async (req, res) => {
    try {
        const { id } = req.params;
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

// Eliminar una mesa
export const deleteMesa = async (req, res) => {
    try {
        const { id } = req.params;
        const num = await Mesa.destroy({ where: { mesa_id: id } });
        if (num == 1) {
            res.send({ message: "Mesa eliminada exitosamente." });
        } else {
            res.status(404).send({ message: `No se pudo eliminar la mesa con id=${id}.` });
        }
    } catch (error) {
        res.status(500).send({ message: "Error al eliminar la mesa." });
    }
};