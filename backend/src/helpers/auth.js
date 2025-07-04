// =================================================================
// ARCHIVO: src/helpers/auth.js
// ROL: Módulo de utilidad que contiene funciones puras para la
//      validación de datos, como formatos de email y fortaleza
//      de contraseñas. No depende de Express.
// =================================================================

/**
 * Valida si una cadena de texto tiene un formato de correo electrónico válido.
 *
 * @param {string} email - La cadena de texto a validar.
 * @returns {boolean} - Devuelve 'true' si el formato es válido, 'false' en caso contrario.
 */
export const validateEmail = (email) => {
    // Si la entrada es nula o vacía, no es válida.
    if (!email) return false;
    
    // Expresión regular para una validación de email básica.
    // ^ -> El inicio de la cadena.
    // \S+ -> Uno o más caracteres que NO son espacios en blanco (para el nombre de usuario).
    // @ -> El carácter literal '@'.
    // \S+ -> Uno o más caracteres que NO son espacios en blanco (para el dominio).
    // \. -> Un punto literal (la barra invertida es para "escapar" el punto).
    // \S+ -> Uno o más caracteres que NO son espacios en blanco (para la extensión .com, .org, etc.).
    // $ -> El final de la cadena.
    const regex = /^\S+@\S+\.\S+$/;
    
    // El método .test() comprueba si la cadena cumple con el patrón de la regex.
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
    // Si la entrada está vacía, no es válida.
    if (!password) return false;
    
    // Expresión regular que utiliza "lookaheads" para verificar múltiples condiciones:
    // (?=.*[a-z]) -> Debe contener al menos una minúscula.
    // (?=.*[A-Z]) -> Debe contener al menos una mayúscula.
    // (?=.*\d)    -> Debe contener al menos un número.
    // (?=.*[@$!%*?&]) -> Debe contener al menos un carácter especial.
    // [A-Za-z\d@$!%*?&]{8,} -> Debe tener 8 o más caracteres de longitud.
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    // Comprueba si la contraseña cumple con el patrón de seguridad.
    return regex.test(password);
};