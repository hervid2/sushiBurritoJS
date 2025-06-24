// =================================================================
// ARCHIVO: src/middleware/auth.middleware.js
// =================================================================

import jwt from 'jsonwebtoken';
import db from '../models/index.js';

export const verifyToken = (req, res, next) => {
    // Se busca el token en el header 'Authorization'
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer <token>"

    if (!token) {
        return res.status(403).send({ message: "No se proporcionó un token." });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "No autorizado. Token inválido." });
        }
        req.userId = decoded.id;
        next();
    });
};

export const isAdmin = async (req, res, next) => {
    try {
        // Se busca al usuario y se incluye la información del rol asociado
        const usuario = await db.Usuario.findByPk(req.userId, {
            include: [{
                model: db.Rol,
                attributes: ["nombre_rol"],
            }]
        });

        if (!usuario) {
            return res.status(404).send({ message: "Usuario no encontrado." });
        }

        // Se verifica el nombre del rol desde la tabla 'roles'
        if (usuario.Rol && usuario.Rol.nombre_rol === 'administrador') {
            next();
            return;
        }
        
        res.status(403).send({ message: 'Requiere rol de Administrador.' });

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};