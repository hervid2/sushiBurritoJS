// =================================================================
// ARCHIVO: src/controllers/auth.controller.js
// =================================================================

import db from '../models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const Usuario = db.Usuario;

export const login = async (req, res) => {
    try {
        const { correo, contraseña } = req.body;
        const usuario = await Usuario.findOne({ where: { correo: correo } });
        if (!usuario) {
            return res.status(404).send({ message: "Usuario no encontrado." });
        }

        const passwordIsValid = bcrypt.compareSync(contraseña, usuario.contraseña);
        if (!passwordIsValid) {
            return res.status(401).send({ accessToken: null, message: "Contraseña inválida." });
        }

        const accessToken = jwt.sign({ id: usuario.usuario_id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.TOKEN_EXPIRATION || '1h' });
        const refreshToken = jwt.sign({ id: usuario.usuario_id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_EXPIRATION || '7d' });

        res.status(200).send({
            id: usuario.usuario_id,
            nombre: usuario.nombre,
            rol: usuario.rol,
            accessToken,
            refreshToken
        });

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};