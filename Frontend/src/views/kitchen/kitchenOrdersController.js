// src/views/kitchen/kitchenOrdersController.js

import { showAlert } from '../../helpers/alerts.js'; // Asumiendo que alerts.js es Vanilla JS

export const kitchenOrdersController = (params) => {
    console.log("Kitchen Orders Controller Initialized.", params);

    // --- Referencias a elementos del DOM ---
    const orderFilterSelect = document.getElementById('order-filter');
    const refreshOrdersBtn = document.getElementById('refresh-orders-btn');
    const ordersListContainer = document.getElementById('orders-list');

    // --- Variables de estado ---
    let currentFilter = orderFilterSelect ? orderFilterSelect.value : 'pending'; // Estado de filtro actual

    // --- Funciones para simular la API de Pedidos con fetch ---

    // Simula obtener pedidos del "backend"
    const fetchOrders = async (status = 'pending') => {
        // En un escenario real, harías un fetch real:
        // const response = await fetch(`/api/kitchen/orders?status=${status}`);
        // if (!response.ok) {
        //     throw new Error(`HTTP error! status: ${response.status}`);
        // }
        // return await response.json();

        return new Promise(resolve => {
            setTimeout(() => {
                const allOrders = [
                    // Pedidos Pendientes
                    { 
                        id: 'ORD001', table: 'Mesa 5', time: '08:00 PM', status: 'pending', notes: 'Sin aguacate',
                        items: [
                            { name: 'Sushi Roll California', quantity: 2 },
                            { name: 'Gyoza de Cerdo (6u)', quantity: 1 }
                        ]
                    },
                    { 
                        id: 'ORD002', table: 'Mesa 12', time: '08:05 PM', status: 'pending', notes: '',
                        items: [
                            { name: 'Burrito de Pollo Teriyaki', quantity: 1 },
                            { name: 'Coca-Cola (lata)', quantity: 2 }
                        ]
                    },
                    // Pedidos En Preparación
                    { 
                        id: 'ORD003', table: 'Mesa 3', time: '07:45 PM', status: 'preparing', notes: 'Extra picante',
                        items: [
                            { name: 'Sushi Roll Spicy Tuna', quantity: 1 },
                            { name: 'Sopa Miso', quantity: 1 }
                        ]
                    },
                    { 
                        id: 'ORD004', table: 'Mesa 8', time: '07:50 PM', status: 'preparing', notes: '',
                        items: [
                            { name: 'Ramen de Cerdo', quantity: 2 }
                        ]
                    },
                    // Pedidos Listos para Servir
                    { 
                        id: 'ORD005', table: 'Mesa 1', time: '07:30 PM', status: 'ready', notes: 'Para llevar',
                        items: [
                            { name: 'Nigiri Surtido', quantity: 1 },
                            { name: 'Agua Mineral', quantity: 1 }
                        ]
                    },
                    // Pedidos Completados (Historial)
                    { 
                        id: 'ORD006', table: 'Mesa 10', time: '07:00 PM', status: 'completed', notes: '',
                        items: [
                            { name: 'Yakitori (4u)', quantity: 2 }
                        ]
                    },
                    { 
                        id: 'ORD007', table: 'Mesa 7', time: '06:45 PM', status: 'completed', notes: '',
                        items: [
                            { name: 'Tempura de Vegetales', quantity: 1 }
                        ]
                    }
                ];

                // Filtra los pedidos según el estado solicitado
                const filteredOrders = allOrders.filter(order => {
                    if (status === 'all') return true;
                    return order.status === status;
                });
                resolve(filteredOrders);
            }, 500); // Simular latencia de red
        });
    };

    // Simula la actualización del estado de un pedido
    const updateOrderStatus = async (orderId, newStatus) => {
        // En un escenario real, harías un fetch PUT o PATCH:
        // const response = await fetch(`/api/kitchen/orders/${orderId}/status`, {
        //     method: 'PUT',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ status: newStatus })
        // });
        // if (!response.ok) {
        //     throw new Error(`Failed to update order status: ${response.statusText}`);
        // }
        // return await response.json();

        return new Promise(resolve => {
            setTimeout(() => {
                console.log(`Simulating update of order ${orderId} to status: ${newStatus}`);
                resolve({ success: true, message: `Pedido ${orderId} actualizado a ${newStatus}.` });
            }, 300);
        });
    };

    // --- Funciones de Renderizado ---

    const renderOrders = (orders) => {
        if (!ordersListContainer) return;

        if (orders.length === 0) {
            ordersListContainer.innerHTML = `<div class="empty-message">No hay pedidos ${currentFilter} en este momento.</div>`;
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
                        ${order.items.map(item => `
                            <li>${item.quantity}x ${item.name}</li>
                        `).join('')}
                    </ul>
                    ${order.notes ? `<p class="order-card__notes">Notas: <span>${order.notes}</span></p>` : ''}
                </div>
                <div class="order-card__actions">
                    ${order.status === 'pending' ? `
                        <button class="btn btn--primary btn--small start-preparing-btn" data-id="${order.id}">
                            <i class="fas fa-play"></i> En Preparación
                        </button>
                    ` : ''}
                    ${order.status === 'preparing' ? `
                        <button class="btn btn--success btn--small mark-ready-btn" data-id="${order.id}">
                            <i class="fas fa-check"></i> Marcar Listo
                        </button>
                    ` : ''}
                    ${order.status === 'ready' ? `
                        <button class="btn btn--info btn--small mark-served-btn" data-id="${order.id}">
                            <i class="fas fa-utensils"></i> Marcar Entregado
                        </button>
                    ` : ''}
                    ${order.status !== 'completed' ? `
                        <button class="btn btn--danger btn--small cancel-order-btn" data-id="${order.id}">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');

        // Asignar event listeners a los botones dinámicos
        attachOrderButtonListeners();
    };

    // --- Manejadores de Eventos de Acciones de Pedido ---

    const handleStartPreparing = async (orderId) => {
        try {
            await updateOrderStatus(orderId, 'preparing');
            if (showAlert) showAlert(`Pedido #${orderId} en preparación.`, 'success');
            loadOrders(); // Recargar la lista de pedidos
        } catch (error) {
            console.error("Error al iniciar preparación:", error);
            if (showAlert) showAlert('Error al cambiar estado a "en preparación".', 'error');
        }
    };

    const handleMarkReady = async (orderId) => {
        try {
            await updateOrderStatus(orderId, 'ready');
            if (showAlert) showAlert(`Pedido #${orderId} marcado como listo.`, 'success');
            loadOrders(); // Recargar la lista de pedidos
        } catch (error) {
            console.error("Error al marcar listo:", error);
            if (showAlert) showAlert('Error al cambiar estado a "listo".', 'error');
        }
    };

    const handleMarkServed = async (orderId) => {
        try {
            await updateOrderStatus(orderId, 'completed'); // Marcar como completado
            if (showAlert) showAlert(`Pedido #${orderId} entregado.`, 'success');
            loadOrders(); // Recargar la lista de pedidos
        } catch (error) {
            console.error("Error al marcar entregado:", error);
            if (showAlert) showAlert('Error al cambiar estado a "entregado".', 'error');
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!confirm(`¿Está seguro de que desea cancelar el Pedido #${orderId}? Esta acción no se puede deshacer.`)) {
            return;
        }
        try {
            // Asumo que 'cancelled' es un estado válido en tu backend
            await updateOrderStatus(orderId, 'cancelled'); 
            if (showAlert) showAlert(`Pedido #${orderId} cancelado.`, 'success');
            loadOrders(); // Recargar la lista de pedidos
        } catch (error) {
            console.error("Error al cancelar pedido:", error);
            if (showAlert) showAlert('Error al cancelar el pedido.', 'error');
        }
    };

    // Función para adjuntar event listeners a los botones generados dinámicamente
    const attachOrderButtonListeners = () => {
        document.querySelectorAll('.start-preparing-btn').forEach(button => {
            button.addEventListener('click', (e) => handleStartPreparing(e.currentTarget.dataset.id));
        });
        document.querySelectorAll('.mark-ready-btn').forEach(button => {
            button.addEventListener('click', (e) => handleMarkReady(e.currentTarget.dataset.id));
        });
        document.querySelectorAll('.mark-served-btn').forEach(button => {
            button.addEventListener('click', (e) => handleMarkServed(e.currentTarget.dataset.id));
        });
        document.querySelectorAll('.cancel-order-btn').forEach(button => {
            button.addEventListener('click', (e) => handleCancelOrder(e.currentTarget.dataset.id));
        });
    };

    // --- Carga principal de pedidos ---
    const loadOrders = async () => {
        if (!ordersListContainer) return; // Asegúrate de que el contenedor existe

        ordersListContainer.innerHTML = '<div class="loading-message">Cargando pedidos...</div>';
        try {
            const orders = await fetchOrders(currentFilter);
            renderOrders(orders);
        } catch (error) {
            console.error("Error al cargar pedidos:", error);
            ordersListContainer.innerHTML = '<div class="error-message">Error al cargar pedidos.</div>';
            if (showAlert) showAlert('Error al cargar los pedidos de cocina.', 'error');
        }
    };

    // --- Inicialización de Event Listeners Globales ---
    if (orderFilterSelect) {
        orderFilterSelect.addEventListener('change', (e) => {
            currentFilter = e.target.value;
            loadOrders(); // Recargar pedidos al cambiar el filtro
        });
    }

    if (refreshOrdersBtn) {
        refreshOrdersBtn.addEventListener('click', loadOrders); // Recargar al hacer clic en el botón
    }

    // --- Carga inicial de pedidos al cargar el controlador ---
    loadOrders();
};