// =================================================================
// ARCHIVO: src/helpers/alerts.js
// ROL: Módulo centralizado para mostrar notificaciones al usuario
//      utilizando la librería SweetAlert2.
// =================================================================

// Se importa la librería SweetAlert2, que debe estar instalada como dependencia.
import Swal from 'sweetalert2';

/**
 * Muestra una notificación no intrusiva (toast) en una esquina de la pantalla.
 * Esta función es exportada para ser utilizada en toda la aplicación.
 *
 * @param {string} message - El mensaje de texto que se mostrará en la alerta.
 * @param {string} [type='info'] - El tipo de alerta, que determina el icono.
 * Valores válidos: 'success', 'error', 'warning', 'info', 'question'.
 * El valor por defecto es 'info'.
 */
export const showAlert = (message, type = 'info') => {
    
    // Swal.mixin permite crear una instancia pre-configurada de SweetAlert2.
    // Esto evita repetir la misma configuración en cada llamada.
    const Toast = Swal.mixin({
        // 'toast: true' renderiza la alerta como una pequeña notificación en lugar de un modal grande.
        toast: true,
        
        // 'position' define en qué parte de la pantalla aparecerá la notificación.
        position: 'top-end', // Esquina superior derecha.
        
        // 'showConfirmButton: false' oculta el botón "OK", ya que es una notificación temporal.
        showConfirmButton: false,
        
        // 'timer' especifica la duración en milisegundos antes de que la alerta se cierre automáticamente.
        timer: 3000, // 3 segundos.
        
        // 'timerProgressBar: true' muestra una barra de progreso que indica el tiempo restante.
        timerProgressBar: true,
        
        // 'didOpen' es una función que se ejecuta cuando la alerta es visible.
        // Se usa para añadir interactividad, como pausar el temporizador.
        didOpen: (toast) => {
            // Pausa el temporizador si el cursor del mouse entra en el área de la notificación.
            toast.onmouseenter = Swal.stopTimer;
            // Reanuda el temporizador si el cursor del mouse sale del área.
            toast.onmouseleave = Swal.resumeTimer;
        },
        
        // 'showClass' y 'hideClass' definen las animaciones CSS para la aparición y desaparición de la alerta.
        // Se utilizan las animaciones por defecto de SweetAlert2 para una transición suave.
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

    // '.fire()' es el método que finalmente dispara y muestra la alerta en pantalla.
    // Utiliza la configuración base de 'Toast' y le añade las propiedades específicas de esta llamada.
    Toast.fire({
        icon: type,     // El icono a mostrar (ej. un check verde para 'success').
        title: message  // El texto del mensaje.
    });
};