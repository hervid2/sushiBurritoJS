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
    "admin/dashboard": { template: "admin/dashboard/dashboard.html", controller: dashboardController, title: "Panel administrativo", roles: ['administrador'] },
    "admin/users": { template: "admin/users/usersManagement.html", controller: usersController, title: "Gestión de Usuarios", roles: ['administrador'] },
    "admin/menu": { template: "admin/menu/menuManagement.html", controller: menuController, title: "Gestión de Menú y mesas", roles: ['administrador'] },
    "admin/stats": { template: "admin/stats/statsOverview.html", controller: statsController, title: "Estadísticas", roles: ['administrador'] },
    // Kitchen - Rutas específicas para cada estado
    "kitchen/orders/pending": { template: "kitchen/kitchenOrders.html", controller: kitchenOrdersController, title: "Pedidos Pendientes", roles: ['cocinero'], status: 'pending' },
    "kitchen/orders/preparing": { template: "kitchen/kitchenOrders.html", controller: kitchenOrdersController, title: "Pedidos en Preparación", roles: ['cocinero'], status: 'preparing' },
    "kitchen/orders/ready": { template: "kitchen/kitchenOrders.html", controller: kitchenOrdersController, title: "Pedidos Listos", roles: ['cocinero'], status: 'ready' },
    // Waiter
    "waiter/orders": { template: "waiter/waiterOrdersManagement.html", controller: waiterOrdersController, title: "Gestión de Pedidos", roles: ['mesero'] },
    "waiter/orders-status": { template: "waiter/waiterOrdersStatus.html", controller: waiterOrdersStatusController, title: "Estado de Pedidos", roles: ['mesero'] },
    "waiter/invoice": { template: "waiter/waiterInvoiceGenerator.html", controller: waiterInvoiceGeneratorController, title: "Generación de Factura", roles: ['mesero'] },
    // 404
    "404": { template: "shared/404.html", title: "Página No Encontrada", public: true }
};

// --- NAVEGACIÓN ---
export const navigateTo = (path) => {
    window.location.hash = path;
};

// --- LÓGICA CENTRALIZADA PARA LA UI COMPARTIDA ---
const updateSharedUI = (isAuthenticated, userRole, route) => {
    const headerContainer = document.getElementById('header-container');
    const navContainer = document.getElementById('navigation-container');
    const footerContainer = document.getElementById('footer-container');
    
    const displayStyle = isAuthenticated ? 'block' : 'none';
    headerContainer.style.display = displayStyle;
    navContainer.style.display = displayStyle;
    footerContainer.style.display = 'block';

    if (isAuthenticated) {
        const appTitleElement = document.getElementById('app-title');
        if (appTitleElement) {
            appTitleElement.textContent = route.title || 'Sushi Burrito';
        }

        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.style.display = 'inline-block';
            const newLogoutButton = logoutButton.cloneNode(true);
            logoutButton.parentNode.replaceChild(newLogoutButton, logoutButton);
            newLogoutButton.addEventListener('click', () => {
                showAlert('Has cerrado sesión.', 'success');
                localStorage.clear();
                window.location.hash = '/login';
                window.location.reload();
            });
        }
        
        navigationController({ role: userRole });
    }
};

// --- LÓGICA PRINCIPAL DEL ROUTER ---
export const loadContent = async () => {
    let path = window.location.hash.substring(1) || "/";
    if (path.startsWith('/')) {
        path = path.substring(1);
    }
    path = path.split('?')[0];

    // --- Autenticación y Rol ---
    let isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    let userRole = localStorage.getItem('userRole');
    
    // --- LÓGICA DE REDIRECCIÓN Y SEGURIDAD ---
    if (path === "kitchen/orders") {
        navigateTo('kitchen/orders/pending');
        return;
    }
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
            kitchen: 'kitchen/orders/pending'
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

        document.title = route.title;

        updateSharedUI(isAuthenticated, userRole, route);
        
        if (route.controller) {
            const queryString = window.location.hash.split('?')[1] || '';
            const urlParams = new URLSearchParams(queryString);
            const params = Object.fromEntries(urlParams.entries());
            params.routeInfo = route; 
            
            route.controller(params); // Ahora el controlador recibe toda la información que necesita.
        }
    } catch (error) {
        console.error("Error loading content:", error);
        navigateTo('404');
    }
};

// --- PUNTO DE ENTRADA DE LA APLICACIÓN ---
const initializeApp = async () => {
    const headerContainer = document.getElementById('header-container');
    const navContainer = document.getElementById('navigation-container');
    const footerContainer = document.getElementById('footer-container');
    try {
        headerContainer.innerHTML = await (await fetch('/src/views/shared/header.html')).text();
        navContainer.innerHTML = await (await fetch('/src/views/shared/navigation.html')).text();
        footerContainer.innerHTML = await (await fetch('/src/views/shared/footer.html')).text();
        
        window.addEventListener('hashchange', loadContent);
        window.addEventListener('load', loadContent);
    } catch (error) {
        console.error("Failed to initialize shared components:", error);
        document.body.innerHTML = "Error crítico al cargar la aplicación.";
    }
};

initializeApp();