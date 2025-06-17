// src/views/kitchen/kitchenOrdersController.js

import { showAlert } from '../../helpers/alerts.js';
import { showConfirmModal } from '../../helpers/modalHelper.js';

export const kitchenOrdersController = (params) => {
    // El status se obtiene del objeto 'routeInfo' pasado por el router
    const currentStatus = params.routeInfo.status;
    console.log(`Kitchen Orders Controller Initialized for status: ${currentStatus}`);

    const ordersListContainer = document.getElementById('orders-list');
    const paginationContainer = document.getElementById('pagination-container');

    let allOrders = []; // Almacenará todos los pedidos del estado actual
    let currentPage = 1;
    const itemsPerPage = 6; // Tarjetas por página

    // --- API Simulada ---
    const fetchOrdersByStatus = async (status) => {
        return new Promise(resolve => {
            setTimeout(() => {
                const FAKE_ORDERS = {
                    pending: Array.from({ length: 10 }, (_, i) => ({ id: `P0${i+1}`, table: `Mesa ${i+2}`, time: '08:00 PM', status: 'pending', notes: i % 2 ? 'Sin aguacate' : '', items: [{ name: 'Sushi Roll', quantity: 2 }]})),
                    preparing: Array.from({ length: 5 }, (_, i) => ({ id: `R0${i+1}`, table: `Mesa ${i+5}`, time: '07:45 PM', status: 'preparing', notes: 'Extra picante', items: [{ name: 'Ramen', quantity: 1 }]})),
                    ready: Array.from({ length: 3 }, (_, i) => ({ id: `L0${i+1}`, table: `Mesa ${i+1}`, time: '07:30 PM', status: 'ready', notes: '', items: [{ name: 'Nigiri', quantity: 1 }]})),
                };
                resolve(FAKE_ORDERS[status] || []);
            }, 300);
        });
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        return new Promise(r => setTimeout(() => r({ success: true }), 300));
    };

    // --- Renderizado y Paginación ---
    const renderPage = () => {
        if (!ordersListContainer) return;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageItems = allOrders.slice(startIndex, endIndex);

        if (allOrders.length === 0) {
            ordersListContainer.innerHTML = `<div class="empty-message">No hay pedidos ${currentStatus}.</div>`;
        } else {
            ordersListContainer.innerHTML = pageItems.map(order => `
                <div class="order-card order-card--${order.status}" data-order-id="${order.id}">
                    <div class="order-card__header">
                        <h3 class="order-card__id">Pedido #${order.id}</h3>
                        <span class="order-card__time">${order.time}</span>
                    </div>
                    <div class="order-card__body">
                        <p><strong>Mesa:</strong> ${order.table}</p>
                        <ul class="order-card__items">
                            ${order.items.map(item => `<li>${item.quantity}x ${item.name}</li>`).join('')}
                        </ul>
                        ${order.notes ? `<p class="order-card__notes"><strong>Notas:</strong> ${order.notes}</p>` : ''}
                    </div>
                    <div class="order-card__actions">
                        ${order.status === 'pending' ? `<button class="btn btn--primary start-preparing-btn" data-id="${order.id}">En Preparación</button>` : ''}
                        ${order.status === 'preparing' ? `<button class="btn btn--success mark-ready-btn" data-id="${order.id}">Marcar Listo</button>` : ''}
                    </div>
                </div>
            `).join('');
        }
        
        renderPagination();
        attachButtonListeners();
    };

    // --- LÓGICA DE PAGINACIÓN COMPLETA ---
    const renderPagination = () => {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';
        
        const totalPages = Math.ceil(allOrders.length / itemsPerPage);
        if (totalPages <= 1) return;

        const ul = document.createElement('ul');

        // Botón "Anterior"
        const prevLi = document.createElement('li');
        const prevBtn = document.createElement('button');
        prevBtn.textContent = 'Anterior';
        prevBtn.className = 'pagination-btn';
        if (currentPage === 1) prevBtn.disabled = true;
        prevBtn.onclick = () => {
            currentPage--;
            renderPage();
        };
        prevLi.appendChild(prevBtn);
        ul.appendChild(prevLi);

        // Botones de páginas
        for (let i = 1; i <= totalPages; i++) {
            const pageLi = document.createElement('li');
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            pageBtn.className = 'pagination-btn';
            if (i === currentPage) pageBtn.classList.add('active');
            pageBtn.onclick = () => {
                currentPage = i;
                renderPage();
            };
            pageLi.appendChild(pageBtn);
            ul.appendChild(pageLi);
        }

        // Botón "Siguiente"
        const nextLi = document.createElement('li');
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Siguiente';
        nextBtn.className = 'pagination-btn';
        if (currentPage === totalPages) nextBtn.disabled = true;
        nextBtn.onclick = () => {
            currentPage++;
            renderPage();
        };
        nextLi.appendChild(nextBtn);
        ul.appendChild(nextLi);

        paginationContainer.appendChild(ul);
    };

    const loadOrders = async () => {
        ordersListContainer.innerHTML = '<div class="loading-message">Cargando...</div>';
        try {
            allOrders = await fetchOrdersByStatus(currentStatus);
            currentPage = 1;
            renderPage();
        } catch (error) {
            ordersListContainer.innerHTML = '<div class="error-message">Error al cargar pedidos.</div>';
        }
    };
    
    // --- Manejadores de Eventos ---
    const handleUpdateStatus = async (orderId, newStatus) => {
        await updateOrderStatus(orderId, newStatus);
        showAlert(`Pedido #${orderId} actualizado a '${newStatus}'.`, 'success');
        loadOrders();
    };

    const attachButtonListeners = () => {
        document.querySelectorAll('.start-preparing-btn').forEach(b => b.onclick = (e) => handleUpdateStatus(e.currentTarget.dataset.id, 'preparing'));
        document.querySelectorAll('.mark-ready-btn').forEach(b => b.onclick = (e) => handleUpdateStatus(e.currentTarget.dataset.id, 'ready'));
    };
    
    // --- Inicialización ---
    loadOrders();
};
