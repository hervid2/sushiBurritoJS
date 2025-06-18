// src/views/waiter/waiterOrdersController.js

import { showAlert } from '../../helpers/alerts.js';
import { showConfirmModal } from '../../helpers/modalHelper.js';

export const waiterOrdersController = () => {
    console.log("Waiter Orders Controller Initialized.");

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

    // --- API Simulada ---
    const FAKE_TABLES_DB = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: `Mesa ${i + 1}`, status: i % 3 === 0 ? 'occupied' : 'available', orderId: i % 3 === 0 ? `ORD${String(i + 1).padStart(3, '0')}` : null, orderStatus: i % 3 === 0 ? (i % 2 === 0 ? 'pending' : 'preparing') : null }));
    const FAKE_MENU_DB = [ { id: 'P01', name: 'Sushi Roll California', category: 'sushi', price: 12.50 }, { id: 'P02', name: 'Burrito Teriyaki', category: 'burrito', price: 15.00 }, { id: 'P03', name: 'Gyoza de Cerdo', category: 'entradas', price: 7.00 }, { id: 'B01', name: 'Coca-Cola', category: 'bebidas', price: 2.50 }, { id: 'D01', name: 'Tarta de Matcha', category: 'postres', price: 5.00 } ];
    const FAKE_CATEGORIES = ['sushi', 'burrito', 'entradas', 'bebidas', 'postres'];

    const fetchTables = async () => new Promise(r => setTimeout(() => r([...FAKE_TABLES_DB]), 200));
    const fetchMenuAndCategories = async () => new Promise(r => setTimeout(() => r({ menu: FAKE_MENU_DB, categories: FAKE_CATEGORIES }), 200));
    const fetchOrderById = async (orderId) => new Promise(r => {
        const table = FAKE_TABLES_DB.find(t => t.orderId === orderId);
        if(table) r({ id: orderId, tableId: table.id, status: table.orderStatus, items: [{ productId: 'P01', name: 'Sushi Roll California', quantity: 2, notes: 'Extra wasabi', price: 12.50 }] });
        else r(null);
    });
    const updateOrderApi = async (orderId, items) => new Promise(r => setTimeout(() => { console.log(`Updating order ${orderId}`, items); r({success: true}); }, 400));
    const createOrderApi = async (tableId, items) => new Promise(r => setTimeout(() => { console.log(`Creating order for table ${tableId}`, items); const newId = `ORD${Math.floor(Math.random()*900)+100}`; r({success: true, orderId: newId}); }, 400));
    const updateTableStatus = async (tableId, status, orderId = null) => new Promise(r => setTimeout(() => {
        const table = FAKE_TABLES_DB.find(t => t.id === tableId);
        if (table) { table.status = status; table.orderId = orderId; }
        r({success: true});
    }, 100));

    // --- Lógica de Renderizado ---
    const renderPage = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const pageTables = allTables.slice(startIndex, startIndex + itemsPerPage);
        tablesGrid.innerHTML = pageTables.map(table => `
            <div class="table-card table-card--${table.status}" data-table-id="${table.id}">
                <div class="table-card__header"><h3 class="table-card__name">${table.name}</h3></div>
                <div class="table-card__body">
                    <p class="table-card__info"><strong>Estado:</strong> ${table.status === 'available' ? 'Disponible' : 'Ocupada'}</p>
                    ${table.orderId ? `<p class="table-card__info"><strong>Pedido:</strong> #${table.orderId}</p>` : ''}
                </div>
                <div class="table-card__actions">
                    ${table.status === 'available' ? `<button class="btn btn--primary open-order-btn" data-table-id="${table.id}">Nuevo Pedido</button>` : ''}
                    ${table.status === 'occupied' ? `<button class="btn btn--info view-order-btn" data-order-id="${table.orderId}">Ver/Editar Pedido</button>` : ''}
                    ${table.status === 'occupied' ? `<button class="btn btn--secondary close-table-btn" data-table-id="${table.id}">Cerrar Mesa</button>` : ''}
                </div>
            </div>
        `).join('');
        renderPagination();
    };
    
    const renderPagination = () => {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';
        const totalPages = Math.ceil(allTables.length / itemsPerPage);
        if (totalPages <= 1) return;
        const ul = document.createElement('ul');
        ul.className = 'pagination';
        for (let i = 1; i <= totalPages; i++) {
            const pageLi = document.createElement('li');
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            pageBtn.className = 'pagination-btn';
            if (i === currentPage) pageBtn.classList.add('active');
            pageBtn.onclick = () => { currentPage = i; renderPage(); };
            pageLi.appendChild(pageBtn);
            ul.appendChild(pageLi);
        }
        paginationContainer.appendChild(ul);
    };

    const renderOrderItems = () => {
        let total = 0;
        if (currentOrderItems.length > 0) {
            orderItemsList.innerHTML = currentOrderItems.map((item, index) => {
                const subtotal = item.price * item.quantity;
                total += subtotal;
                return `
                    <div class="order-item-entry">
                        <span>${item.quantity}x ${item.name} ${item.notes ? `<em>(${item.notes})</em>` : ''}</span>
                        <span><strong>$${subtotal.toFixed(2)}</strong></span>
                    </div>
                `;
            }).join('');
        } else {
            orderItemsList.innerHTML = '<p>Aún no hay artículos en este pedido.</p>';
        }
        orderTotalPriceSpan.textContent = `$${total.toFixed(2)}`;
    };

    const populateCategoryFilter = () => categoryFilterSelect.innerHTML = ['<option value="all">Todas</option>', ...allCategories.map(c => `<option value="${c}">${c}</option>`)].join('');
    const populateItemSelect = (category = 'all') => {
        const items = category === 'all' ? allMenuItems : allMenuItems.filter(i => i.category === category);
        itemSelect.innerHTML = items.map(i => `<option value="${i.id}">${i.name} ($${i.price.toFixed(2)})</option>`).join('');
    };

    // --- Lógica de la Interfaz ---
    const openOrderModal = (config) => {
        orderForm.reset();
        orderModalTitle.textContent = config.title;
        orderIdInput.value = config.orderId || '';
        tableIdHiddenInput.value = config.tableId;
        currentOrderItems = config.items || [];
        renderOrderItems();
        const isEditable = config.isEditable;
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

    const handleNewOrderClick = (tableId) => openOrderModal({ title: `Nuevo Pedido para Mesa ${tableId}`, tableId: parseInt(tableId), isEditable: true });
    
    const handleViewOrderClick = async (orderId) => {
        const order = await fetchOrderById(orderId);
        if (order) {
            openOrderModal({ title: `Detalles del Pedido #${orderId}`, orderId: order.id, tableId: order.tableId, status: order.status, items: order.items, isEditable: order.status === 'pending' });
        } else {
            showAlert('No se encontró el pedido asociado.', 'error');
        }
    };
    
    const handleCloseTable = async (tableId) => {
        try {
            await showConfirmModal('Confirmar Cierre', `¿Está seguro de que desea cerrar y liberar la Mesa ${tableId}?`);
            await updateTableStatus(parseInt(tableId), 'available', null);
            showAlert(`Mesa ${tableId} liberada.`, 'success');
            await loadInitialData();
        } catch { console.log("Cierre de mesa cancelado."); }
    };

    const handleSaveOrder = async (e) => {
        e.preventDefault();
        const orderId = orderIdInput.value;
        const tableId = parseInt(tableIdHiddenInput.value);
        if (currentOrderItems.length === 0) {
            showAlert('Debe añadir al menos un artículo al pedido.', 'warning');
            return;
        }
        const itemsToSave = currentOrderItems.map(item => ({ productId: item.productId, quantity: item.quantity, notes: item.notes }));
        try {
            if (orderId) {
                await updateOrderApi(orderId, itemsToSave);
                showAlert('Pedido actualizado.', 'success');
            } else {
                const result = await createOrderApi(tableId, itemsToSave);
                await updateTableStatus(tableId, 'occupied', result.orderId);
                showAlert('Pedido creado.', 'success');
            }
            orderModal.classList.remove('is-active');
            await loadInitialData();
        } catch(error) { showAlert('Error al guardar el pedido.', 'error'); }
    };
    
    // --- Listeners e Inicialización ---
    const attachListeners = () => {
        tablesGrid.addEventListener('click', (e) => {
            if (e.target.matches('.open-order-btn')) handleNewOrderClick(e.target.dataset.tableId);
            if (e.target.matches('.view-order-btn')) handleViewOrderClick(e.target.dataset.orderId);
            if (e.target.matches('.close-table-btn')) handleCloseTable(e.target.dataset.tableId);
        });
        modifyOrderBtn.onclick = () => { addItemSection.style.display = 'block'; };
        categoryFilterSelect.onchange = () => populateItemSelect(categoryFilterSelect.value);
        confirmAddItemBtn.onclick = () => {
            const selectedItem = allMenuItems.find(i => i.id === itemSelect.value);
            if (selectedItem) {
                currentOrderItems.push({ productId: selectedItem.id, name: selectedItem.name, quantity: itemQuantityInput.valueAsNumber, notes: itemNotesInput.value, price: selectedItem.price });
                renderOrderItems();
            }
            addItemSection.style.display = 'none';
            itemNotesInput.value = '';
        };
        orderForm.onsubmit = handleSaveOrder;
        closeOrderModalBtn.onclick = () => orderModal.classList.remove('is-active');
        cancelOrderModalBtn.onclick = () => orderModal.classList.remove('is-active');
    };
    
    const loadInitialData = async () => {
        tablesGrid.innerHTML = '<div class="loading-message">Cargando...</div>';
        try {
            const tablesData = await fetchTables();
            allTables = tablesData;
            
            const menuData = await fetchMenuAndCategories();
            allMenuItems = menuData.menu;
            allCategories = menuData.categories;
            
            populateCategoryFilter();
            populateItemSelect();
            
            renderPage();
        } catch (error) {
            console.error(error);
            tablesGrid.innerHTML = '<div class="error-message">Error al cargar datos.</div>';
        }
    };
    
    attachListeners();
    loadInitialData();
};



