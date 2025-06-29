// src/views/auth/resetPasswordController.js 

import { showAlert } from '../../helpers/alerts.js';
import { navigateTo } from '../../router/router.js';
import { validatePassword } from '../../helpers/auth.js';
import { api } from '../../helpers/solicitudes.js'; // Importa el helper de la API

export const resetPasswordController = (params) => {
    const resetPasswordForm = document.getElementById('reset-password-form');
    const newPasswordInput = document.getElementById('new-password');
    const confirmNewPasswordInput = document.getElementById('confirm-new-password');
    const submitButton = resetPasswordForm.querySelector('button[type="submit"]');

    // Obtiene el token de los parámetros de la URL
    const token = params.token;

    // Si no hay token en la URL, no se puede continuar.
    if (!token) {
        showAlert('Token de restablecimiento no válido o ausente.', 'error');
        navigateTo('/login');
        return;
    }

    const handleResetPasswordSubmit = async (event) => {
        event.preventDefault();
        const newPassword = newPasswordInput.value;
        const confirmNewPassword = confirmNewPasswordInput.value;

        if (newPassword !== confirmNewPassword) {
            showAlert('Las contraseñas no coinciden.', 'warning');
            return;
        }

        if (!validatePassword(newPassword)) {
            showAlert('La nueva contraseña no cumple los requisitos de seguridad.', 'warning');
            return;
        }

        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = `<span class="spinner"></span> Actualizando...`;

        try {
            // Llama a la API real con el token y la nueva contraseña
            const response = await api.publicPost('auth/reset-password', {
                token: token,
                newPassword: newPassword
            });
            
            showAlert(response.message, 'success');
            navigateTo('/login');

        } catch (error) {
            // El backend ya maneja errores de token expirado o inválido
            showAlert(error.message || 'Error al restablecer la contraseña.', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    };

    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', handleResetPasswordSubmit);
    }
};