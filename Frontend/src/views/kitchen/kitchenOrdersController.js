// src/views/kitchen/kitchenOrdersController.js

import { showAlert } from '../../helpers/alerts.js';
import { showConfirmModal } from '../../helpers/modalHelper.js'; // <- NUEVO IMPORT

export const kitchenOrdersController = () => {
    console.log("Kitchen Orders Controller Initialized.");

    // --- Referencias a elementos del DOM ---
    const orderFilterSelect = document.getElementById('order-filter');
    const refreshOrdersBtn = document.getElementById('refresh-orders-btn');
    const ordersListContainer = document.getElementById('orders-list');

    let currentFilter = orderFilterSelect ? orderFilterSelect.value : 'pending';

    // --- Funciones API (simuladas) ---
    const fetchOrders = async (status = 'pending') => {
        // ... (la lógica de fetch permanece igual)
        return new Promise(resolve => {
            setTimeout(() => {
                const allOrders = [
                    { id: 'ORD001', table: 'Mesa 5', time: '08:00 PM', status: 'pending', notes: 'Sin aguacate', items: [{ name: 'Sushi Roll California', quantity: 2 }, { name: 'Gyoza de Cerdo (6u)', quantity: 1 }] },
                    { id: 'ORD002', table: 'Mesa 12', time: '08:05 PM', status: 'pending', notes: '', items: [{ name: 'Burrito de Pollo Teriyaki', quantity: 1 }, { name: 'Coca-Cola (lata)', quantity: 2 }] },
                    { id: 'ORD003', table: 'Mesa 3', time: '07:45 PM', status: 'preparing', notes: 'Extra picante', items: [{ name: 'Sushi Roll Spicy Tuna', quantity: 1 }, { name: 'Sopa Miso', quantity: 1 }] },
                    { id: 'ORD005', table: 'Mesa 1', time: '07:30 PM', status: 'ready', notes: 'Para llevar', items: [{ name: 'Nigiri Surtido', quantity: 1 }, { name: 'Agua Mineral', quantity: 1 }] },
                    { id: 'ORD006', table: 'Mesa 10', time: '07:00 PM', status: 'completed', notes: '', items: [{ name: 'Yakitori (4u)', quantity: 2 }] },
                ];
                const filteredOrders = allOrders.filter(order => status === 'all' || order.status === status);
                resolve(filteredOrders);
            }, 300);
        });
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        // ... (la lógica de update permanece igual)
        return new Promise(resolve => {
            setTimeout(() => {
                console.log(`Simulating update of order ${orderId} to status: ${newStatus}`);
                resolve({ success: true, message: `Pedido ${orderId} actualizado a ${newStatus}.` });
            }, 300);
        });
    };

    // --- Funciones de Renderizado (sin cambios) ---
    const renderOrders = (orders) => {
        if (!ordersListContainer) return;
        if (orders.length === 0) {
            ordersListContainer.innerHTML = `<div class="empty-message">No hay pedidos con el estado '${currentFilter}'.</div>`;
            return;
        }
        ordersListContainer.innerHTML = orders.map(order => `
            <div class="order-card order-card--${order.status}" data-order-id="${order.id}">
                <div class="order-card__header">
                    <h3 class="order-card__id">Pedido #${order.id}</h3>
                    <span class="order-card__table">Mesa: ${order.table}</span>
                    <span class="order-card__time">${order.time}</span>
                </div>
                <div class="order-card__body">
                    <ul class="order-card__items">
                        ${order.items.map(item => `<li>${item.quantity}x ${item.name}</li>`).join('')}
                    </ul>
                    ${order.notes ? `<p class="order-card__notes">Notas: <span>${order.notes}</span></p>` : ''}
                </div>
                <div class="order-card__actions">
                    ${order.status === 'pending' ? `<button class="btn btn--primary btn--small start-preparing-btn" data-id="${order.id}"><i class="fas fa-play"></i> En Preparación</button>` : ''}
                    ${order.status === 'preparing' ? `<button class="btn btn--success btn--small mark-ready-btn" data-id="${order.id}"><i class="fas fa-check"></i> Marcar Listo</button>` : ''}
                    ${order.status === 'ready' ? `<button class="btn btn--info btn--small mark-served-btn" data-id="${order.id}"><i class="fas fa-utensils"></i> Marcar Entregado</button>` : ''}
                    ${order.status !== 'completed' ? `<button class="btn btn--danger btn--small cancel-order-btn" data-id="${order.id}"><i class="fas fa-times"></i> Cancelar</button>` : ''}
                </div>
            </div>
        `).join('');
        attachOrderButtonListeners();
    };

    // --- Manejadores de Eventos (Cancelación actualizada) ---
    const handleCancelOrder = async (orderId) => {
        try {
            // USA EL NUEVO HELPER
            await showConfirmModal(
                'Confirmar Cancelación',
                `¿Está seguro de que desea cancelar el Pedido #${orderId}? Esta acción no se puede deshacer.`
            );

            // Si el usuario confirma, el código continúa aquí.
            await updateOrderStatus(orderId, 'cancelled');
            showAlert(`Pedido #${orderId} cancelado.`, 'success');
            loadOrders(); // Recargar la lista

        } catch (error) {
            // El usuario hizo clic en "Cancelar" o cerró el modal.
            // El error puede ser la promesa rechazada, o un error de la API.
            if (error) {
                console.error("Error al cancelar pedido:", error);
                showAlert('Error al cancelar el pedido.', 'error');
            } else {
                 console.log('Cancelación de pedido abortada por el usuario.');
            }
        }
    };
    
    // ... otros manejadores (handleStartPreparing, handleMarkReady) sin cambios ...
    const handleStartPreparing = async (orderId) => {
        await updateOrderStatus(orderId, 'preparing');
        loadOrders();
    };
    const handleMarkReady = async (orderId) => {
        await updateOrderStatus(orderId, 'ready');
        loadOrders();
    };
    const handleMarkServed = async (orderId) => {
        await updateOrderStatus(orderId, 'completed');
        loadOrders();
    };

    const attachOrderButtonListeners = () => {
        document.querySelectorAll('.start-preparing-btn').forEach(b => b.onclick = (e) => handleStartPreparing(e.currentTarget.dataset.id));
        document.querySelectorAll('.mark-ready-btn').forEach(b => b.onclick = (e) => handleMarkReady(e.currentTarget.dataset.id));
        document.querySelectorAll('.mark-served-btn').forEach(b => b.onclick = (e) => handleMarkServed(e.currentTarget.dataset.id));
        document.querySelectorAll('.cancel-order-btn').forEach(b => b.onclick = (e) => handleCancelOrder(e.currentTarget.dataset.id));
    };

    const loadOrders = async () => {
        if (!ordersListContainer) return;
        ordersListContainer.innerHTML = '<div class="loading-message">Cargando pedidos...</div>';
        try {
            const orders = await fetchOrders(currentFilter);
            renderOrders(orders);
        } catch (error) {
            ordersListContainer.innerHTML = '<div class="error-message">Error al cargar pedidos.</div>';
        }
    };

    // --- Inicialización ---
    if (orderFilterSelect) {
        orderFilterSelect.addEventListener('change', (e) => {
            currentFilter = e.target.value;
            loadOrders();
        });
    }
    if (refreshOrdersBtn) {
        refreshOrdersBtn.addEventListener('click', loadOrders);
    }

    loadOrders();
};
