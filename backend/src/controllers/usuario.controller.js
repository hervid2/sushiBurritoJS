// ==================================================
// ARCHIVO: src/controllers/usuario.controller.js 
// ==================================================

import db from '../models/index.js';
const Usuario = db.Usuario;

// Crear un nuevo usuario
export const createUser = async (req, res) => {
    try {
        const { nombre, rol, correo, contraseña } = req.body;
        const nuevoUsuario = await Usuario.create({ nombre, rol, correo, contraseña });
        res.status(201).send({ message: "Usuario creado exitosamente.", usuario: nuevoUsuario });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
             return res.status(409).send({ message: 'El correo electrónico ya está en uso.' });
        }
        res.status(500).send({ message: error.message });
    }
};

// Obtener todos los usuarios
export const getAllUsers = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({ attributes: { exclude: ['contraseña'] } });
        res.status(200).send(usuarios);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Obtener un usuario por ID
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await Usuario.findByPk(id, { attributes: { exclude: ['contraseña'] } });
        if (usuario) {
            res.status(200).send(usuario);
        } else {
            res.status(404).send({ message: `Usuario con id=${id} no encontrado.` });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Actualizar un usuario por ID
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        // La contraseña no se actualiza desde este endpoint por seguridad
        const { nombre, correo, rol } = req.body;
        const [num] = await Usuario.update({ nombre, correo, rol }, { where: { usuario_id: id } });

        if (num == 1) {
            res.send({ message: "Usuario actualizado exitosamente." });
        } else {
            res.status(404).send({ message: `No se pudo actualizar el usuario con id=${id}.` });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Eliminar un usuario por ID
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const num = await Usuario.destroy({ where: { usuario_id: id } });
        if (num == 1) {
            res.send({ message: "Usuario eliminado exitosamente." });
        } else {
            res.status(404).send({ message: `No se pudo eliminar el usuario con id=${id}.` });
        }
    } catch (error) {
        res.status(500).send({ message: "Error al eliminar el usuario." });
    }
};