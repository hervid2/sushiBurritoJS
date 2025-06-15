// src/router/router.js

// Importaciones de Controladores de Vistas
import { loginController } from "../views/auth/loginController.js";
import { forgotPasswordController } from "../views/auth/forgotPasswordController.js"; 
import { resetPasswordController } from "../views/auth/resetPasswordController.js";
import { dashboardController } from "../views/admin/dashboard/dashboardController.js";
import { usersController } from "../views/admin/users/usersController.js";
import { menuController } from "../views/admin/menu/menuController.js";
import { statsController } from "../views/admin/stats/statsController.js";
import { kitchenOrdersController } from "../views/kitchen/kitchenOrdersController.js";
import { waiterOrdersController } from "../views/waiter/waiterOrdersController.js";
import { waiterInvoiceGeneratorController } from "../views/waiter/waiterInvoiceGeneratorController.js";
import { waiterOrdersStatusController } from "../views/waiter/waiterOrdersStatusController.js";

// Importación de Controladores de Componentes Compartidos
import { navigationController } from "../views/shared/navigationController.js";
import { showAlert } from '../helpers/alerts.js';

// --- DEFINICIÓN DE RUTAS ---
export const routes = {
    // Auth
    "login": { template: "auth/login.html", controller: loginController, title: "Iniciar Sesión", public: true },
    "forgot-password": { template: "auth/forgot-password.html", controller: forgotPasswordController, title: "Recuperar Contraseña", public: true },
    "reset-password": { template: "auth/reset-password.html", controller: resetPasswordController, title: "Restablecer Contraseña", public: true },
    // Admin
    "admin/dashboard": { template: "admin/dashboard/dashboard.html", controller: dashboardController, title: "Sushi Burrito - Panel administrativo", roles: ['admin'] },
    "admin/users": { template: "admin/users/usersManagement.html", controller: usersController, title: "Sushi Burrito - Gestión de Usuarios", roles: ['admin'] },
    "admin/menu": { template: "admin/menu/menuManagement.html", controller: menuController, title: "Sushi Burrito - Gestión de Menú", roles: ['admin'] },
    "admin/stats": { template: "admin/stats/statsOverview.html", controller: statsController, title: "Sushi Burrito - Estadísticas", roles: ['admin'] },
    // Kitchen
    "kitchen/orders": { template: "kitchen/kitchenOrders.html", controller: kitchenOrdersController, title: "Sushi Burrito - Pedidos de Cocina", roles: ['kitchen'] },
    // Waiter
    "waiter/orders": { template: "waiter/waiterOrders.html", controller: waiterOrdersController, title: "Sushi Burrito - Gestión de Mesas y Pedidos", roles: ['waiter'] },
    "waiter/orders-status": { template: "waiter/waiterOrdersStatus.html", controller: waiterOrdersStatusController, title: "Sushi Burrito - Estado de Pedidos", roles: ['waiter'] },
    "waiter/invoice": { template: "waiter/waiterInvoiceGenerator.html", controller: waiterInvoiceGeneratorController, title: "Sushi Burrito - Generación de Factura", roles: ['waiter'] },
    // 404
    "404": { template: "shared/404.html", title: "Página No Encontrada", public: true }
};

// --- NAVEGACIÓN ---
export const navigateTo = (path) => {
    // Asigna el nuevo hash para disparar el evento 'hashchange'
    window.location.hash = path;
};

// --- LÓGICA CENTRALIZADA PARA LA UI COMPARTIDA ---
const updateSharedUI = (isAuthenticated, userRole, route) => {
    const headerContainer = document.getElementById('header-container');
    const navContainer = document.getElementById('navigation-container');
    const footerContainer = document.getElementById('footer-container');
    
    // Gestionar visibilidad de contenedores
    const displayStyle = isAuthenticated ? 'block' : 'none';
    headerContainer.style.display = displayStyle;
    navContainer.style.display = displayStyle;
    footerContainer.style.display = 'block'; // Footer siempre visible

    if (isAuthenticated) {
        // --- 1. Actualizar el Título del Header ---
        const appTitleElement = document.getElementById('app-title');
        if (appTitleElement) {
            appTitleElement.textContent = route.title || 'Sushi Burrito';
        }

        // --- 2. Gestionar el Botón de Logout ---
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.style.display = 'inline-block';
            
            // Reemplazar el botón para evitar añadir múltiples listeners
            const newLogoutButton = logoutButton.cloneNode(true);
            logoutButton.parentNode.replaceChild(newLogoutButton, logoutButton);

            newLogoutButton.addEventListener('click', () => {
                showAlert('Has cerrado sesión.', 'success');
                localStorage.clear();
                window.location.hash = '/login';
                window.location.reload();
            });
        }
        
        // --- 3. Renderizar la Navegación correcta ---
        navigationController({ role: userRole });
    }
};

// --- LÓGICA PRINCIPAL DEL ROUTER ---
export const loadContent = async () => {
    // --- OBTENER ESTADO Y RUTA ---
    let path = window.location.hash.substring(1) || "/";
    path = path.split('?')[0];

    // --- Autenticación y Rol ---
    let isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    let userRole = localStorage.getItem('userRole');

    // Descomenta para probar roles
    isAuthenticated = true;
    userRole = 'admin';
    
    // --- LÓGICA DE REDIRECCIÓN Y SEGURIDAD ---
    if (path === "" || path === "/") {
        navigateTo(isAuthenticated ? 'admin/dashboard' : 'login');
        return;
    }
    
    const route = routes[path];
    
    if (!route) {
        navigateTo('404');
        return;
    }
    
    if (route.public && isAuthenticated) {
        navigateTo('admin/dashboard');
        return;
    }
    
    if (!route.public && !isAuthenticated) {
        navigateTo('login');
        return;
    }
    
    if (route.roles && !route.roles.includes(userRole)) {
        showAlert('No tienes permiso para acceder a esta página.', 'error');
        const defaultRoutes = {
            admin: 'admin/dashboard',
            waiter: 'waiter/orders',
            kitchen: 'kitchen/orders'
        };
        navigateTo(defaultRoutes[userRole] || 'login');
        return;
    }

    // --- RENDERIZADO DE VISTA Y COMPONENTES ---
    try {
        const appContainer = document.getElementById('app');
        if (!appContainer) throw new Error("#app container not found!");

        const response = await fetch(`/src/views/${route.template}`);
        if (!response.ok) throw new Error(`Template not found: ${route.template}`);
        appContainer.innerHTML = await response.text();

        document.title = `Sushi Burrito - ${route.title}`;

        // Llamar a la función centralizada para actualizar la UI
        updateSharedUI(isAuthenticated, userRole, route);
        
        if (route.controller) {
            const queryString = window.location.hash.split('?')[1] || '';
            const urlParams = new URLSearchParams(queryString);
            const params = Object.fromEntries(urlParams.entries());
            route.controller(params);
        }
    } catch (error) {
        console.error("Error loading content:", error);
        navigateTo('404');
    }
};

// --- PUNTO DE ENTRADA DE LA APLICACIÓN ---
const initializeApp = async () => {
    // Carga el HTML de los componentes compartidos al inicio
    const headerContainer = document.getElementById('header-container');
    const navContainer = document.getElementById('navigation-container');
    const footerContainer = document.getElementById('footer-container');

    try {
        headerContainer.innerHTML = await (await fetch('/src/views/shared/header.html')).text();
        navContainer.innerHTML = await (await fetch('/src/views/shared/navigation.html')).text();
        footerContainer.innerHTML = await (await fetch('/src/views/shared/footer.html')).text();

        // Escucha los cambios de ruta para cargar el contenido
        window.addEventListener('hashchange', loadContent);
        window.addEventListener('load', loadContent);
    } catch (error) {
        console.error("Failed to initialize shared components:", error);
        document.body.innerHTML = "Error crítico al cargar la aplicación. Revisa la consola.";
    }
};

// Iniciar la aplicación
initializeApp();