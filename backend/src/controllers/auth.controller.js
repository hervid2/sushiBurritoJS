// =================================================================
// ARCHIVO: src/controllers/auth.controller.js
// ROL: Controlador que maneja toda la lógica de negocio relacionada
//      con la autenticación, incluyendo inicio de sesión,
//      gestión de tokens y recuperación de contraseñas.
// =================================================================

import db from '../models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer'; 

// --- INICIO DE SESIÓN ---
/**
 * Procesa la solicitud de inicio de sesión de un usuario.
 * @param {object} req - El objeto de la petición de Express.
 * @param {object} res - El objeto de la respuesta de Express.
 */
export const login = async (req, res) => {
    try {
        const { correo, contraseña } = req.body;
        // Busca al usuario por su correo e incluye la información de su rol.
        const usuario = await db.Usuario.findOne({
            where: { correo: correo },
            include: [{ model: db.Rol, attributes: ['nombre_rol'] }]
        });

        if (!usuario) return res.status(404).send({ message: "Usuario no encontrado." });

        // Compara de forma segura la contraseña proporcionada con el hash almacenado.
        const passwordIsValid = bcrypt.compareSync(contraseña, usuario.contraseña);
        if (!passwordIsValid) return res.status(401).send({ message: "Contraseña inválida." });

        // Si las credenciales son válidas, se firman dos tipos de tokens.
        const accessToken = jwt.sign({ id: usuario.usuario_id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: usuario.usuario_id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

        // Se envía la información del usuario y los tokens al cliente.
        res.status(200).send({
            id: usuario.usuario_id,
            nombre: usuario.nombre,
            rol: usuario.Rol.nombre_rol, 
            accessToken,
            refreshToken
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// --- REFRESCAR EL TOKEN DE ACCESO ---
/**
 * Genera un nuevo accessToken utilizando un refreshToken válido.
 * @param {object} req - El objeto de la petición de Express.
 * @param {object} res - El objeto de la respuesta de Express.
 */
export const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(401).send({ message: "Refresh Token es requerido." });
    }

    try {
        // Verifica el refresh token con su secreto correspondiente.
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        // Si es válido, genera un NUEVO accessToken de corta duración.
        const newAccessToken = jwt.sign({ id: decoded.id }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: process.env.TOKEN_EXPIRATION || '15m'
        });

        res.status(200).send({ accessToken: newAccessToken });

    } catch (error) {
        // Si el refresh token es inválido o ha expirado, el usuario debe volver a loguearse.
        return res.status(403).send({ message: "Refresh Token inválido o expirado. Por favor, inicie sesión de nuevo." });
    }
};

// --- SOLICITUD DE RESTABLECIMIENTO DE CONTRASEÑA ---
/**
 * Inicia el proceso de restablecimiento de contraseña enviando un correo al usuario.
 * @param {object} req - El objeto de la petición de Express.
 * @param {object} res - El objeto de la respuesta de Express.
 */
export const forgotPassword = async (req, res) => {
    const { correo } = req.body;

    try {
        const usuario = await db.Usuario.findOne({ where: { correo } });
        if (!usuario) {
            // Medida de seguridad: Se envía una respuesta genérica para no revelar si un correo existe o no.
            return res.status(200).send({ message: "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña." });
        }

        // Se crea un token de restablecimiento de corta duración.
        const resetToken = jwt.sign({ id: usuario.usuario_id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

        // Se construye el enlace que apunta a la vista del frontend.
        const resetLink = `http://localhost:5173/#/reset-password?token=${resetToken}`;
    
        await sendPasswordResetEmail(usuario.correo, resetLink); 
        
        res.status(200).send({ message: "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña." });

    } catch (error) {
        console.error("Error en forgotPassword:", error);
        res.status(500).send({ message: "Error interno al procesar la solicitud." });
    }
};

// --- RESTABLECIMIENTO FINAL DE LA CONTRASEÑA ---
/**
 * Actualiza la contraseña del usuario utilizando un token de restablecimiento válido.
 * @param {object} req - El objeto de la petición de Express.
 * @param {object} res - El objeto de la respuesta de Express.
 */
export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).send({ message: "Token y nueva contraseña son requeridos." });
    }

    try {
        // Se verifica la validez y expiración del token.
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        // Se hashea la nueva contraseña antes de guardarla.
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Se actualiza la contraseña del usuario en la base de datos.
        const updated = await db.Usuario.update(
            { contraseña: hashedPassword },
            { where: { usuario_id: decoded.id } }
        );

        if (updated[0] === 0) {
            return res.status(404).send({ message: "Usuario no encontrado o token inválido." });
        }

        res.status(200).send({ message: "Contraseña actualizada exitosamente." });

    } catch (error) {
        // Se manejan errores específicos de JWT para dar feedback claro al usuario.
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).send({ message: "El token ha expirado. Por favor, solicita un nuevo enlace." });
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).send({ message: "Token inválido." });
        }
        res.status(500).send({ message: "Error al restablecer la contraseña." });
    }
};

// --- FUNCIÓN AUXILIAR PARA ENVIAR CORREO ---
/**
 * Función no exportada que configura y envía el correo de restablecimiento.
 * @param {string} recipientEmail - La dirección de correo del destinatario.
 * @param {string} resetLink - El enlace completo para restablecer la contraseña.
 */
async function sendPasswordResetEmail(recipientEmail, resetLink) {
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    await transporter.sendMail({
        from: `"Soporte Sushi Burrito" <${process.env.EMAIL_USER}>`,
        to: recipientEmail,
        subject: 'Restablece tu Contraseña',
        html: `
            <p>Hola,</p>
            <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
            <p><a href="${resetLink}">Restablecer mi contraseña</a></p>
            <p>Si no solicitaste esto, por favor ignora este correo.</p>
            <p>Este enlace es válido por 15 minutos.</p>
        `
    });
}
