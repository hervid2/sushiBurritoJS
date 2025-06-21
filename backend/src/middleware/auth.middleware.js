// =================================================================
// ARCHIVO: src/middleware/auth.middleware.js
// =================================================================

import jwt from 'jsonwebtoken';
import db from '../models/index.js';
const Usuario = db.Usuario;

export const verifyToken = (req, res, next) => {
    let token = req.headers['x-access-token'];
    if (!token) return res.status(403).send({ message: "No se proporcionó un token." });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.status(401).send({ message: "No autorizado. Token inválido o expirado." });
        req.userId = decoded.id;
        next();
    });
};

export const isAdmin = async (req, res, next) => {
    try {
        const usuario = await Usuario.findByPk(req.userId);
        if (usuario.rol === 'administrador') {
            next();
            return;
        }
        res.status(403).send({ message: "Requiere rol de Administrador." });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};