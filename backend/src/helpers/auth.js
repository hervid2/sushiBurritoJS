// ================================
// ARCHIVO: src/helpers/auth.js 
// ================================
// Este archivo contiene la lógica pura de validación, sin depender de Express.

/**
 * Valida si un string tiene un formato de email válido.
 * @param {string} email - El email a validar.
 * @returns {boolean}
 */
export const validateEmail = (email) => {
    if (!email) return false;
    const regex = /^\S+@\S+\.\S+$/;
    return regex.test(String(email).toLowerCase());
};

/**
 * Valida si una contraseña cumple con los requisitos de seguridad.
 * @param {string} password - La contraseña a validar.
 * @returns {boolean}
 */
export const validatePassword = (password) => {
    if (!password) return false;
    // Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 caracter especial.
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
};