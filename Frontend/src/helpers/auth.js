// src/helpers/auth.js

/**
 * Valida si un string tiene un formato de email válido.
 * @param {string} email - El email a validar.
 * @returns {boolean} - True si el formato es válido, false en caso contrario.
 */
export const validateEmail = (email) => {
    if (!email) return false;
    // Expresión regular estándar para validación de email
    const regex = /^\S+@\S+\.\S+$/;
    return regex.test(String(email).toLowerCase());
};

/**
 * Valida si una contraseña cumple con los requisitos de seguridad.
 * (Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 caracter especial)
 * @param {string} password - La contraseña a validar.
 * @returns {boolean} - True si la contraseña es segura, false en caso contrario.
 */
export const validatePassword = (password) => {
    if (!password) return false;
    // Expresión regular que verifica todos los requisitos
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
};
