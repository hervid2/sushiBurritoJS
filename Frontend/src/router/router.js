// Importaciones de controladores de vistas
// Las rutas han sido ajustadas para ser relativas a la ubicación de router.js
// o desde la raíz de /src. Asumiendo: router.js está en /src/router/, y vistas en /src/views/
import { loginController } from "../views/auth/loginController.js";
import { forgotPasswordController } from "../views/auth/forgotPasswordController.js"; 
import { resetPasswordController } from "../views/auth/resetPasswordController.js";
import { dashboardController } from "../views/admin/dashboard/dashboardController.js" 
import { usersController } from "../views/admin/users/usersController.js";
import { menuController } from "../views/admin/menu/menuController.js";
import { statsController } from "../views/admin/stats/statsController.js";
import { kitchenOrdersController } from "../views/kitchen/kitchenOrdersController.js";
import { waiterOrdersController } from "../views/waiter/waiterOrdersController.js"; 

// Importación de helpers y vistas compartidas
import { showAlert } from '../helpers/alerts.js'; // Asumiendo que helpers está en /src/helpers/
import { headerController } from "../views/shared/headerController.js";
import { navigationController } from "../views/shared/navigationController.js";


/**
 * Función para navegar a una ruta específica de la aplicación.
 * Modifica el hash de la URL, lo que dispara el evento 'hashchange'
 * y permite al router cargar la vista y controlador correspondientes.
 * @param {string} path - La ruta a la que se desea navegar (ej. 'login', 'admin/dashboard').
 */
export const navigateTo = (path) => {
    // Asegura que el hash no tenga un '/' inicial si la ruta ya lo tiene definido sin él
    window.location.hash = path.startsWith('/') ? path.substring(1) : path;
};

// Definición de las rutas de la aplicación
// Cada ruta especifica su plantilla HTML, su controlador asociado,
// si requiere autenticación ('private'), qué roles tienen permiso ('requiresRole'),
// y el título de la página ('title').
export const routes = {
    // Rutas de Autenticación
    "login": {
        "template": "auth/login.html",
        controlador: loginController,
        private: false, // No requiere autenticación
        title: "Iniciar Sesión"
    },
    "forgot-password": {
        "template": "auth/forgot-password.html",
        controlador: forgotPasswordController,
        private: false,
        title: "Recuperar Contraseña"
    },
    "reset-password": {
        "template": "auth/reset-password.html",
        controlador: resetPasswordController,
        private: false,
        title: "Restablecer Contraseña"
    },

    // Rutas de Administración
    "admin/dashboard": {
        "template": "admin/dashboard/dashboard.html",
        controlador: dashboardController,
        private: true, 
        requiresRole: 'admin', 
        title: "Panel  Administrativo sushi burrito"
    },
    "admin/users": {
        "template": "admin/users/usersManagement.html",
        controlador: usersController,
        private: true, // Requiere autenticación
        requiresRole: 'admin', // Solo el admin puede gestionar usuarios
        title: "Gestión de Usuarios"
    },
    "admin/menu": {
        "template": "admin/menu/menuManagement.html",
        controlador: menuController,
        private: true, // Requiere autenticación
        requiresRole: 'admin', // Solo el admin puede gestionar el menú
        title: "Gestión de Menú"
    },
    "admin/stats": {
        "template": "admin/stats/statsOverview.html",
        controlador: statsController,
        private: true, // Requiere autenticación
        requiresRole: 'admin', // Solo el admin puede ver estadísticas
        title: "Estadísticas"
    },

    // Rutas de Cocina
    "kitchen/orders": {
        "template": "kitchen/kitchenOrders.html",
        controlador: kitchenOrdersController,
        private: true, // Requiere autenticación
        requiresRole: 'kitchen', // Solo el rol 'kitchen' puede acceder
        title: "Pedidos de Cocina"
    },

    // Rutas de Mesero
    "waiter/orders": {
        "template": "waiter/waiterOrders.html",
        controlador: waiterOrdersController,
        private: true, // Requiere autenticación
        requiresRole: 'waiter',
        title: "Pedidos de Mesero"
    },

    // Ruta para páginas no encontradas (404)
    "404": {
        "template": "shared/404.html", // Asegúrate de crear este archivo HTML
        controlador: null, // No necesita un controlador específico complejo
        private: false,
        title: "Página No Encontrada"
    }
};

/**
 * Carga los componentes compartidos (header, navigation) una única vez al inicio.
 * Esto asegura que siempre estén presentes en el DOM antes de que cualquier controlador de ruta intente acceder a ellos.
 */
export const loadSharedComponents = async () => {
    try {
        const headerContainer = document.getElementById('header-container');
        const navigationContainer = document.getElementById('navigation-container');

        // Cargar y renderizar el header
        if (headerContainer) {
            const headerResponse = await fetch('/src/views/shared/header.html');
            if (headerResponse.ok) {
                headerContainer.innerHTML = await headerResponse.text();
                headerController(); // Inicializar el controlador del header
                console.log('Header cargado e inicializado.');
            } else {
                console.error('Error al cargar header.html:', headerResponse.statusText);
            }
        } else {
            console.warn('Contenedor #header-container no encontrado.');
        }

        // Cargar y renderizar la navegación
        if (navigationContainer) {
            const navigationResponse = await fetch('/src/views/shared/navigation.html');
            if (navigationResponse.ok) {
                navigationContainer.innerHTML = await navigationResponse.text();
                // Pasar el rol o el estado de autenticación al navigationController
                const userRole = localStorage.getItem('userRole') || 'admin';
                navigationController({ role: userRole }); // Inicializar el controlador de navegación
                console.log('Navegación cargada e inicializada.');
            } else {
                console.error('Error al cargar navigation.html:', navigationResponse.statusText);
            }
        } else {
            console.warn('Contenedor #navigation-container no encontrado.');
        }
    } catch (error) {
        console.error("Error al cargar componentes compartidos:", error);
    }
};

/**
 * Carga el contenido de la plantilla HTML y ejecuta el controlador asociado.
 * Maneja la lógica de autenticación y autorización.
 */
export const loadContent = async () => {
    let path = window.location.hash.substring(1); // Obtiene la ruta del hash (ej. 'admin/dashboard')
    if (path.startsWith('/')) { // Elimina el '/' inicial si existe (por consistencia con las claves de 'routes')
        path = path.substring(1);
    }

    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'; // Verifica el estado de autenticación
    const userRole = localStorage.getItem('userRole'); // Obtiene el rol del usuario autenticado

    console.group('Router Load Content');
    console.log('URL Hash:', window.location.hash);
    console.log('Parsed Path:', path);
    console.log('isAuthenticated:', isAuthenticated);
    console.log('userRole:', userRole);

    // --- Lógica de redirección inicial y manejo de autenticación ---

    // Caso 1: La aplicación carga sin un hash (ej. http://localhost:5173/)
    if (!path) {
        console.log('Condition: No path in URL');
        if (!isAuthenticated) {
            console.log('Action: Redirecting to login (Not authenticated, no path)');
            navigateTo('login');
            console.groupEnd();
            return;
        } else {
            console.log('Action: Redirecting to admin/dashboard (Authenticated, no path)');
            navigateTo('admin/dashboard');
            console.groupEnd();
            return;
        }
    }

    // Caso 2: Intenta acceder a rutas de autenticación mientras ya está autenticado
    if ((path === 'login' || path === 'forgot-password' || path === 'reset-password') && isAuthenticated) {
        console.log('Condition: Auth path AND isAuthenticated is TRUE');
        showAlert('Ya estás autenticado. Redirigiendo al dashboard.', 'info');
        navigateTo('admin/dashboard');
        console.groupEnd();
        return;
    }

    const route = routes[path];
    const appContainer = document.getElementById('app'); // Contenedor principal de la aplicación

    // Caso 3: Ruta no definida en 'routes'
    if (!route) {
        console.warn(`Route not found for path: ${path}`);
        if (!isAuthenticated) {
            console.log('Action: Redirecting to login (Route not found, not authenticated)');
            navigateTo('login');
        } else {
            console.log('Action: Redirecting to 404 (Route not found, authenticated)');
            navigateTo('404');
        }
        console.groupEnd();
        return;
    }

    // Caso 4: Lógica de rutas privadas y autorización por rol
    if (route.private) {
        console.log(`Condition: Route is private. Checking authentication.`);
        if (!isAuthenticated) {
            showAlert('Necesitas iniciar sesión para acceder a esta página.', 'error');
            console.log('Action: Redirecting to login (Private route, not authenticated)');
            navigateTo('login');
            console.groupEnd();
            return;
        }

        // Comprobación de roles
        if (route.requiresRole) {
            console.log(`Condition: Route requires specific role(s). User role: ${userRole}`);
            const requiredRoles = Array.isArray(route.requiresRole) ? route.requiresRole : [route.requiresRole];
            if (!requiredRoles.includes(userRole)) {
                showAlert('No tienes permiso para acceder a esta página.', 'error');
                console.log('Action: Redirigiendo a admin/dashboard (Rol insuficiente)');
                navigateTo('admin/dashboard'); // Asume que el dashboard es accesible por todos los roles logueados
                console.groupEnd();
                return;
            }
            console.log(`Condition: User role (${userRole}) is authorized for this route.`);
        }
    }

    // --- Carga de la plantilla HTML y ejecución del controlador ---
    try {
        // La ruta de la plantilla siempre debe ser absoluta desde la raíz del proyecto
        const templatePath = `/src/views/${route.template}`;
        console.log(`Action: Attempting to fetch template: ${templatePath}`);
        const response = await fetch(templatePath);

        if (!response.ok) {
            if (response.status === 404) {
                console.error(`Plantilla no encontrada: ${templatePath}`);
                showAlert('La página que buscas no existe.', 'error');
                navigateTo('404');
            } else {
                throw new Error(`Error al cargar la plantilla: ${response.statusText}`);
            }
            console.groupEnd();
            return;
        }

        const html = await response.text();
        if (appContainer) {
            appContainer.innerHTML = html;
            console.log(`Template loaded successfully into #app: ${templatePath}`);
        } else {
            console.error('Contenedor #app no encontrado. No se pudo cargar la vista.');
            showAlert('Error crítico: Contenedor principal no encontrado.', 'error');
            console.groupEnd();
            return;
        }

        // Actualizar el título del header y de la pestaña del navegador
        const appTitleElement = document.getElementById('app-title'); // Asegúrate que tu header.html tenga un elemento con este ID
        if (appTitleElement) {
            const pageTitle = route.title || 'Sushi Burrito App';
            appTitleElement.textContent = pageTitle;
            document.title = pageTitle;
            console.log(`App title and document title updated to: ${pageTitle}`);
        } else {
            document.title = route.title || 'Sushi Burrito App'; // Al menos actualiza el título del navegador
        }

        // Si hay un controlador asociado a la RUTA PRINCIPAL, inicialízalo
        if (route.controlador) {
            console.log(`Action: Initializing controller for path: ${path}`);
            let params = {};
            if (window.location.hash.includes('?')) {
                const queryString = window.location.hash.split('?')[1];
                const urlParams = new URLSearchParams(queryString);
                for (let [key, value] of urlParams.entries()) {
                    params[key] = value;
                }
            }
            route.controlador(params);
        } else {
            console.log(`No controller defined for main path: ${path}`);
        }

    } catch (error) {
        console.error("Error al cargar la ruta o plantilla:", error);
        showAlert('Ocurrió un error inesperado al cargar la página.', 'error');
        navigateTo('404');
    }
    // ELIMINADO: Esta línea extra de cierre que causaba el error de sintaxis
    // }); 
    console.groupEnd(); // Cierra el grupo de consola de "Router Load Content"
};

// Exportar las funciones para que app.js pueda usarlas (aunque solo se importa el módulo completo)
// Esto se ejecutará una vez que el DOM inicial esté completamente cargado.
window.addEventListener('DOMContentLoaded', async () => {
    // Ocultar el mensaje de "Cargando aplicación..."
    const loadingMessage = document.querySelector('.loading-full-page');
    if (loadingMessage) {
        loadingMessage.style.display = 'none';
    }

    // 1. Cargar e inicializar los componentes compartidos (Header y Navigation)
    await loadSharedComponents();
    
    // 2. Luego, cargar el contenido de la ruta actual
    loadContent();
});

// Event listener para el cambio de hash en la URL
window.addEventListener('hashchange', loadContent);
