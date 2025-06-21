// Importa la librería SweetAlert2
import Swal from 'sweetalert2';

/**
 * Muestra una notificación tostada en la esquina de la pantalla usando SweetAlert2.
 * @param {string} message - El mensaje a mostrar.
 * @param {string} type - El tipo de alerta ('success', 'error', 'info', 'warning').
 */
export const showAlert = (message, type = 'info') => {
    // Swal.mixin crea una configuración reutilizable para las alertas
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end', // Las notificaciones aparecerán en la esquina superior derecha
        showConfirmButton: false,
        timer: 4000, // La alerta se cierra automáticamente después de 4 segundos
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
        },
        // Añade clases de animación de SweetAlert2
        showClass: {
            popup: 'swal2-show',
            backdrop: 'swal2-backdrop-show',
            icon: 'swal2-icon-show'
        },
        hideClass: {
            popup: 'swal2-hide',
            backdrop: 'swal2-backdrop-hide',
            icon: 'swal2-icon-hide'
        }
    });

    // Muestra la alerta
    Toast.fire({
        icon: type, // 'success', 'error', 'warning', 'info'
        title: message
    });
};