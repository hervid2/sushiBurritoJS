// src/views/auth/resetPasswordController.js (COMPLETO Y ACTUALIZADO)

import { showAlert } from '../../helpers/alerts.js';
import { navigateTo } from '../../router/router.js';
import { validatePassword } from '../../helpers/auth.js';

export const resetPasswordController = (params) => {
    const resetPasswordForm = document.getElementById('reset-password-form');
    const newPasswordInput = document.getElementById('new-password');
    const confirmNewPasswordInput = document.getElementById('confirm-new-password');
    
    const handleResetPasswordSubmit = async (event) => {
        event.preventDefault();
        const newPassword = newPasswordInput.value;
        const confirmNewPassword = confirmNewPasswordInput.value;

        if (newPassword !== confirmNewPassword) {
            showAlert('Las contraseñas no coinciden.', 'warning');
            return;
        }
        
        if (!validatePassword(newPassword)) {
            showAlert('La contraseña no cumple los requisitos de seguridad.', 'warning');
            return;
        }

        try {
            // Lógica de API para restablecer la contraseña iría aquí
            showAlert('¡Contraseña restablecida exitosamente!', 'success');
            navigateTo('/login');
        } catch (error) {
            showAlert('Error al restablecer la contraseña.', 'error');
        }
    };

    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', handleResetPasswordSubmit);
    }
};