// =================================================================
// ARCHIVO: src/views/shared/navigationController.js
// ROL: Controlador para el componente de navegación principal.
//      Su responsabilidad es renderizar dinámicamente los enlaces
//      de navegación apropiados según el rol del usuario autenticado.
// =================================================================

/**
 * Renderiza la barra de navegación y resalta el enlace activo.
 * @param {object} props - Propiedades pasadas al controlador.
 * @param {string} props.role - El rol del usuario actual (ej. 'administrador', 'mesero').
 */
export const navigationController = (props) => {
    // Se extrae el rol del objeto de propiedades.
    const { role } = props;
    // Se obtiene el contenedor de la navegación en el DOM.
    const navContainer = document.getElementById('main-navigation');

    // Cláusula de guarda: si el contenedor no existe, se detiene la ejecución.
    if (!navContainer) return;

    // Objeto que funciona como un mapa de menús. Asocia un rol con su HTML de navegación.
    // Esta estructura centraliza los menús y facilita su mantenimiento.
    const navLinks = {
        administrador: `
            <a href="#/admin/dashboard" class="nav__link" data-path="admin/dashboard">Dashboard</a>
            <a href="#/admin/users" class="nav__link" data-path="admin/users">Gestión de Usuarios</a>
            <a href="#/admin/menu" class="nav__link" data-path="admin/menu">Menú y mesas</a>
            <a href="#/admin/stats" class="nav__link" data-path="admin/stats">Estadísticas ventas</a>
        `,
        mesero: `
            <a href="#/waiter/orders" class="nav__link" data-path="waiter/orders">Gestión de Pedidos</a>
            <a href="#/waiter/orders-status" class="nav__link" data-path="waiter/orders-status">Estado Pedidos</a>
            <a href="#/waiter/invoice" class="nav__link" data-path="waiter/invoice">Facturar pedido</a>
        `,
        cocinero: `
            <a href="#/kitchen/orders/pending" class="nav__link" data-path="kitchen/orders/pending">Pendientes</a>
            <a href="#/kitchen/orders/preparing" class="nav__link" data-path="kitchen/orders/preparing">En Preparación</a>
            <a href="#/kitchen/orders/ready" class="nav__link" data-path="kitchen/orders/ready">Listos</a>
        `,
    };
    
    // Se renderiza el menú correspondiente al rol del usuario.
    // Si el rol no se encuentra en navLinks, se renderiza una cadena vacía para evitar errores.
    navContainer.innerHTML = navLinks[role] || '';

    // --- Lógica para marcar el enlace activo ---

    // Se obtiene la ruta actual del hash de la URL, eliminando los caracteres '#/'.
    const currentPath = window.location.hash.substring(2);
    
    // Se busca dentro de la navegación un enlace cuyo atributo 'data-path' coincida con la ruta actual.
    const activeLink = navContainer.querySelector(`[data-path="${currentPath}"]`);
    
    // Si se encuentra el enlace correspondiente, se le añade la clase 'nav__link--active' para resaltarlo.
    if (activeLink) {
        activeLink.classList.add('nav__link--active');
    }
};
