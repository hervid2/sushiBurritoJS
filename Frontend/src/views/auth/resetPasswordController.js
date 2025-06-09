import { showAlert } from '../../helpers/alerts.js'; // Asumiendo que alerts.js es Vanilla JS
import { navigateTo } from '../../router/router.js'; // Para redirigir tras el restablecimiento

export const resetPasswordController = (params) => {
    console.log("Reset Password Controller Initialized.", params);
    // params podría contener el token de restablecimiento si tu router lo extrae de la URL
    // Ejemplo: #/reset-password?token=XYZ123 (el router pasaría { token: 'XYZ123' })
    const resetToken = params.token || ''; // O leerlo de un input oculto si el HTML lo tiene

    // --- Referencias a elementos del DOM ---
    const resetPasswordForm = document.getElementById('reset-password-form');
    const hiddenTokenInput = document.getElementById('reset-token'); // Si usas un input oculto
    const newPasswordInput = document.getElementById('new-password');
    const confirmNewPasswordInput = document.getElementById('confirm-new-password');

    // Asignar el token del hash a un input oculto si existe, para que el formulario lo envíe
    if (hiddenTokenInput && resetToken) {
        hiddenTokenInput.value = resetToken;
    } else if (!resetToken && !hiddenTokenInput) {
        // Si no hay token en params y tampoco hay un input oculto, 
        // podrías mostrar un error o redirigir, ya que la página no es válida.
        if (showAlert) showAlert('Enlace de restablecimiento de contraseña no válido o caducado.', 'error');
        navigateTo('/forgot-password'); // Redirigir a la página de "olvidé contraseña"
        return; // Detener la ejecución del controlador
    }
    
    // --- Función para simular la API de restablecimiento de contraseña con fetch ---
    const performPasswordReset = async (token, newPassword) => {
        // En un escenario real, harías un fetch a tu backend:
        /*
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token, newPassword })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al restablecer la contraseña.');
            }

            return data; // Mensaje de éxito
        } catch (error) {
            console.error('Reset Password API Error:', error);
            throw error;
        }
        */

        // --- Datos simulados para demostración ---
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!token) {
                    reject(new Error('Token de restablecimiento de contraseña no proporcionado.'));
                } else if (newPassword.length < 6) {
                    reject(new Error('La nueva contraseña debe tener al menos 6 caracteres.'));
                } else if (token === 'expired_token') { // Simular un token caducado/inválido
                    reject(new Error('El enlace de restablecimiento es inválido o ha caducado.'));
                } else {
                    console.log(`Simulating password reset for token: ${token} with new password.`);
                    resolve({ success: true, message: '¡Contraseña restablecida exitosamente! Ya puedes iniciar sesión.' });
                }
            }, 700); // Simular latencia de red
        });
    };

    // --- Manejador de evento para el formulario ---
    const handleResetPasswordSubmit = async (event) => {
        event.preventDefault();

        const token = hiddenTokenInput ? hiddenTokenInput.value : resetToken; // Usar el del input o el de los params
        const newPassword = newPasswordInput.value;
        const confirmNewPassword = confirmNewPasswordInput.value;

        if (!token) {
            if (showAlert) showAlert('Enlace de restablecimiento de contraseña no válido.', 'error');
            return;
        }

        if (!newPassword || !confirmNewPassword) {
            if (showAlert) showAlert('Por favor, ingresa y confirma tu nueva contraseña.', 'warning');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            if (showAlert) showAlert('Las contraseñas no coinciden.', 'warning');
            return;
        }

        if (newPassword.length < 6) {
            if (showAlert) showAlert('La nueva contraseña debe tener al menos 6 caracteres.', 'warning');
            return;
        }

        try {
            const result = await performPasswordReset(token, newPassword);
            console.log('Password reset successful:', result);
            if (showAlert) showAlert(result.message, 'success');

            // Redirigir al usuario a la página de login después de un restablecimiento exitoso
            navigateTo('/login'); 

        } catch (error) {
            console.error('Password reset failed:', error);
            if (showAlert) showAlert(error.message || 'Error al restablecer la contraseña. Inténtalo de nuevo.', 'error');
        }
    };

    // --- Inicialización: Asignar event listeners ---
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', handleResetPasswordSubmit);
    }
};