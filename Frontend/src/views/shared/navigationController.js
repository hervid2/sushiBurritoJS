// src/views/shared/navigationController.js

// Este controlador ahora es muy simple. Solo renderiza el menú que se le pasa.
export const navigationController = (props) => {
    const { role } = props;
    const navContainer = document.getElementById('main-navigation');

    if (!navContainer) return;

    // Define los enlaces para cada rol
    const navLinks = {
        admin: `
            <a href="#/admin/dashboard" class="nav__link" data-path="admin/dashboard">Dashboard</a>
            <a href="#/admin/users" class="nav__link" data-path="admin/users">Gestión de Usuarios</a>
            <a href="#/admin/menu" class="nav__link" data-path="admin/menu">Menú y mesas</a>
            <a href="#/admin/stats" class="nav__link" data-path="admin/stats">Estadísticas ventas</a>
        `,
        waiter: `
            <a href="#/waiter/orders" class="nav__link" data-path="waiter/orders">Gestión de Pedidos</a>
            <a href="#/waiter/orders-status" class="nav__link" data-path="waiter/orders-status">Estado Pedidos</a>
            <a href="#/waiter/invoice" class="nav__link" data-path="waiter/invoice">Facturar pedido</a>
        `,
        kitchen: `
            <a href="#/kitchen/orders/pending" class="nav__link" data-path="kitchen/orders/pending">Pendientes</a>
            <a href="#/kitchen/orders/preparing" class="nav__link" data-path="kitchen/orders/preparing">En Preparación</a>
            <a href="#/kitchen/orders/ready" class="nav__link" data-path="kitchen/orders/ready">Listos</a>
        `,
    };
    
    // Renderiza el menú correspondiente al rol
    navContainer.innerHTML = navLinks[role] || '';

    // Lógica para marcar el enlace activo
    const currentPath = window.location.hash.substring(2);
    const activeLink = navContainer.querySelector(`[data-path="${currentPath}"]`);
    if (activeLink) {
        activeLink.classList.add('nav__link--active');
    }
};
