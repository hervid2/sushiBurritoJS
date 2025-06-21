// =================================================================
// ARCHIVO: src/controllers/usuario.controller.js
// =================================================================

import db from '../models/index.js';
const Usuario = db.Usuario;

export const createUser = async (req, res) => {
    try {
        const { nombre, rol, correo, contraseña } = req.body;
        const nuevoUsuario = await Usuario.create({ nombre, rol, correo, contraseña });
        res.status(201).send({ message: "Usuario creado exitosamente.", usuario: { id: nuevoUsuario.usuario_id, nombre: nuevoUsuario.nombre } });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({ attributes: { exclude: ['contraseña'] } });
        res.status(200).send(usuarios);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};