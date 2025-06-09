// FRONTEND/src/views/auth/loginController.js
import { showAlert } from '../../helpers/alerts.js';
import { navigateTo } from '../../router/router.js';

export const loginController = (params) => {
    // console.log("Login Controller Initialized.", params);

    // *** INICIO DE DEPURACIÓN EN LOGIN CONTROLLER ***
    console.group('Login Controller Execution');
    console.log("Login Controller Initialized.", params);
    // *** FIN DE DEPURACIÓN EN LOGIN CONTROLLER ***

    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');

     // *** DEPURACIÓN AQUÍ ***
    console.log('Login form element:', loginForm);
    // *** FIN DE DEPURACIÓN ***

    const authenticateUser = (username, password) => {
     
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (username === 'admin' && password === 'admin123') {
                    resolve({
                        success: true,
                        message: 'Inicio de sesión exitoso.',
                        token: 'fake-admin-jwt',
                        user: { username: 'admin', name: 'Administrador' },
                        role: 'admin'
                    });
                } else if (username === 'mesero' && password === 'mesero123') {
                    resolve({
                        success: true,
                        message: 'Inicio de sesión exitoso.',
                        token: 'fake-waiter-jwt',
                        user: { username: 'mesero', name: 'Mesero Uno' },
                        role: 'waiter'
                    });
                } else {
                    reject(new Error('Credenciales inválidas.'));
                }
            }, 700);
        });
    };

    const handleLoginSubmit = async (event) => {
        event.preventDefault();

        const username = usernameInput.value;
        const password = passwordInput.value;

        if (!username || !password) {
            if (showAlert) showAlert('Por favor, ingresa tu usuario y contraseña.', 'warning');
            return;
        }

        try {
            const result = await authenticateUser(username, password); // Llama a la simulación de login
            console.log('Login successful:', result);
            if (showAlert) showAlert(result.message, 'success');

            // ¡Aquí es donde establecemos el localStorage y redirigimos DESPUÉS del login exitoso!
            localStorage.setItem('userToken', result.token);
            localStorage.setItem('userRole', result.role);
            localStorage.setItem('isAuthenticated', 'true'); // Marcar como autenticado

            // Redirigir al dashboard después del login
            navigateTo('/admin/dashboard');

        } catch (error) {
            console.error('Login failed:', error);
            if (showAlert) showAlert(error.message || 'Error al iniciar sesión. Inténtalo de nuevo.', 'error');
        }
    };

    // --- Inicialización: Asignar event listeners ---
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    } else {
        console.error('Login form not found. Make sure login.html is loaded and has an element with id "login-form".');
    }
};