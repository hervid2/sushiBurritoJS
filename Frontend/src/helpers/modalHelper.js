// =================================================================
// ARCHIVO: src/helpers/modalHelper.js
// ROL: Módulo de utilidad para mostrar modales de confirmación
//      bloqueantes, estandarizando la interacción del usuario para
//      acciones críticas.
// =================================================================

// Se importa la librería SweetAlert2, que debe estar instalada como dependencia.
import Swal from 'sweetalert2';

/**
 * Muestra un modal de confirmación y devuelve una Promesa que se resuelve
 * o se rechaza según la acción del usuario. Esta función es asíncrona
 * para permitir el uso de 'await' y hacer el código más legible.
 *
 * @param {string} title - El título principal que se mostrará en el modal.
 * @param {string} message - El mensaje del cuerpo del modal. Puede contener HTML.
 * @returns {Promise<void>} - Devuelve una Promesa que:
 * - Se resuelve (resolve) si el usuario confirma.
 * - Se rechaza (reject) si el usuario cancela.
 */
export const showConfirmModal = async (title, message) => {
    // 'await' pausa la función aquí hasta que el usuario interactúa con el modal.
    // El resultado de la interacción (qué botón se presionó) se guarda en 'result'.
    const result = await Swal.fire({
        // El título del modal.
        title: title,
        
        // 'html' permite renderizar contenido HTML en el cuerpo del modal.
        html: message,
        
        // El icono de advertencia es estándar para acciones que requieren precaución.
        icon: 'warning',
        
        // Muestra el botón de "Cancelar".
        showCancelButton: true,
        
        // Personaliza los colores de los botones para que coincidan con el tema.
        confirmButtonColor: '#4CAF50', // Verde
        cancelButtonColor: '#6c757d',  // Gris
        
        // Personaliza el texto de los botones para mayor claridad.
        confirmButtonText: 'Sí, confirmar',
        cancelButtonText: 'Cancelar'
    });

    // Se comprueba si el botón de confirmación fue presionado.
    if (result.isConfirmed) {
        // En una función 'async', un 'return' vacío resuelve la promesa.
        return;
    }

    // Si no se confirmó, se rechaza la promesa explícitamente.
    // Esto permite que el bloque 'catch' de un try/catch se active.
    return Promise.reject();
};
