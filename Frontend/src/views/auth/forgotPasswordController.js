import { showAlert } from '../../helpers/alerts.js'; // Asumiendo que alerts.js es Vanilla JS
import { navigateTo } from '../../router/router.js'; // Para redirigir si es necesario

export const forgotPasswordController = (params) => {
    console.log("Forgot Password Controller Initialized.", params);

    // --- Referencias a elementos del DOM ---
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const emailInput = document.getElementById('forgot-password-email');

    // --- Función para simular la API de solicitud de restablecimiento con fetch ---
    const requestPasswordReset = async (email) => {
        // En un escenario real, harías un fetch a tu backend:
        /*
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al solicitar restablecimiento de contraseña.');
            }

            return data; // Mensaje de éxito
        } catch (error) {
            console.error('Forgot Password API Error:', error);
            throw error;
        }
        */

        // --- Datos simulados para demostración ---
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email === 'test@example.com' || email === 'admin@example.com') {
                    console.log(`Simulating password reset link sent to: ${email}`);
                    resolve({ success: true, message: `Se ha enviado un enlace de recuperación a ${email}. Por favor, revisa tu bandeja de entrada.` });
                } else {
                    reject(new Error('El email no está registrado en nuestro sistema.'));
                }
            }, 700); // Simular latencia de red
        });
    };

    // --- Manejador de evento para el formulario ---
    const handleForgotPasswordSubmit = async (event) => {
        event.preventDefault();

        const email = emailInput.value;

        if (!email) {
            if (showAlert) showAlert('Por favor, ingresa tu dirección de correo electrónico.', 'warning');
            return;
        }

        try {
            const result = await requestPasswordReset(email);
            console.log('Password reset request successful:', result);
            if (showAlert) showAlert(result.message, 'success');

            // Opcional: Podrías redirigir al login después de enviar el email
            // navigateTo('/login');

        } catch (error) {
            console.error('Forgot password failed:', error);
            if (showAlert) showAlert(error.message || 'Error al procesar la solicitud. Inténtalo de nuevo.', 'error');
        }
    };

    // --- Inicialización: Asignar event listeners ---
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPasswordSubmit);
    }
};