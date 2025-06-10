// Importaciones de controladores de vistas
import { loginController } from "../views/auth/loginController.js";
import { forgotPasswordController } from "../views/auth/forgotPasswordController.js";
import { resetPasswordController } from "../views/auth/resetPasswordController.js";
import { dashboardController } from "../views/admin/dashboardController.js";
import { usersController } from "../views/admin/users/usersController.js";
import { menuController } from "../views/admin/menu/menuController.js";
import { statsController } from "../views/admin/stats/statsController.js";
import { kitchenOrdersController } from "../views/kitchen/kitchenOrdersController.js";
import { waiterOrdersController } from "../views/waiter/waiterOrdersController.js"; 

// Importación de helpers
import { showAlert } from '../helpers/alerts.js'; // Asegúrate de que este helper exista y funcione

/**
 * Función para navegar a una ruta específica de la aplicación.
 * Modifica el hash de la URL, lo que dispara el evento 'hashchange'
 * y permite al router cargar la vista y controlador correspondientes.
 * @param {string} path - La ruta a la que se desea navegar (ej. '/login', '/admin/dashboard').
 */
export const navigateTo = (path) => {
    window.location.hash = path;
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
        title: "Iniciar Sesión" // Título para la página de login
    },
    "forgot-password": {
        "template": "auth/forgot-password.html",
        controlador: forgotPasswordController,
        private: false,
        title: "Recuperar Contraseña" // Título para la página de recuperación
    },
    "reset-password": { 
        "template": "auth/reset-password.html",
        controlador: resetPasswordController,
        private: false,
        title: "Restablecer Contraseña" // Título para la página de restablecimiento
    },

    // Rutas de Administración
    "admin/dashboard": {
        "template": "admin/dashboard/dashboard.html",
        controlador: dashboardController,
        private: false,
        requiresRole: ['admin', 'waiter', 'kitchen'], // Roles que pueden acceder
        title: "Dashboard Administrativo" // Título para el dashboard
    },
    "admin/users": {
        "template": "admin/users/usersManagement.html",
        controlador: usersController,
        private: false,
        requiresRole: 'admin', // Solo el admin puede gestionar usuarios
        title: "Gestión de Usuarios" // Título
    },
    "admin/menu": {
        "template": "admin/menu/menuManagement.html",
        controlador: menuController,
        private: false,
        requiresRole: 'admin', // Solo el admin puede gestionar el menú
        title: "Gestión de Menú" // Título
    },
    "admin/stats": {
        "template": "admin/stats/statsOverview.html",
        controlador: statsController,
        private: false,
        requiresRole: 'admin', // Solo el admin puede ver estadísticas
        title: "Estadísticas" // Título
    },

    // Rutas de Cocina
    "kitchen/orders": {
        "template": "kitchen/kitchenOrders.html",
        controlador: kitchenOrdersController,
        private: false,
        requiresRole: 'kitchen', // Solo el rol 'kitchen' puede acceder
        title: "Pedidos de Cocina" // Título
    },

    // Rutas de Mesero
    "waiter/orders": { 
        "template": "waiter/waiterOrders.html", 
        controlador: waiterOrdersController,
        private: false,
        requiresRole: 'waiter',
        title: "Pedidos de Mesero" // Título
    },

    // Ruta para páginas no encontradas (404)
    "404": { 
        "template": "shared/404.html", // Asegúrate de crear este archivo HTML
        controlador: null, // No necesita un controlador específico complejo
        private: false,
        title: "Página No Encontrada" // Título para 404
    }
};

/**
 * Carga el contenido de la plantilla HTML y ejecuta el controlador asociado.
 * Maneja la lógica de autenticación y autorización.
 */
export const loadContent = async () => {
    let path = window.location.hash.substring(1); // Obtiene la ruta del hash (ej. 'admin/dashboard')
    if (path.startsWith('/')) { // Elimina el '/' inicial si existe
        path = path.substring(1);
    }
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'; // Verifica el estado de autenticación
    const userRole = localStorage.getItem('userRole'); // Obtiene el rol del usuario autenticado

    // *** INICIO DE DEPURACIÓN CRÍTICA ***
    console.group('Router Load Content');
    console.log('URL Hash:', window.location.hash);
    console.log('Parsed Path:', path);
    console.log('isAuthenticated:', isAuthenticated);
    console.log('userRole:', userRole);
    // *** FIN DE DEPURACIÓN CRÍTICA ***

    // --- Lógica de redirección inicial y manejo de autenticación ---

    // Caso 1: La aplicación carga sin un hash (ej. http://localhost:5173/)
    if (!path) {
        console.log('Condition: No path in URL');
        if (!isAuthenticated) {
            // Si no hay hash y no está autenticado, redirige al login
            console.log('Action: Redirecting to /login (Not authenticated, no path)');
            navigateTo('/login');
            return;
        } else {
            // Si no hay hash y está autenticado, redirige al dashboard (o ruta predeterminada para autenticados)
            console.log('Action: Redirecting to /admin/dashboard (Authenticated, no path)');
            navigateTo('/admin/dashboard');
            return;
        }
    }

    // Caso 2: Intenta acceder a rutas de autenticación mientras ya está autenticado
    if ((path === 'login' || path === 'forgot-password' || path === 'reset-password') && isAuthenticated) {
        console.log('Condition: Auth path AND isAuthenticated is TRUE');
        showAlert('Ya estás autenticado. Redirigiendo al dashboard.', 'info');
        navigateTo('/admin/dashboard');
        return;
    }

    // *** DEPURACIÓN ADICIONAL ***
    console.log('Condition: Passed initial redirections. Proceeding to route lookup.');
    // *** FIN DE DEPURACIÓN ***

    const route = routes[path];
    const appContainer = document.getElementById('app'); // Contenedor principal de la aplicación en index.html

    // Caso 3: Ruta no definida en 'routes'
    if (!route) {
        console.warn(`Route not found for path: ${path}`);
        if (!isAuthenticated) {
            console.log('Action: Redirecting to /login (Route not found, not authenticated)');
            navigateTo('/login'); 
        } else {
            console.log('Action: Redirecting to /404 (Route not found, authenticated)');
            navigateTo('/404');
        }
        return;
    }

    // Caso 4: Lógica de rutas privadas y autorización por rol
    if (route.private) {
        console.log(`Condition: Route is private. Checking authentication.`);
        if (!isAuthenticated) {
            showAlert('Necesitas iniciar sesión para acceder a esta página.', 'error');
            console.log('Action: Redirecting to /login (Private route, not authenticated)');
            navigateTo('/login');
            return;
        }

        // Comprobación de roles
        if (route.requiresRole) {
            console.log(`Condition: Route requires specific role(s). User role: ${userRole}`);
            const requiredRoles = Array.isArray(route.requiresRole) ? route.requiresRole : [route.requiresRole];
            if (!requiredRoles.includes(userRole)) {
                showAlert('No tienes permiso para acceder a esta página.', 'error');
                console.log('Action: Redirecting to /admin/dashboard (Insufficient role)');
                // Redirige a una ruta accesible por el rol actual, o al dashboard por defecto
                if (isAuthenticated) {
                    navigateTo('/admin/dashboard'); // Asume que el dashboard es accesible por todos los roles logueados
                } else {
                    navigateTo('/login'); // En caso de que se salte la verificación de autenticación
                }
                return;
            }
            console.log(`Condition: User role (${userRole}) is authorized for this route.`);
        }
    }

    // --- Carga de la plantilla HTML y ejecución del controlador ---
    try {
        const templatePath = `/src/views/${route.template}`;
        console.log(`Action: Attempting to fetch template: ${templatePath}`);
        const response = await fetch(templatePath);

        if (!response.ok) {
            // Si la plantilla no se encuentra, puede ser un error de ruta o archivo
            if (response.status === 404) {
                console.error(`Plantilla no encontrada: ${templatePath}`);
                showAlert('La página que buscas no existe.', 'error');
                navigateTo('/404');
            } else {
                throw new Error(`Error al cargar la plantilla: ${response.statusText}`);
            }
            return;
        }
        
        const html = await response.text();
        appContainer.innerHTML = html;
        console.log(`Template loaded successfully into #app: ${templatePath}`);

        // *** MEJORA: Actualizar el título del header y de la pestaña del navegador ***
        const appTitleElement = document.getElementById('app-title');
        if (appTitleElement) {
            const pageTitle = route.title || 'Sushi Burrito App'; // Usa el título de la ruta o un predeterminado
            appTitleElement.textContent = pageTitle;
            document.title = pageTitle; // Actualiza el título de la pestaña del navegador
            console.log(`App title and document title updated to: ${pageTitle}`);
        } else {
            console.warn('Element with ID "app-title" not found in header. Title not updated.');
            document.title = route.title || 'Sushi Burrito App'; // Al menos actualiza el título del navegador
        }

        // Si hay un controlador asociado, inicialízalo y pásale los parámetros del hash
        if (route.controlador) {
            console.log(`Action: Initializing controller for path: ${path}`);
            // Extraer parámetros del hash (ej. para '/reset-password?token=XYZ')
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
            console.log(`No controller defined for path: ${path}`);
        }

    } catch (error) {
        console.error("Error al cargar la ruta o plantilla:", error);
        showAlert('Ocurrió un error inesperado al cargar la página.', 'error');
        navigateTo('/404'); // Redirige a la página 404 en caso de fallos
    }
    console.groupEnd(); // Cierra el grupo de consola para Router Load Content
};

// Event listener para el cambio de hash en la URL
window.addEventListener('hashchange', loadContent);