// src/views/auth/forgotPasswordController.js (COMPLETO Y ACTUALIZADO)

import { showAlert } from '../../helpers/alerts.js';
import { navigateTo } from '../../router/router.js';
import { validateEmail } from '../../helpers/auth.js';

export const forgotPasswordController = () => {
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const emailInput = document.getElementById('forgot-password-email');

    const requestPasswordReset = async (email) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (['test@example.com', 'admin@example.com'].includes(email)) {
                    resolve({ success: true, message: `Se ha enviado un enlace de recuperación a ${email}.` });
                } else {
                    reject(new Error('El email no está registrado.'));
                }
            }, 700);
        });
    };

    const handleForgotPasswordSubmit = async (event) => {
        event.preventDefault();
        const email = emailInput.value;

        if (!validateEmail(email)) {
            showAlert('Por favor, ingresa una dirección de correo electrónico válida.', 'warning');
            return;
        }

        try {
            const result = await requestPasswordReset(email);
            showAlert(result.message, 'success');
        } catch (error) {
            showAlert(error.message || 'Error al procesar la solicitud.', 'error');
        }
    };

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPasswordSubmit);
    }
};