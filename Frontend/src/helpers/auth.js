// =================================================================
// ARCHIVO: src/helpers/auth.js
// ROL: Módulo de utilidad que proporciona funciones reutilizables
//      para la validación de datos de autenticación, como correos
//      y contraseñas.
// =================================================================

/**
 * Valida si una cadena de texto tiene un formato de correo electrónico válido.
 * Utiliza una expresión regular para verificar la estructura.
 *
 * @param {string} email - La cadena de texto a validar como correo electrónico.
 * @returns {boolean} - Devuelve 'true' si el formato es válido, 'false' en caso contrario.
 */
export const validateEmail = (email) => {
    // Si la entrada es nula, indefinida o vacía, no es un email válido.
    if (!email) return false;
    
    // Expresión regular (regex) que define un patrón de email simple:
    // (caracteres)@(caracteres).(caracteres)
    const regex = /^\S+@\S+\.\S+$/;
    
    // El método .test() comprueba si la cadena cumple con el patrón de la regex.
    // Se convierte el email a minúsculas para una validación no sensible a mayúsculas.
    return regex.test(String(email).toLowerCase());
};

/**
 * Valida si una contraseña cumple con los requisitos de seguridad definidos.
 * Requisitos: Mínimo 8 caracteres, al menos una mayúscula, una minúscula,
 * un número y un carácter especial.
 *
 * @param {string} password - La contraseña a validar.
 * @returns {boolean} - Devuelve 'true' si la contraseña es segura, 'false' en caso contrario.
 */
export const validatePassword = (password) => {
    // Si la entrada está vacía, no es una contraseña válida.
    if (!password) return false;
    
    // Expresión regular compleja para validar la fortaleza de la contraseña:
    // (?=.*[a-z]) - Debe contener al menos una letra minúscula.
    // (?=.*[A-Z]) - Debe contener al menos una letra mayúscula.
    // (?=.*\d)    - Debe contener al menos un número.
    // (?=.*[@$!%*?&]) - Debe contener al menos un carácter especial de la lista.
    // [A-Za-z\d@$!%*?&]{8,} - Debe tener 8 o más caracteres de longitud y solo puede contener los caracteres permitidos.
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    // Comprueba si la contraseña cumple con el patrón de seguridad.
    return regex.test(password);
};