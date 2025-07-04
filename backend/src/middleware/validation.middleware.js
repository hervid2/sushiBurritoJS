// =================================================================
// ARCHIVO: src/middleware/validation.middleware.js
// ROL: Define middlewares para validar los datos de entrada de las
//      peticiones antes de que lleguen a los controladores.
// =================================================================

// Se importan las funciones de validación desde el helper de autenticación.
import { validateEmail, validatePassword } from '../helpers/auth.js';

/**
 * Middleware para validar los datos requeridos en la creación de un nuevo usuario.
 *
 * @param {object} req - El objeto de la petición de Express.
 * @param {object} res - El objeto de la respuesta de Express.
 * @param {function} next - La función callback para pasar el control al siguiente middleware.
 */
export const validateUserCreation = (req, res, next) => {
    // Se extraen los datos del cuerpo de la petición.
    const { nombre, correo, contraseña, rol } = req.body;
    // Se inicializa un array para acumular los errores encontrados.
    const errors = [];

    // --- Se ejecutan las reglas de validación ---
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

    // --- Decisión final ---
    // Si se encontraron errores, se detiene la cadena y se devuelve una respuesta 400.
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    // Si no hay errores, se pasa el control al siguiente middleware o al controlador.
    next();
};

/**
 * Middleware para validar los datos requeridos para el inicio de sesión.
 *
 * @param {object} req - El objeto de la petición de Express.
 * @param {object} res - El objeto de la respuesta de Express.
 * @param {function} next - La función callback para pasar el control.
 */
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