// =================================================================
// ARCHIVO: src/views/auth/resetPasswordController.js
// ROL: Controlador para la vista de "Restablecer Contraseña".
//      Gestiona la fase final del proceso de recuperación,
//      validando el token y actualizando la contraseña del usuario.
// =================================================================

import { showAlert } from '../../helpers/alerts.js';
import { navigateTo } from '../../router/router.js';
import { validatePassword } from '../../helpers/auth.js';
import { api } from '../../helpers/solicitudes.js';

/**
 * Controlador principal para la vista de "Restablecer Contraseña".
 * @param {object} params - Objeto que contiene los parámetros de la URL,
 * proporcionado por el router. Se espera que contenga 'token'.
 */
export const resetPasswordController = (params) => {
    // --- Referencias a Elementos del DOM ---
    const resetPasswordForm = document.getElementById('reset-password-form');
    const newPasswordInput = document.getElementById('new-password');
    const confirmNewPasswordInput = document.getElementById('confirm-new-password');
    const submitButton = resetPasswordForm.querySelector('button[type="submit"]');

    // Obtiene el token de los parámetros de la URL.
    const token = params.token;

    // Si no se encuentra un token en la URL, la acción es inválida.
    if (!token) {
        showAlert('Token de restablecimiento no válido o ausente.', 'error');
        navigateTo('/login');
        return; // Detiene la ejecución del controlador.
    }

    /**
     * Maneja el envío del formulario para establecer la nueva contraseña.
     * @param {Event} event - El objeto del evento de envío.
     */
    const handleResetPasswordSubmit = async (event) => {
        event.preventDefault();
        const newPassword = newPasswordInput.value;
        const confirmNewPassword = confirmNewPasswordInput.value;

        // --- Validaciones en el lado del cliente ---
        if (newPassword !== confirmNewPassword) {
            showAlert('Las contraseñas no coinciden.', 'warning');
            return;
        }
        // Valida que la nueva contraseña cumpla con los requisitos de seguridad
        if (!validatePassword(newPassword)) {
            showAlert('La nueva contraseña no cumple los requisitos de seguridad.', 'warning');
            return;
        }

        // --- Feedback visual para el usuario ---
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = `<span class="spinner"></span> Actualizando...`;

        try {
            // Llama a la API para finalizar el restablecimiento de la contraseña.
            // Se usa 'publicPost' porque el usuario aún no está autenticado con su nueva sesión.
            const response = await api.publicPost('auth/reset-password', {
                token: token,
                newPassword: newPassword
            });
            
            // Si la API responde con éxito, se notifica al usuario y se le redirige al login.
            showAlert(response.message, 'success');
            navigateTo('/login');

        } catch (error) {
            // Muestra el mensaje de error proporcionado por el backend (ej. token expirado).
            showAlert(error.message || 'Error al restablecer la contraseña.', 'error');
        } finally {
            // El bloque 'finally' asegura que el botón se restaure siempre.
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    };

    // Asigna el manejador de eventos al formulario si este existe en el DOM.
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', handleResetPasswordSubmit);
    }
};
