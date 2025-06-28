// ===========================================
// ARCHIVO: waiterOrdersStatusController.js 
// ===========================================

import { showAlert } from '../../helpers/alerts.js';
import { api } from '../../helpers/solicitudes.js';

export const waiterOrdersStatusController = () => {
    const ordersStatusTableBody = document.getElementById('orders-status-table-body');
    const paginationContainer = document.getElementById('orders-status-pagination');
    const table = document.getElementById('orders-status-table');

    const itemsPerPage = 10;
    let currentPage = 1;
    let allOrdersData = [];

    const loadOrdersStatus = async () => {
        if (!ordersStatusTableBody) return;
        ordersStatusTableBody.innerHTML = `<tr><td colspan="7" class="loading-message">Cargando...</td></tr>`;
        paginationContainer.innerHTML = ''; 
        try {
            allOrdersData = await api.get('pedidos'); 
            currentPage = 1;
            renderOrdersStatusTable();
        } catch (error) {
            ordersStatusTableBody.innerHTML = `<tr><td colspan="7" class="error-message">${error.message}</td></tr>`;
        }
    };

    // FUNCIÓN para manejar el cambio de estado
    const handleMarkAsDelivered = async (orderId) => {
        try {
            await api.put(`pedidos/${orderId}/estado`, { estado: 'entregado' });
            showAlert('Pedido marcado como entregado.', 'success');
            loadOrdersStatus(); // Recarga la tabla para ver el cambio
        } catch (error) {
            showAlert(error.message, 'error');
        }
    };
    
    const renderOrdersStatusTable = () => {
        // Añade a la cabecera 'Acciones'
        table.querySelector('thead tr').innerHTML = `
            <th># Pedido</th>
            <th>Mesero/a</th>
            <th>Mesa</th>
            <th>Estado</th>
            <th>Creación</th>
            <th>Últ. Act.</th>
            <th>Acciones</th>
        `;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const ordersToDisplay = allOrdersData.slice(startIndex, startIndex + itemsPerPage);

        if (ordersToDisplay.length === 0) {
            ordersStatusTableBody.innerHTML = '<tr><td colspan="7" class="empty-message">No hay pedidos.</td></tr>';
            return;
        }
        
        const formatDate = (dateString) => {
            if (!dateString) return 'N/A';
            const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            return new Date(dateString).toLocaleDateString('es-CO', options);
        };

        ordersStatusTableBody.innerHTML = ordersToDisplay.map(order => `
            <tr>
                <td>${order.pedido_id}</td>
                <td>${order.Usuario?.nombre || 'N/A'}</td>
                <td>${order.Mesa?.numero_mesa || 'N/A'}</td>
                <td><span class="status-badge status-badge--${order.estado}">${order.estado}</span></td>
                <td>${formatDate(order.fecha_creacion)}</td>
                <td>${formatDate(order.fecha_modificacion)}</td>
                <td class="table-actions">
                    ${
                        order.estado === 'preparado' 
                        ? `<button class="btn btn--primary btn--small mark-delivered-btn" data-id="${order.pedido_id}">Marcar Entregado</button>`
                        : '---'
                    }
                </td>
            </tr>
        `).join('');

        renderPagination();
    };

    const renderPagination = () => {
        // Lógica de paginación
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

    const init = () => {
        // Listener para los nuevos botones
        ordersStatusTableBody.addEventListener('click', (e) => {
            if (e.target.matches('.mark-delivered-btn')) {
                const orderId = e.target.dataset.id;
                handleMarkAsDelivered(orderId);
            }
        });
        loadOrdersStatus();
    };

    init();
};