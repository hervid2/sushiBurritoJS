// src/views/auth/forgotPasswordController.js 

import { showAlert } from '../../helpers/alerts.js';
import { api } from '../../helpers/solicitudes.js'; // Importar el helper de API
import { validateEmail } from '../../helpers/auth.js';
import { navigateTo } from '../../router/router.js';

export const forgotPasswordController = () => {
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const emailInput = document.getElementById('forgot-password-email');
    const submitButton = forgotPasswordForm.querySelector('button[type="submit"]');


    const handleForgotPasswordSubmit = async (event) => {
        event.preventDefault();
        const email = emailInput.value;

        if (!validateEmail(email)) {
            showAlert('Por favor, ingresa una dirección de correo electrónico válida.', 'warning');
            return;
        }

        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = `<span class="spinner"></span> Enviando...`;

        try {
            // Llamar a la API real del backend.
            // Se usa 'publicPost' porque esta ruta no necesita un token de autenticación.
            await api.publicPost('auth/forgot-password', { correo: email });

            // Mostrar siempre un mensaje genérico para no revelar si el correo existe o no (seguridad).
            showAlert('Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.', 'success');
            
            // Deshabilitamos los campos para evitar reenvíos.
            emailInput.disabled = true;
            submitButton.innerHTML = 'Enlace Enviado';
            
        } catch (error) {
            // Por seguridad, incluso si la API falla, mostramos el mismo mensaje genérico.
            // Un atacante no debe saber si el servidor falló porque el correo no existe o por otra razón.
            showAlert('Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.', 'success');
            console.error("Ocurrió un error en la solicitud, pero se muestra un mensaje genérico por seguridad:", error);
        }
    };

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPasswordSubmit);
    }
};