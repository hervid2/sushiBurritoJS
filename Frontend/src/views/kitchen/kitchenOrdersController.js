// ======================================
// ARCHIVO: kitchenOrdersController.js 
// ======================================

import { showAlert } from '../../helpers/alerts.js';
import { api } from '../../helpers/solicitudes.js';

export const kitchenOrdersController = (params) => {
    // El status se obtiene del objeto 'routeInfo' pasado por el router
    const currentStatus = params.routeInfo.status;
    
    // --- Referencias al DOM ---
    const ordersListContainer = document.getElementById('orders-list');
    const paginationContainer = document.getElementById('pagination-container');

    // --- Estado ---
    let allOrders = [];
    let currentPage = 1;
    const itemsPerPage = 6;

    // --- Lógica de la API ---
    const loadOrders = async () => {
        ordersListContainer.innerHTML = '<div class="loading-message">Cargando...</div>';
        try {
            // Se llama al endpoint de pedidos filtrando por el estado actual
            allOrders = await api.get(`pedidos?estado=${currentStatus}`);
            currentPage = 1;
            renderPage();
        } catch (error) {
            ordersListContainer.innerHTML = `<div class="error-message">${error.message}</div>`;
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await api.put(`pedidos/${orderId}/estado`, { estado: newStatus });
            showAlert(`Pedido #${orderId} actualizado a '${newStatus}'.`, 'success');
            // Recarga la lista para que el pedido desaparezca de la vista actual
            loadOrders();
        } catch (error) {
            showAlert(error.message, 'error');
        }
    };

    // --- Lógica de Renderizado ---
    const renderPage = () => {
        if (!ordersListContainer) return;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const pageItems = allOrders.slice(startIndex, startIndex + itemsPerPage);

        if (pageItems.length === 0) {
            ordersListContainer.innerHTML = `<div class="empty-message">No hay pedidos en estado '${currentStatus}'.</div>`;
        } else {
            const formatDate = (dateString) => new Date(dateString).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
            
            ordersListContainer.innerHTML = pageItems.map(order => {
                const productosHTML = Array.isArray(order.Productos) ? order.Productos.map(p => {
                    // Se verifica si el producto actual tiene una nota.
                    const notaProducto = p.DetallePedido?.notas
                        ? `<p class="order-card__item-note">Nota: ${p.DetallePedido.notas}</p>`
                        : '';
                    // Se renderiza el producto y su nota justo debajo.
                    return `
                        <li class="order-card__item">
                            <span>${p.DetallePedido?.cantidad || 0}x ${p.nombre_producto}</span>
                            ${notaProducto}
                        </li>
                    `;
                }).join('') : '<li>Error al cargar productos</li>';
                return `
                    <div class="order-card order-card--${order.estado}" data-order-id="${order.pedido_id}">
                        <div class="order-card__header">
                            <h3 class="order-card__id">Pedido #${order.pedido_id}</h3>
                            <span class="order-card__time">${formatDate(order.fecha_creacion)}</span>
                        </div>
                        <div class="order-card__body">
                            <p><strong>Mesa:</strong> ${order.Mesa?.numero_mesa || 'N/A'}</p>
                            <ul class="order-card__items">
                                ${productosHTML}
                            </ul>
                        </div>
                        <div class="order-card__actions">
                            ${order.estado === 'pendiente' ? `<button class="btn btn--primary start-preparing-btn" data-id="${order.pedido_id}">En Preparación</button>` : ''}
                            ${order.estado === 'en_preparacion' ? `<button class="btn btn--success mark-ready-btn" data-id="${order.pedido_id}">Marcar Listo</button>` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        renderPagination();
        attachButtonListeners();
    };
    
    const renderPagination = () => {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';
        const totalPages = Math.ceil(allOrders.length / itemsPerPage);
        if (totalPages <= 1) return;

        let buttonsHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            buttonsHTML += `<li><button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button></li>`;
        }
        paginationContainer.innerHTML = `<ul>${buttonsHTML}</ul>`;

        paginationContainer.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentPage = parseInt(btn.dataset.page);
                renderPage();
            });
        });
    };
    
    // --- Manejadores de Eventos ---
    const attachButtonListeners = () => {
        ordersListContainer.querySelectorAll('.start-preparing-btn').forEach(b => b.onclick = (e) => handleUpdateStatus(e.currentTarget.dataset.id, 'en_preparacion'));
        ordersListContainer.querySelectorAll('.mark-ready-btn').forEach(b => b.onclick = (e) => handleUpdateStatus(e.currentTarget.dataset.id, 'preparado'));
    };
    
    // --- Inicialización ---
    loadOrders();
};