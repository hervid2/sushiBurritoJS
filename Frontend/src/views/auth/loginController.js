// src/views/auth/loginController.js

import { showAlert } from '../../helpers/alerts.js';
import { navigateTo } from '../../router/router.js';
import { validateEmail } from '../../helpers/auth.js'; 

export const loginController = (params) => {
    console.log("Login Controller Initialized.", params);

    const loginForm = document.getElementById('login-form');
    // Se asume que el ID del input en login.html es 'login-email'
    const emailInput = document.getElementById('login-email'); 
    const passwordInput = document.getElementById('login-password');

    const authenticateUser = (email, password) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Se actualiza la lógica para usar emails
                if (email === 'admin@sushi.com' && password === 'admin123') {
                    resolve({ success: true, message: 'Inicio de sesión exitoso.', token: 'fake-admin-jwt', user: { email: 'admin@sushi.com', name: 'Administrador' }, role: 'admin' });
                } else if (email === 'mesero@sushi.com' && password === 'mesero123') {
                    resolve({ success: true, message: 'Inicio de sesión exitoso.', token: 'fake-waiter-jwt', user: { email: 'mesero@sushi.com', name: 'Mesero Uno' }, role: 'waiter' });
                } else {
                    reject(new Error('Credenciales inválidas.'));
                }
            }, 700);
        });
    };

    const handleLoginSubmit = async (event) => {
        event.preventDefault();
        const email = emailInput.value;
        const password = passwordInput.value;

        // Se añade la validación de formato de email
        if (!validateEmail(email)) {
            showAlert('Por favor, ingresa un correo electrónico válido.', 'warning');
            return;
        }

        if (!password) {
            showAlert('Por favor, ingresa tu contraseña.', 'warning');
            return;
        }

        try {
            const result = await authenticateUser(email, password); // Se pasa el email
            showAlert(result.message, 'success');
            localStorage.setItem('userToken', result.token);
            localStorage.setItem('userRole', result.role);
            localStorage.setItem('isAuthenticated', 'true');
            navigateTo('/admin/dashboard');
        } catch (error) {
            showAlert(error.message || 'Error al iniciar sesión.', 'error');
        }
    };

    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
};