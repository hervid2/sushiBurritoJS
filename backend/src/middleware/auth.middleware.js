// =================================================================
// ARCHIVO: src/middleware/auth.middleware.js
// =================================================================

import jwt from 'jsonwebtoken';
import db from '../models/index.js';
const Usuario = db.Usuario;

// export const verifyToken = (req, res, next) => {
//     let token = req.headers['x-access-token'];
//     if (!token) return res.status(403).send({ message: "No se proporcionó un token." });

//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//         if (err) return res.status(401).send({ message: "No autorizado. Token inválido o expirado." });
//         req.userId = decoded.id;
//         next();
//     });
// };

// export const isAdmin = async (req, res, next) => {
//     try {
//         const usuario = await Usuario.findByPk(req.userId);
//         if (usuario.rol === 'administrador') {
//             next();
//             return;
//         }
//         res.status(403).send({ message: "Requiere rol de Administrador." });
//     } catch (error) {
//         res.status(500).send({ message: error.message });
//     }
// };

// middleware/auth.middleware.js (versión para el estándar Bearer)

export const verifyToken = (req, res, next) => {
    // 1. Buscar el encabezado 'authorization' (en minúsculas por convención)
    let authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(403).send({ message: "No se proporcionó un token." });
    }
    
    // 2. Comprobar que el formato sea "Bearer <token>"
    if (authHeader.startsWith('Bearer ')) {
        // 3. Extraer solo el token, quitando el prefijo "Bearer "
        const token = authHeader.substring(7);

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).send({ message: "No autorizado. El token es inválido o ha expirado." });
            }
            req.userId = decoded.id;
            next();
        });
    } else {
        // Si el header no tiene el formato correcto
        return res.status(401).send({ message: "Formato de token inválido. Debe ser 'Bearer <token>'." });
    }
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