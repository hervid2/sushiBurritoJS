// =================================================================
// ARCHIVO: src/controllers/auth.controller.js
// =================================================================

import db from '../models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer'; 


// --- LOGIN  ---
export const login = async (req, res) => {
    try {
        const { correo, contraseña } = req.body;
        const usuario = await db.Usuario.findOne({
            where: { correo: correo },
            include: [{ model: db.Rol, attributes: ['nombre_rol'] }]
        });

        if (!usuario) return res.status(404).send({ message: "Usuario no encontrado." });

        const passwordIsValid = bcrypt.compareSync(contraseña, usuario.contraseña);
        if (!passwordIsValid) return res.status(401).send({ message: "Contraseña inválida." });

        const accessToken = jwt.sign({ id: usuario.usuario_id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: usuario.usuario_id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

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
export const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(401).send({ message: "Refresh Token es requerido." });
    }

    try {
        // Verificar el refresh token con su secreto correspondiente
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        // Si es válido, generar un NUEVO accessToken
        const newAccessToken = jwt.sign({ id: decoded.id }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: process.env.TOKEN_EXPIRATION || '15m'
        });

        res.status(200).send({ accessToken: newAccessToken });

    } catch (error) {
        // Si el refresh token es inválido o ha expirado, el usuario debe volver a loguearse
        return res.status(403).send({ message: "Refresh Token inválido o expirado. Por favor, inicie sesión de nuevo." });
    }
};

// --- OLVIDÉ MI CONTRASEÑA ---
export const forgotPassword = async (req, res) => {
    const { correo } = req.body;

    try {
        const usuario = await db.Usuario.findOne({ where: { correo } });
        if (!usuario) {
            // Enviamos una respuesta genérica para no revelar si un correo existe o no
            return res.status(200).send({ message: "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña." });
        }

        // Crear un token de restablecimiento de corta duración (ej. 15 minutos)
        const resetToken = jwt.sign({ id: usuario.usuario_id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

        // Enlace que el usuario recibirá en el correo
        // Apunta a la vista del frontend, pasando el token como parámetro
        const resetLink = `http://localhost:5173/#/reset-password?token=${resetToken}`;

    
       await sendPasswordResetEmail(usuario.correo, resetLink); 
       
        res.status(200).send({ message: "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña." });

    } catch (error) {
        console.error("Error en forgotPassword:", error);
        res.status(500).send({ message: "Error interno al procesar la solicitud." });
    }
};


// --- RESTABLECER LA CONTRASEÑA ---
export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).send({ message: "Token y nueva contraseña son requeridos." });
    }

    try {
        // Verificar el token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        // Hashear la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar la contraseña del usuario en la base de datos
        const updated = await Usuario.update(
            { contraseña: hashedPassword },
            { where: { usuario_id: decoded.id } }
        );

        if (updated[0] === 0) {
            return res.status(404).send({ message: "Usuario no encontrado o token inválido." });
        }

        res.status(200).send({ message: "Contraseña actualizada exitosamente." });

    } catch (error) {
        // El error puede ser por un token expirado o inválido
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).send({ message: "El token ha expirado. Por favor, solicita un nuevo enlace." });
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).send({ message: "Token inválido." });
        }
        res.status(500).send({ message: "Error al restablecer la contraseña." });
    }
};


// --- FUNCIÓN AUXILIAR PARA ENVIAR LINK POR CORREO  ---
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