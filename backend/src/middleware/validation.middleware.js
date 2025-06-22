// =================================================
// ARCHIVO: src/middleware/validation.middleware.js 
// =================================================
// Este middleware conecta la lógica de validación con las rutas de Express.

import { validateEmail, validatePassword } from '../helpers/auth.js';

// Middleware para validar la creación de un usuario
export const validateUserCreation = (req, res, next) => {
    const { nombre, correo, contraseña, rol } = req.body;
    const errors = [];

    if (!nombre || nombre.trim() === '') {
        errors.push({ field: 'nombre', message: 'El nombre es requerido.' });
    }
    if (!validateEmail(correo)) {
        errors.push({ field: 'correo', message: 'Debe ser una dirección de correo válida.' });
    }
    if (!validatePassword(contraseña)) {
        errors.push({ field: 'contraseña', message: 'La contraseña no cumple los requisitos de seguridad.' });
    }
    if (!['administrador', 'mesero', 'cocinero'].includes(rol)) {
        errors.push({ field: 'rol', message: 'El rol no es válido.' });
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    next(); // Si no hay errores, pasa al siguiente middleware o al controlador
};

// Middleware para validar el login
export const validateLogin = (req, res, next) => {
    const { correo, contraseña } = req.body;
    const errors = [];

    if (!validateEmail(correo)) {
        errors.push({ field: 'correo', message: 'Por favor, ingrese un correo válido.' });
    }
    if (!contraseña) {
        errors.push({ field: 'contraseña', message: 'La contraseña es requerida.' });
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    next();
};