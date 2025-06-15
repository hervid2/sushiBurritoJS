// src/views/waiter/waiterOrdersStatusController.js
import { showAlert } from '../../helpers/alerts.js';

export const waiterOrdersStatusController = (params) => {
    console.log("Waiter Orders Status Controller Initialized.", params);

    const ordersStatusTableBody = document.getElementById('orders-status-table-body');
    const paginationContainer = document.getElementById('orders-status-pagination');

    const itemsPerPage = 10; // Pedidos por página para esta tabla
    let currentPage = 1;
    let allOrdersData = []; // Para almacenar todos los pedidos y paginarlos

    const fetchAllOrdersStatus = async () => {
        return new Promise(resolve => {
            setTimeout(() => {
                // Simulación de todos los pedidos, incluyendo estados terminados
                const orders = [
                    { id: 'ORD001', waiter: 'Ana P.', table: 'Mesa 5', status: 'pending', created: '2025-06-14 20:00', modified: '2025-06-14 20:00' },
                    { id: 'ORD002', waiter: 'Luis G.', table: 'Mesa 12', status: 'pending', created: '2025-06-14 20:05', modified: '2025-06-14 20:05' },
                    { id: 'ORD003', waiter: 'Ana P.', table: 'Mesa 3', status: 'preparing', created: '2025-06-14 19:45', modified: '2025-06-14 20:10' },
                    { id: 'ORD004', waiter: 'Pedro M.', table: 'Mesa 8', status: 'preparing', created: '2025-06-14 19:50', modified: '2025-06-14 20:15' },
                    { id: 'ORD005', waiter: 'Luis G.', table: 'Mesa 1', status: 'ready', created: '2025-06-14 19:30', modified: '2025-06-14 20:20' },
                    { id: 'ORD006', waiter: 'Ana P.', table: 'Mesa 10', status: 'completed', created: '2025-06-14 19:00', modified: '2025-06-14 20:25' },
                    { id: 'ORD007', waiter: 'Pedro M.', table: 'Mesa 7', status: 'completed', created: '2025-06-14 18:45', modified: '2025-06-14 20:30' },
                    { id: 'ORD008', waiter: 'Luis G.', table: 'Mesa 2', status: 'pending', created: '2025-06-14 20:10', modified: '2025-06-14 20:10' },
                    { id: 'ORD009', waiter: 'Ana P.', table: 'Mesa 7', status: 'pending', created: '2025-06-14 20:15', modified: '2025-06-14 20:15' },
                    { id: 'ORD010', waiter: 'Pedro M.', table: 'Mesa 1', status: 'pending', created: '2025-06-14 20:20', modified: '2025-06-14 20:20' },
                    { id: 'ORD011', waiter: 'Ana P.', table: 'Mesa 9', status: 'pending', created: '2025-06-14 20:25', modified: '2025-06-14 20:25' },
                    { id: 'ORD012', waiter: 'Luis G.', table: 'Mesa 4', status: 'pending', created: '2025-06-14 20:30', modified: '2025-06-14 20:30' },
                    { id: 'ORD013', waiter: 'Pedro M.', table: 'Mesa 6', status: 'pending', created: '2025-06-14 20:35', modified: '2025-06-14 20:35' },
                    { id: 'ORD014', waiter: 'Ana P.', table: 'Mesa 11', status: 'preparing', created: '2025-06-14 19:55', modified: '2025-06-14 20:40' },
                    { id: 'ORD015', waiter: 'Luis G.', table: 'Mesa 13', status: 'preparing', created: '2025-06-14 20:00', modified: '2025-06-14 20:45' },
                    { id: 'ORD016', waiter: 'Pedro M.', table: 'Mesa 14', status: 'ready', created: '2025-06-14 19:35', modified: '2025-06-14 20:50' },
                    { id: 'ORD017', waiter: 'Ana P.', table: 'Mesa 15', status: 'ready', created: '2025-06-14 19:40', modified: '2025-06-14 20:55' },
                ];
                resolve(orders);
            }, 500);
        });
    };

    const renderOrdersStatusTable = (orders) => {
        if (!ordersStatusTableBody) return;

        // Calcular los pedidos para la página actual
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const ordersToDisplay = orders.slice(startIndex, endIndex);

        if (ordersToDisplay.length === 0) {
            ordersStatusTableBody.innerHTML = '<tr><td colspan="6" class="empty-message">No hay pedidos disponibles para mostrar.</td></tr>';
            return;
        }

        ordersStatusTableBody.innerHTML = ordersToDisplay.map(order => `
            <tr>
                <td>${order.id}</td>
                <td>${order.waiter}</td>
                <td>${order.table}</td>
                <td><span class="status-badge status-badge--${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></td>
                <td>${order.created}</td>
                <td>${order.modified}</td>
            </tr>
        `).join('');

        renderPagination(orders.length);
    };

    const renderPagination = (totalItems) => {
        if (!paginationContainer) return;

        const totalPages = Math.ceil(totalItems / itemsPerPage);
        paginationContainer.innerHTML = '';

        if (totalPages <= 1) {
            return;
        }

        const ul = document.createElement('ul');
        ul.classList.add('pagination');

        const prevLi = document.createElement('li');
        const prevBtn = document.createElement('button');
        prevBtn.textContent = 'Anterior';
        prevBtn.classList.add('btn', 'btn--small', 'pagination-btn');
        if (currentPage === 1) prevBtn.disabled = true;
        prevBtn.addEventListener('click', () => {
            currentPage--;
            renderOrdersStatusTable(allOrdersData);
        });
        prevLi.appendChild(prevBtn);
        ul.appendChild(prevLi);

        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.classList.add('btn', 'btn--small', 'pagination-btn');
            if (i === currentPage) btn.classList.add('active');
            btn.addEventListener('click', () => {
                currentPage = i;
                renderOrdersStatusTable(allOrdersData);
            });
            li.appendChild(btn);
            ul.appendChild(li);
        }

        const nextLi = document.createElement('li');
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Siguiente';
        nextBtn.classList.add('btn', 'btn--small', 'pagination-btn');
        if (currentPage === totalPages) nextBtn.disabled = true;
        nextBtn.addEventListener('click', () => {
            currentPage++;
            renderOrdersStatusTable(allOrdersData);
        });
        nextLi.appendChild(nextBtn);
        ul.appendChild(nextLi);

        paginationContainer.appendChild(ul);
    };

    const loadOrdersStatus = async () => {
        if (!ordersStatusTableBody) return;
        ordersStatusTableBody.innerHTML = '<tr><td colspan="6" class="loading-message">Cargando estado de pedidos...</td></tr>';
        paginationContainer.innerHTML = ''; // Limpiar paginación al cargar
        try {
            allOrdersData = await fetchAllOrdersStatus(); // Guarda todos los datos para paginación
            renderOrdersStatusTable(allOrdersData);
        } catch (error) {
            console.error("Error al cargar estado de pedidos:", error);
            ordersStatusTableBody.innerHTML = '<tr><td colspan="6" class="error-message">Error al cargar el estado de pedidos.</td></tr>';
            if (showAlert) showAlert('Error al cargar el estado de los pedidos.', 'error');
        }
    };

    loadOrdersStatus();
};