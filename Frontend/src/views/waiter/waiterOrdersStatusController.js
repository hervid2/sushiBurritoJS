// ===========================================
// ARCHIVO: waiterOrdersStatusController.js 
// ===========================================

import { showAlert } from '../../helpers/alerts.js';
import { api } from '../../helpers/solicitudes.js';  

export const waiterOrdersStatusController = () => {
    // --- Referencias al DOM ---
    const ordersStatusTableBody = document.getElementById('orders-status-table-body');
    const paginationContainer = document.getElementById('orders-status-pagination');

    // --- Estado de Paginación ---
    const itemsPerPage = 10;
    let currentPage = 1;
    let allOrdersData = [];

    // --- Lógica de la API  ---
    const loadOrdersStatus = async () => {
        if (!ordersStatusTableBody) return;
        ordersStatusTableBody.innerHTML = '<tr><td colspan="6" class="loading-message">Cargando estado de pedidos...</td></tr>';
        paginationContainer.innerHTML = ''; 
        try {
            allOrdersData = await api.get('pedidos'); 
            currentPage = 1; // Resetea a la primera página
            renderOrdersStatusTable();
        } catch (error) {
            console.error("Error al cargar estado de pedidos:", error);
            ordersStatusTableBody.innerHTML = `<tr><td colspan="6" class="error-message">${error.message}</td></tr>`;
            showAlert('Error al cargar el estado de los pedidos.', 'error');
        }
    };

    // --- Lógica de Renderizado ---
    const renderOrdersStatusTable = () => {
        if (!ordersStatusTableBody) return;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const ordersToDisplay = allOrdersData.slice(startIndex, startIndex + itemsPerPage);

        if (ordersToDisplay.length === 0) {
            ordersStatusTableBody.innerHTML = '<tr><td colspan="6" class="empty-message">No hay pedidos disponibles para mostrar.</td></tr>';
            return;
        }
        
        // Función para formatear fechas de manera legible
        const formatDate = (dateString) => {
            if (!dateString) return 'N/A';
            const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            return new Date(dateString).toLocaleDateString('es-CO', options);
        };

        
        ordersStatusTableBody.innerHTML = ordersToDisplay.map(order => `
            <tr>
                <td>${order.pedido_id}</td>
                <td>${order.Usuario?.nombre || 'No asignado'}</td>
                <td>${order.Mesa?.numero_mesa || 'No asignada'}</td>
                <td><span class="status-badge status-badge--${order.estado}">${order.estado}</span></td>
                <td>${formatDate(order.fecha_creacion)}</td>
                <td>${formatDate(order.fecha_modificacion)}</td>
            </tr>
        `).join('');

        renderPagination();
    };

    const renderPagination = () => {
        if (!paginationContainer) return;
        const totalPages = Math.ceil(allOrdersData.length / itemsPerPage);
        paginationContainer.innerHTML = '';
        if (totalPages <= 1) return;

        let buttonsHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            buttonsHTML += `<li><button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button></li>`;
        }
        paginationContainer.innerHTML = `<ul>${buttonsHTML}</ul>`;
        
        paginationContainer.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentPage = parseInt(btn.dataset.page, 10);
                renderOrdersStatusTable();
            });
        });
    };

    // --- Inicialización ---
    loadOrdersStatus();
};