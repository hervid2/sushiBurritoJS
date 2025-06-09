/**
 * Muestra una alerta simple en el navegador.
 * En un proyecto real, usarías una librería de alertas como SweetAlert2.
 * @param {string} message - El mensaje a mostrar.
 * @param {string} type - El tipo de alerta (ej. 'success', 'error', 'info', 'warning').
 */
export const showAlert = (message, type = 'info') => {
    // Por ahora, solo usaremos console.log o un alert nativo.
    // Más adelante, aquí integrarías SweetAlert2.
    console.log(`Alerta (${type}): ${message}`);
    // alert(`${type.toUpperCase()}: ${message}`); // Descomenta si quieres ver alerts nativos
};

// Puedes añadir más funciones de utilidad para alertas aquí si lo deseas.