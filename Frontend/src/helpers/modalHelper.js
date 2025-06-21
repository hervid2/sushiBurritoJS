// Importa la librería SweetAlert2
import Swal from 'sweetalert2';

/**
 * Muestra un modal de confirmación y devuelve una promesa.
 * La promesa se resuelve si el usuario confirma, y se rechaza si cancela.
 * @param {string} title - El título del modal.
 * @param {string} message - El mensaje HTML del cuerpo del modal.
 * @returns {Promise<void>}
 */
export const showConfirmModal = (title, message) => {
    return Swal.fire({
        title: title,
        html: message, // Permite usar HTML como <strong> en el mensaje
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#4CAF50', // Verde (éxito)
        cancelButtonColor: '#6c757d', // Gris (secundario)
        confirmButtonText: 'Sí, confirmar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        // Si el usuario hace clic en "Sí, confirmar", la promesa se resuelve.
        if (result.isConfirmed) {
            return Promise.resolve();
        }
        // Si el usuario cancela, la promesa se rechaza.
        return Promise.reject();
    });
};