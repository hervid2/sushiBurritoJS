import { navigateTo } from '../../router/router.js';
import { showAlert } from '../../helpers/alerts.js';

export const headerController = (params) => {
    console.log("Header Controller Initialized.", params);

    const logoutButton = document.getElementById('logout-button');
    const mainNavigation = document.getElementById('main-navigation');

    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userRole = localStorage.getItem('userRole'); // 'admin', 'waiter', 'kitchen', etc.

    // --- Lógica para el botón de Cerrar Sesión ---
    if (logoutButton) {
        if (isAuthenticated) {
            logoutButton.style.display = 'block'; // Mostrar el botón si está autenticado
            logoutButton.addEventListener('click', handleLogout);
        } else {
            logoutButton.style.display = 'none'; // Ocultar el botón si no está autenticado
        }
    }

    function handleLogout() {
        // Limpiar el localStorage
        localStorage.removeItem('userToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('isAuthenticated');

        if (showAlert) showAlert('Has cerrado sesión exitosamente.', 'success');

        // Redirigir al usuario a la página de login
        navigateTo('/login');
    }

    // --- Lógica para renderizar la navegación dinámicamente según el rol ---
    const renderNavigation = () => {
        if (!mainNavigation) return;

        mainNavigation.innerHTML = ''; // Limpiar navegación existente

        // Definir las rutas visibles para cada rol
        const navLinks = {
            'admin': [
                { path: '/admin/dashboard', text: 'Dashboard' },
                { path: '/admin/users', text: 'Usuarios' },
                { path: '/admin/menu', text: 'Menú' },
                { path: '/admin/stats', text: 'Estadísticas' },
            ],
            'waiter': [
                { path: '/waiter/orders', text: 'Pedidos & Mesas' },
                // { path: '/waiter/accounts', text: 'Cuentas' }, // Si tienes esta vista
            ],
            'kitchen': [
                { path: '/kitchen/orders', text: 'Pedidos Cocina' },
            ],
            // Otros roles si los hay
        };

        const commonLinks = []; // Si hay enlaces comunes a todos los roles logueados

        let linksToRender = commonLinks;
        if (userRole && navLinks[userRole]) {
            linksToRender = linksToRender.concat(navLinks[userRole]);
        }
        
        // Si no está autenticado, no hay enlaces de navegación (solo el login)
        if (!isAuthenticated) {
            mainNavigation.innerHTML = ''; // Asegurar que no haya nada
            return;
        }

        // Renderizar los enlaces
        linksToRender.forEach(link => {
            const anchor = document.createElement('a');
            anchor.href = `#${link.path}`; // Usar hash para las rutas de SPA
            anchor.classList.add('nav__link');
            anchor.textContent = link.text;
            // Opcional: añadir clase activa basada en la ruta actual
            if (window.location.hash === `#${link.path}`) {
                anchor.classList.add('nav__link--active');
            }
            mainNavigation.appendChild(anchor);
        });

        // Añadir listener para actualizar la clase activa en la navegación al cambiar de hash
        // Esto es importante para que el enlace activo se resalte correctamente
        window.removeEventListener('hashchange', updateActiveClass); // Evitar duplicados
        window.addEventListener('hashchange', updateActiveClass);
    };

    const updateActiveClass = () => {
        if (!mainNavigation) return;
        mainNavigation.querySelectorAll('.nav__link').forEach(link => {
            if (link.hash === window.location.hash) {
                link.classList.add('nav__link--active');
            } else {
                link.classList.remove('nav__link--active');
            }
        });
    };

    // --- Inicialización ---
    renderNavigation(); // Renderiza la navegación al cargar el controlador
    updateActiveClass(); // Establece la clase activa inicial
};