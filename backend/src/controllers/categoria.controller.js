// =================================================================
// ARCHIVO: src/controllers/categoria.controller.js
// =================================================================

import db from '../models/index.js';
const Categoria = db.Categoria;

// Crear una nueva categoría
export const createCategory = async (req, res) => {
    try {
        const { nombre } = req.body;
        if (!nombre) {
            return res.status(400).send({ message: 'El nombre de la categoría es requerido.' });
        }
        const nuevaCategoria = await Categoria.create({ nombre });
        res.status(201).send({ message: 'Categoría creada exitosamente.', categoria: nuevaCategoria });
    } catch (error) {
        // Manejar error de nombre duplicado
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).send({ message: 'La categoría ya existe.' });
        }
        res.status(500).send({ message: error.message });
    }
};

// Obtener todas las categorías
export const getAllCategories = async (req, res) => {
    try {
        const categorias = await Categoria.findAll();
        res.status(200).send(categorias);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Eliminar una categoría
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const num = await Categoria.destroy({ where: { categoria_id: id } });
        if (num == 1) {
            res.send({ message: "Categoría eliminada exitosamente." });
        } else {
            res.send({ message: `No se pudo eliminar la categoría con id=${id}. Quizás no fue encontrada.` });
        }
    } catch (error) {
        res.status(500).send({ message: "Error al eliminar la categoría." });
    }
};