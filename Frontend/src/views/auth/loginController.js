// src/views/auth/loginController.js

import { showAlert } from '../../helpers/alerts.js';
import { navigateTo } from '../../router/router.js';
import { validateEmail } from '../../helpers/auth.js';

const API_URL = 'http://localhost:3000/api';

export const loginController = () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');

    const apiLogin = async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo: email, contraseña: password })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || `Error ${response.status}`);
            return data;
        } catch (error) {
            throw error;
        }
    };

    const handleLoginSubmit = async (event) => {
        event.preventDefault();
        const email = emailInput.value;
        const password = passwordInput.value;

        if (!validateEmail(email) || !password) {
            showAlert('Por favor, ingresa un correo y contraseña válidos.', 'warning');
            return;
        }

        try {
            const result = await apiLogin(email, password);
            
            // Guardar tokens y rol en localStorage
            localStorage.setItem('accessToken', result.accessToken);
            localStorage.setItem('refreshToken', result.refreshToken);
            localStorage.setItem('userRole', result.rol);
            localStorage.setItem('isAuthenticated', 'true');

            showAlert('Inicio de sesión exitoso.', 'success');

            const defaultRoutes = {
                administrador: '/admin/dashboard',
                mesero: '/waiter/orders',
                cocinero: '/kitchen/orders/pending'
            };
            
            navigateTo(defaultRoutes[result.rol] || '/');

            // Se añade una pequeña espera y una recarga de página para asegurar que el estado
            // de la autenticación se aplique correctamente en toda la aplicación.
            setTimeout(() => window.location.reload(), 5000);

        } catch (error) {
            showAlert(error.message || 'Error al iniciar sesión.', 'error');
        }
    };

    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
};