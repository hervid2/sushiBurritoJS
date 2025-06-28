// =====================================================
// ARCHIVO: src/views/waiter/waiterOrdersController.js 
// =====================================================

import { showAlert } from '../../helpers/alerts.js';
import { showConfirmModal } from '../../helpers/modalHelper.js';
import { api } from '../../helpers/solicitudes.js';

export const waiterOrdersController = () => {
    // --- Referencias al DOM ---
    const tablesGrid = document.getElementById('tables-grid');
    if (!tablesGrid) {
         console.error("Critical Error: '#tables-grid' container not found.");
          return; 
        }
    const paginationContainer = document.getElementById('pagination-container');
    const orderModal = document.getElementById('order-modal');
    const orderModalTitle = document.getElementById('order-modal-title');
    const orderForm = document.getElementById('order-form');
    const orderIdInput = document.getElementById('order-id');
    const tableIdHiddenInput = document.getElementById('table-id-hidden');
    const orderStatusContainer = document.getElementById('order-status-container');
    const orderStatusDisplay = document.getElementById('order-status-display');
    const orderItemsList = document.getElementById('order-items-list');
    const modifyOrderBtn = document.getElementById('modify-order-btn');
    const addItemSection = document.getElementById('add-item-section');
    const categoryFilterSelect = document.getElementById('item-category-filter');
    const itemSelect = document.getElementById('item-select');
    const itemQuantityInput = document.getElementById('item-quantity');
    const itemNotesInput = document.getElementById('item-notes');
    const confirmAddItemBtn = document.getElementById('confirm-add-item-btn');
    const submitOrderBtn = document.getElementById('submit-order-btn');
    const closeOrderModalBtn = document.querySelector('#order-modal .modal__close-btn');
    const cancelOrderModalBtn = document.getElementById('cancel-order-modal-btn');
    const addItemControls = document.getElementById('add-item-controls');
    const orderTotalPriceSpan = document.getElementById('order-total-price');

    // --- Estado ---
    let allTables = [], allMenuItems = [], allCategories = [], currentOrderItems = [];
    let currentPage = 1;
  const itemsPerPage = 6;
        
    // --- Lógica de Carga de Datos ---
    const loadInitialData = async () => {
        tablesGrid.innerHTML = '<div class="loading-message">Cargando...</div>';
        try {
            // Obtener todos los datos necesarios en paralelo
            const [tablesData, allOrders, menuData, categoriesData] = await Promise.all([
                api.get('mesas'),
                api.get('pedidos'), // Obtenemos TODOS los pedidos para saber sus estados
                api.get('productos'),
                api.get('categorias')
            ]);
            
            // Crear un mapa para encontrar fácilmente el último pedido de cada mesa
            const latestOrderForTable = new Map();
            allOrders.forEach(order => {
                // Guardar solo el pedido más reciente para cada mesa
                if (!latestOrderForTable.has(order.mesa_id) || new Date(order.fecha_creacion) > new Date(latestOrderForTable.get(order.mesa_id).fecha_creacion)) {
                    latestOrderForTable.set(order.mesa_id, order);
                }
            });
            
            // Procesar las mesas con la lógica corregida
            allTables = tablesData.map(table => {
                const orderInfo = latestOrderForTable.get(table.mesa_id);
                let finalState = table.estado;
                let pedidoIdToShow = null;

                // Si la mesa está ocupada, verificamos el estado de su último pedido
                if (table.estado === 'ocupada' && orderInfo) {
                    pedidoIdToShow = orderInfo.pedido_id;
                    // Si el último pedido está pagado o cancelado, forzamos el estado a 'limpieza' en la interfaz
                    if (orderInfo.estado === 'pagado' || orderInfo.estado === 'cancelado') {
                        finalState = 'limpieza';
                    }
                }
                
                return { ...table, estado: finalState, pedido_id: pedidoIdToShow };
            });

            allMenuItems = menuData;
            allCategories = categoriesData;
            
            populateCategoryFilter();
            populateItemSelect();
            currentPage = 1;
            renderPage();
        } catch (error) {
            console.error(error);
            tablesGrid.innerHTML = '<div class="error-message">Error al cargar datos.</div>';
        }
    };


    // --- Lógica de Renderizado ---
    const renderPagination = () => {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';
        const totalPages = Math.ceil(allTables.length / itemsPerPage);
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

    const renderPage = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const pageTables = allTables.slice(startIndex, startIndex + itemsPerPage);
        tablesGrid.innerHTML = pageTables.map(table => `
            <div class="table-card table-card--${table.estado}" data-table-id="${table.mesa_id}">
                <div class="table-card__header"><h3 class="table-card__name">Mesa ${table.numero_mesa}</h3></div>
                <div class="table-card__body">
                    <p class="table-card__info"><strong>Estado:</strong> ${table.estado}</p>
                    ${table.pedido_id ? `<p class="table-card__info"><strong>Pedido:</strong> #${table.pedido_id}</p>` : ''}
                </div>
                <div class="table-card__actions">
                    ${table.estado === 'disponible' ? `<button class="btn btn--primary open-order-btn" data-table-id="${table.mesa_id}" data-table-name="Mesa ${table.numero_mesa}">Nuevo Pedido</button>` : ''}
                    ${table.estado === 'ocupada' && table.pedido_id ? `<button class="btn btn--info view-order-btn" data-order-id="${table.pedido_id}">Ver/Editar Pedido</button>` : ''}
                    ${table.estado === 'limpieza' ? `<button class="btn btn--secondary mark-clean-btn" data-table-id="${table.mesa_id}">Marcar como Limpia</button>` : ''}
                </div>
            </div>
        `).join('');
        renderPagination();
    };

    const renderOrderItems = () => {
        let total = 0;
        if (currentOrderItems.length > 0) {
            orderItemsList.innerHTML = currentOrderItems.map((item, index) => {
                const subtotal = item.valor_neto * item.cantidad;
                total += subtotal;
                return `
                    <div class="order-item-entry">
                        <div class="order-item-details">
                            <span>${item.cantidad}x ${item.nombre_producto}</span>
                            ${item.notas ? `<em class="order-item-notes">(${item.notas})</em>` : ''}
                        </div>
                        <div class="order-item-actions">
                            <span><strong>$${subtotal.toFixed(2)}</strong></span>
                            <button type="button" class="btn btn--danger btn--small delete-order-item-btn" data-index="${index}">X</button>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            orderItemsList.innerHTML = '<p>Aún no hay artículos en este pedido.</p>';
        }
        orderTotalPriceSpan.textContent = `$${total.toFixed(2)}`;
    };

    const populateCategoryFilter = () => categoryFilterSelect.innerHTML = ['<option value="all">Todas</option>', ...allCategories.map(c => `<option value="${c.categoria_id}">${c.nombre}</option>`)].join('');
    
    const populateItemSelect = (categoryId = 'all') => {
        const items = categoryId === 'all' ? allMenuItems : allMenuItems.filter(i => i.categoria_id == categoryId);
        itemSelect.innerHTML = items.map(i => `<option value="${i.producto_id}">${i.nombre_producto} ($${parseFloat(i.valor_neto).toFixed(2)})</option>`).join('');
    };
    
    const openOrderModal = (config) => {
        orderForm.reset();
        orderModalTitle.textContent = config.title;
        orderIdInput.value = config.orderId || '';
        tableIdHiddenInput.value = config.tableId;
        currentOrderItems = config.items || [];
        renderOrderItems();
        const isEditable = !config.status || config.status === 'pendiente';
        orderStatusContainer.style.display = config.status ? 'block' : 'none';
        if (config.status) {
            orderStatusDisplay.textContent = `Estado: ${config.status}`;
            orderStatusDisplay.className = `order-status-display order-status--${config.status}`;
        }
        addItemControls.style.display = isEditable ? 'block' : 'none';
        submitOrderBtn.style.display = isEditable ? 'block' : 'none';
        addItemSection.style.display = 'none';
        if (!isEditable && config.status) showAlert(`Este pedido no es editable (estado: ${config.status}).`, 'info');
        orderModal.classList.add('is-active');
    };
    
    const handleDeleteItemFromOrder = (itemIndex) => {
        currentOrderItems.splice(itemIndex, 1);
        renderOrderItems();
    };

    const handleNewOrderClick = (tableId, tableName) => openOrderModal({ title: `Nuevo Pedido para ${tableName}`, tableId, isEditable: true });
    
    const handleViewOrderClick = async (orderId) => {
        try {
            const order = await api.get(`pedidos/${orderId}`);
            const items = order.Productos.map(p => ({
                producto_id: p.producto_id,
                nombre_producto: p.nombre_producto,
                valor_neto: p.valor_neto,
                cantidad: p.DetallePedido.cantidad,
                notas: p.DetallePedido.notas,
            }));
            openOrderModal({ title: `Detalles del Pedido #${orderId}`, orderId: order.pedido_id, tableId: order.mesa_id, status: order.estado, items, isEditable: order.estado === 'pendiente' });
        } catch (error) {
            showAlert(error.message, 'error');
        }
    };
    
    const handleMarkAsAvailable = async (tableId) => {
        try {
            // Usamos 'put'  y enviamos un cuerpo vacío.
            await api.put(`mesas/${tableId}/mark-as-available`, {});
            showAlert('Mesa disponible de nuevo.', 'success');
            loadInitialData();
        } catch (error) {
            showAlert(error.message, 'error');
        }
    };

    const handleSaveOrder = async (e) => {
        e.preventDefault();
        const orderId = orderIdInput.value;
        const tableId = tableIdHiddenInput.value;
        if (currentOrderItems.length === 0) {
            showAlert('Debe añadir al menos un artículo al pedido.', 'warning');
            return;
        }
        const orderData = {
            mesa_id: tableId,
            items: currentOrderItems.map(item => ({ producto_id: item.producto_id, cantidad: item.cantidad, notas: item.notas }))
        };
        try {
            if (orderId) {
                await api.put(`pedidos/${orderId}`, { items: orderData.items });
                showAlert('Pedido actualizado correctamente.', 'success');
            } else {
                await api.post('pedidos', orderData);
                showAlert('Pedido creado correctamente.', 'success');
            }
            orderModal.classList.remove('is-active');
            await loadInitialData();
        } catch(error) { 
            showAlert(error.message, 'error');
        }
    };
    
    const init = () => {
        tablesGrid.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;
            if (target.matches('.open-order-btn')) handleNewOrderClick(target.dataset.tableId, target.dataset.tableName);
            if (target.matches('.view-order-btn')) handleViewOrderClick(target.dataset.orderId);
            if (target.matches('.mark-clean-btn')) handleMarkAsAvailable(target.dataset.tableId);
        });
        
        orderItemsList.addEventListener('click', (e) => {
            if (e.target.matches('.delete-order-item-btn')) {
                const itemIndex = parseInt(e.target.dataset.index, 10);
                handleDeleteItemFromOrder(itemIndex);
            }
        });

        modifyOrderBtn.onclick = () => { addItemSection.style.display = 'block'; };
        categoryFilterSelect.onchange = () => populateItemSelect(categoryFilterSelect.value);

        confirmAddItemBtn.onclick = () => {
            const selectedItem = allMenuItems.find(i => i.producto_id == itemSelect.value);
            if (selectedItem) {
                currentOrderItems.push({
                    producto_id: selectedItem.producto_id,
                    nombre_producto: selectedItem.nombre_producto,
                    valor_neto: selectedItem.valor_neto,
                    cantidad: itemQuantityInput.valueAsNumber,
                    notas: itemNotesInput.value,
                });
                renderOrderItems();
            }
            addItemSection.style.display = 'none';
            itemQuantityInput.value = 1;
            itemNotesInput.value = '';
        };

        orderForm.onsubmit = handleSaveOrder;
        closeOrderModalBtn.onclick = () => orderModal.classList.remove('is-active');
        cancelOrderModalBtn.onclick = () => orderModal.classList.remove('is-active');

        loadInitialData();
    };

    init();
};
