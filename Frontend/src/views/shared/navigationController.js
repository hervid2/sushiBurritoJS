/**
 * Controlador para la barra de navegación principal.
 * Carga dinámicamente los enlaces según el rol o la vista actual.
 */
export const navigationController = (params) => {
    console.log("Controlador de Navegación Inicializado.", params);

    const navigationContainer = document.getElementById('main-navigation');
    if (!navigationContainer) {
        console.error("Error: Contenedor de navegación 'main-navigation' no encontrado.");
        return;
    }

    // --- Plantillas de navegación para diferentes roles ---

    // Navegación para el Administrador
    const getAdminNav = () => `
        <a href="#/dashboard" class="nav__link">Dashboard</a>
        <a href="#/admin/users" class="nav__link">Gestión Usuarios</a>
        <a href="#/admin/menu" class="nav__link">Gestión de la Carta</a>
        <a href="#/admin/stats" class="nav__link">Estadísticas</a>
        <a href="#/logout" class="nav__link">Cerrar Sesión</a>
    `;

    // Navegación para el Mesero (Ejemplo para futura expansión)
    const getWaiterNav = () => `
        <a href="#/waiter/tables" class="nav__link">Ver Mesas</a>
        <a href="#/waiter/orders" class="nav__link">Tomar Pedido</a>
    `;
    
    // --- Lógica para renderizar la navegación ---
    
    // Aquí, decidiríamos qué navegación mostrar. 
    // Por ahora, asumimos que siempre es la de administrador.
    // En una app real, 'params.role' vendría de tu sistema de autenticación.
    const userRole = params?.role || 'admin'; // Asumimos 'admin' por defecto para este caso

    switch (userRole) {
        case 'admin':
            navigationContainer.innerHTML = getAdminNav();
            break;
        case 'waiter':
            navigationContainer.innerHTML = getWaiterNav();
            break;
        default:
            navigationContainer.innerHTML = '<a href="#/login" class="nav__link">Iniciar Sesión</a>';
            break;
    }
    
    // --- Resaltar el enlace activo ---
    
    const highlightActiveLink = () => {
        const currentPath = window.location.hash || '#/dashboard';
        const navLinks = navigationContainer.querySelectorAll('.nav__link');
        
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('nav__link--active');
            } else {
                link.classList.remove('nav__link--active');
            }
        });
    };

    // Resaltar en la carga inicial y en cada cambio de ruta
    highlightActiveLink();
    window.addEventListener('hashchange', highlightActiveLink);
};