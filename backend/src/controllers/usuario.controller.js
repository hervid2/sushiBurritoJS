// ==================================================
// ARCHIVO: src/controllers/usuario.controller.js 
// ==================================================

import db from '../models/index.js';

// Crear un nuevo usuario 
export const createUser = async (req, res) => {
    try {
        const { nombre, rol, correo, contraseña } = req.body;
        const rolEncontrado = await db.Rol.findOne({ where: { nombre_rol: rol } });
        if (!rolEncontrado) return res.status(400).send({ message: "El rol especificado no existe." });

        const nuevoUsuario = await db.Usuario.create({ nombre, correo, contraseña, rol_id: rolEncontrado.rol_id });
        res.status(201).send({ message: "Usuario creado exitosamente." });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Obtener todos los usuarios (incluyendo el nombre del rol)
export const getAllUsers = async (req, res) => {
    try {
        const usuarios = await db.Usuario.findAll({
            attributes: { exclude: ['contraseña', 'rol_id'] },
            include: [{ model: db.Rol, attributes: ['nombre_rol'] }]
        });
        const respuesta = usuarios.map(u => ({
            usuario_id: u.usuario_id,
            nombre: u.nombre,
            correo: u.correo,
            rol: u.Rol.nombre_rol
        }));
        res.status(200).send(respuesta);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Obtener un usuario por su ID
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await db.Usuario.findByPk(id, {
            attributes: { exclude: ['contraseña', 'rol_id'] },
            include: [{ model: Rol, attributes: ['nombre_rol'] }]
        });
        if (usuario) {
            const respuesta = {
                usuario_id: usuario.usuario_id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol: usuario.Rol.nombre_rol
            };
            res.status(200).send(respuesta);
        } else {
            res.status(404).send({ message: `Usuario con id=${id} no encontrado.` });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Actualizar un usuario
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, correo } = req.body; 

        const [num] = await db.Usuario.update({ nombre, correo }, {
            where: { usuario_id: id }
        });

        if (num == 1) {
            res.send({ message: "Usuario actualizado exitosamente." });
        } else {
            res.status(404).send({ message: `No se pudo actualizar el usuario con id=${id}. Quizás no fue encontrado o no hubo cambios.` });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Eliminar un usuario
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const num = await db.Usuario.destroy({
            where: { usuario_id: id }
        });
        if (num == 1) {
            res.send({ message: "Usuario eliminado exitosamente." });
        } else {
            res.status(404).send({ message: `No se pudo eliminar el usuario con id=${id}.` });
        }
    } catch (error) {
        res.status(500).send({ message: "Error al eliminar el usuario." });
    }
};