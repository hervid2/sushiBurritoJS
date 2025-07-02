// =================================================================
// ARCHIVO: src/views/auth/forgotPasswordController.js
// ROL: Controlador para la vista de "Recuperar Contraseña".
//      Gestiona la solicitud del usuario para iniciar el proceso
//      de restablecimiento de contraseña.
// =================================================================

import { showAlert } from '../../helpers/alerts.js';
import { api } from '../../helpers/solicitudes.js';
import { validateEmail } from '../../helpers/auth.js';


/**
 * Controlador principal para la vista de "Recuperar Contraseña".
 */
export const forgotPasswordController = () => {
    // --- Referencias a Elementos del DOM ---
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const emailInput = document.getElementById('forgot-password-email');
    const submitButton = forgotPasswordForm.querySelector('button[type="submit"]');

    /**
     * Maneja el envío del formulario de solicitud de restablecimiento.
     * @param {Event} event - El objeto del evento de envío.
     */
    const handleForgotPasswordSubmit = async (event) => {
        event.preventDefault(); // Previene la recarga de la página.
        const email = emailInput.value;

        // Validación de formato del correo en el lado del cliente.
        if (!validateEmail(email)) {
            showAlert('Por favor, ingresa una dirección de correo electrónico válida.', 'warning');
            return;
        }

        // --- Feedback visual para el usuario ---
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = `<span class="spinner"></span> Enviando...`;

        try {
            // Se realiza la llamada a la API para solicitar el enlace de restablecimiento.
            // Se utiliza 'publicPost' ya que esta acción no requiere autenticación previa.
            await api.publicPost('auth/forgot-password', { correo: email });

            // Por seguridad, siempre se muestra un mensaje de éxito genérico.
            // Esto previene que un atacante pueda descubrir qué correos están registrados.
            showAlert('Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.', 'success');
            
            // Se deshabilita el formulario para evitar múltiples envíos.
            emailInput.disabled = true;
            submitButton.innerHTML = 'Enlace Enviado';
            
        } catch (error) {
            // Incluso en caso de error en la API, se muestra el mismo mensaje genérico.
            // La seguridad (no revelar información) es prioritaria sobre el detalle del error.
            showAlert('Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.', 'success');
            console.error("Ocurrió un error en la solicitud, pero se muestra un mensaje genérico por seguridad:", error);
            
            // También se deshabilita el formulario en caso de error para mantener la consistencia.
            emailInput.disabled = true;
            submitButton.disabled = true;
            submitButton.innerHTML = 'Procesado';
        }
    };

    // Asigna el manejador de eventos al formulario si este existe en el DOM.
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPasswordSubmit);
    }
};
