import { showAlert } from '../../helpers/alerts.js'; // Asumiendo que alerts.js es Vanilla JS
import { navigateTo } from '../../router/router.js'; // Para navegación si es necesario

export const waiterOrdersController = (params) => {
    console.log("Waiter Orders Controller Initialized.", params);

    // --- Referencias a elementos del DOM ---
    const tablesGrid = document.getElementById('tables-grid');
    const newOrderBtn = document.getElementById('new-order-btn');
    const refreshTablesBtn = document.getElementById('refresh-tables-btn');

    // Modal de Pedido
    const orderModal = document.getElementById('order-modal');
    const closeOrderModalBtn = document.getElementById('close-order-modal');
    const cancelOrderModalBtn = document.getElementById('cancel-order-modal-btn');
    const orderModalTitle = document.getElementById('order-modal-title');
    const orderForm = document.getElementById('order-form');
    const orderIdInput = document.getElementById('order-id');
    const tableSelect = document.getElementById('table-id');
    const orderNotesInput = document.getElementById('order-notes');
    const orderItemsList = document.getElementById('order-items-list');
    const addItemBtn = document.getElementById('add-item-btn');
    const addItemSection = document.getElementById('add-item-section');
    const itemSelect = document.getElementById('item-select');
    const itemQuantityInput = document.getElementById('item-quantity');
    const confirmAddItemBtn = document.getElementById('confirm-add-item-btn');
    const cancelAddItemBtn = document.getElementById('cancel-add-item-btn');
    const submitOrderBtn = document.getElementById('submit-order-btn');

    // Filtro de Mesas
    const tableFilterToggle = document.getElementById('table-filter-toggle');
    const tableFilterMenu = document.getElementById('table-filter-menu');
    const currentFilterText = document.getElementById('current-filter-text');

    // --- Variables de estado ---
    let currentTableFilter = 'all'; // 'all', 'occupied', 'available', 'needs_cleaning'
    let currentOrderItems = []; // Almacena los ítems del pedido que se están creando/editando
    let allMenuItems = []; // Para almacenar el menú completo
    let allTables = []; // Para almacenar todas las mesas

    // --- Funciones de Simulación de API con Fetch ---

    const fetchTables = async (filter = 'all') => {
        // Simulación de datos de mesas
        const simulatedTables = [
            { id: 1, name: 'Mesa 1', capacity: 4, status: 'occupied', currentOrderId: 'ORD001' },
            { id: 2, name: 'Mesa 2', capacity: 2, status: 'available', currentOrderId: null },
            { id: 3, name: 'Mesa 3', capacity: 6, status: 'occupied', currentOrderId: 'ORD003' },
            { id: 4, name: 'Mesa 4', capacity: 4, status: 'available', currentOrderId: null },
            { id: 5, name: 'Mesa 5', capacity: 8, status: 'needs_cleaning', currentOrderId: null },
            { id: 6, name: 'Mesa 6', capacity: 2, status: 'occupied', currentOrderId: 'ORD004' },
        ];
        allTables = simulatedTables; // Almacena todas las mesas

        return new Promise(resolve => {
            setTimeout(() => {
                const filtered = simulatedTables.filter(table => {
                    if (filter === 'all') return true;
                    return table.status === filter;
                });
                resolve(filtered);
            }, 500);
        });
    };

    const fetchOrderById = async (orderId) => {
        // Simulación de un pedido existente (para edición)
        const simulatedOrders = [
            { 
                id: 'ORD001', tableId: 1, notes: 'Sin cebolla', status: 'pending',
                items: [
                    { productId: 'PROD001', name: 'Sushi Roll California', quantity: 2 },
                    { productId: 'PROD003', name: 'Gyoza de Cerdo (6u)', quantity: 1 }
                ]
            },
            { 
                id: 'ORD003', tableId: 3, notes: 'Extra picante', status: 'preparing',
                items: [
                    { productId: 'PROD002', name: 'Burrito de Pollo Teriyaki', quantity: 1 }
                ]
            }
        ];
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const order = simulatedOrders.find(o => o.id === orderId);
                if (order) resolve(order);
                else reject(new Error('Pedido no encontrado.'));
            }, 300);
        });
    };

    const fetchMenuItems = async () => {
        // Simulación de ítems del menú
        const simulatedMenu = [
            { id: 'PROD001', name: 'Sushi Roll California', price: 12.50 },
            { id: 'PROD002', name: 'Burrito de Pollo Teriyaki', price: 15.00 },
            { id: 'PROD003', name: 'Gyoza de Cerdo (6u)', price: 7.00 },
            { id: 'PROD004', name: 'Sopa Miso', price: 4.00 },
            { id: 'PROD005', name: 'Ramen de Cerdo', price: 18.00 },
            { id: 'PROD006', name: 'Nigiri Surtido', price: 10.00 },
        ];
        allMenuItems = simulatedMenu; // Almacena el menú completo
        return new Promise(resolve => setTimeout(() => resolve(simulatedMenu), 200));
    };

    const createOrder = async (orderData) => {
        return new Promise(resolve => {
            setTimeout(() => {
                const newOrderId = 'ORD' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
                console.log('Simulating new order creation:', { ...orderData, id: newOrderId, status: 'pending' });
                resolve({ success: true, message: `Pedido #${newOrderId} creado exitosamente.`, orderId: newOrderId });
            }, 700);
        });
    };

    const updateOrder = async (orderId, orderData) => {
        return new Promise(resolve => {
            setTimeout(() => {
                console.log('Simulating order update:', orderId, orderData);
                resolve({ success: true, message: `Pedido #${orderId} actualizado exitosamente.` });
            }, 700);
        });
    };

    const updateTableStatus = async (tableId, newStatus) => {
        return new Promise(resolve => {
            setTimeout(() => {
                console.log(`Simulating update of table ${tableId} status to: ${newStatus}`);
                resolve({ success: true, message: `Mesa ${tableId} actualizada a ${newStatus}.` });
            }, 300);
        });
    };

    // --- Funciones de Renderizado ---

    const renderTables = (tables) => {
        if (!tablesGrid) return;
        tablesGrid.innerHTML = tables.map(table => `
            <div class="table-card table-card--${table.status}" data-table-id="${table.id}" data-current-order-id="${table.currentOrderId || ''}">
                <div class="table-card__header">
                    <h3>Mesa ${table.name}</h3>
                    <span class="table-card__capacity">Capacidad: ${table.capacity}</span>
                </div>
                <div class="table-card__body">
                    <p>Estado: <strong>${getTableStatusText(table.status)}</strong></p>
                    ${table.currentOrderId ? `<p>Pedido Activo: #${table.currentOrderId}</p>` : ''}
                </div>
                <div class="table-card__actions">
                    ${table.status === 'available' ? `
                        <button class="btn btn--primary btn--small open-order-btn" data-table-id="${table.id}">
                            <i class="fas fa-file-invoice"></i> Abrir Pedido
                        </button>
                    ` : ''}
                    ${table.status === 'occupied' && table.currentOrderId ? `
                        <button class="btn btn--info btn--small view-order-btn" data-order-id="${table.currentOrderId}">
                            <i class="fas fa-eye"></i> Ver Pedido
                        </button>
                        <button class="btn btn--warning btn--small close-table-btn" data-table-id="${table.id}">
                            <i class="fas fa-times"></i> Cerrar Mesa
                        </button>
                    ` : ''}
                    ${table.status === 'needs_cleaning' ? `
                        <button class="btn btn--success btn--small clean-table-btn" data-table-id="${table.id}">
                            <i class="fas fa-broom"></i> Mesa Limpia
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
        attachTableButtonListeners();
    };

    const getTableStatusText = (status) => {
        const statuses = {
            'available': 'Disponible',
            'occupied': 'Ocupada',
            'needs_cleaning': 'Necesita Limpieza'
        };
        return statuses[status] || status;
    };

    const renderOrderItems = (items) => {
        orderItemsList.innerHTML = '';
        if (items.length === 0) {
            orderItemsList.innerHTML = '<p class="text-muted">No hay artículos en este pedido.</p>';
            return;
        }
        items.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('order-item-entry');
            itemDiv.innerHTML = `
                <span>${item.quantity}x ${item.name}</span>
                <button type="button" class="btn btn--danger btn--tiny remove-item-btn" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            orderItemsList.appendChild(itemDiv);
        });
        document.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const indexToRemove = parseInt(e.currentTarget.dataset.index);
                currentOrderItems.splice(indexToRemove, 1);
                renderOrderItems(currentOrderItems); // Vuelve a renderizar la lista sin el ítem
            });
        });
    };

    const populateTableSelect = (selectedTableId = null) => {
        tableSelect.innerHTML = '';
        const availableTables = allTables.filter(t => t.status === 'available' || t.id === selectedTableId); // Incluir la mesa actual si se está editando
        if (availableTables.length === 0 && !selectedTableId) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No hay mesas disponibles';
            tableSelect.appendChild(option);
            tableSelect.disabled = true;
            submitOrderBtn.disabled = true;
            return;
        }
        tableSelect.disabled = false;
        submitOrderBtn.disabled = false;
        availableTables.forEach(table => {
            const option = document.createElement('option');
            option.value = table.id;
            option.textContent = `Mesa ${table.name} (Cap. ${table.capacity})`;
            if (selectedTableId && table.id === selectedTableId) {
                option.selected = true;
            }
            tableSelect.appendChild(option);
        });
    };

    const populateItemSelect = () => {
        itemSelect.innerHTML = '';
        if (allMenuItems.length === 0) {
            itemSelect.innerHTML = '<option value="">No hay productos en el menú</option>';
            itemSelect.disabled = true;
            confirmAddItemBtn.disabled = true;
            return;
        }
        itemSelect.disabled = false;
        confirmAddItemBtn.disabled = false;
        allMenuItems.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = `${item.name} ($${item.price.toFixed(2)})`;
            itemSelect.appendChild(option);
        });
    };

    // --- Manejadores de Eventos ---

    const showOrderModal = () => {
        orderModal.style.display = 'flex'; // Usar flex para centrar
        document.body.classList.add('modal-open'); // Ocultar scroll del body si es necesario
    };

    const hideOrderModal = () => {
        orderModal.style.display = 'none';
        document.body.classList.remove('modal-open');
        // Limpiar el formulario
        orderForm.reset();
        orderIdInput.value = '';
        currentOrderItems = [];
        renderOrderItems([]);
        addItemSection.style.display = 'none'; // Ocultar sección de añadir artículo
    };

    const handleNewOrderClick = async () => {
        orderModalTitle.textContent = 'Nuevo Pedido';
        submitOrderBtn.textContent = 'Crear Pedido';
        orderForm.reset(); // Limpiar el formulario para un nuevo pedido
        orderIdInput.value = '';
        currentOrderItems = [];
        renderOrderItems([]); // Limpiar ítems del pedido
        addItemSection.style.display = 'none'; // Ocultar sección de añadir artículo

        // Cargar mesas disponibles
        await fetchTables('available'); // Solo mesas disponibles para nuevos pedidos
        populateTableSelect(); // Llenar el select con mesas disponibles
        
        // Cargar menú para el selector de ítems
        await fetchMenuItems();
        populateItemSelect();

        showOrderModal();
    };

    const handleOpenOrderClick = async (tableId) => {
        orderModalTitle.textContent = `Nuevo Pedido para Mesa ${tableId}`;
        submitOrderBtn.textContent = 'Crear Pedido';
        orderForm.reset();
        orderIdInput.value = '';
        currentOrderItems = [];
        renderOrderItems([]);
        addItemSection.style.display = 'none';

        await fetchTables('available'); 
        populateTableSelect(tableId); // Selecciona la mesa directamente

        await fetchMenuItems();
        populateItemSelect();

        showOrderModal();
    };

    const handleViewOrderClick = async (orderId) => {
        orderModalTitle.textContent = `Detalles del Pedido #${orderId}`;
        submitOrderBtn.textContent = 'Guardar Cambios'; // Para edición
        orderIdInput.value = orderId; // Establecer el ID del pedido para edición

        try {
            const order = await fetchOrderById(orderId);
            orderNotesInput.value = order.notes;
            currentOrderItems = order.items.map(item => ({ 
                productId: item.productId, 
                name: allMenuItems.find(menuItem => menuItem.id === item.productId)?.name || item.name, 
                quantity: item.quantity 
            }));
            renderOrderItems(currentOrderItems);

            await fetchTables(); // Obtener todas las mesas para el select
            populateTableSelect(order.tableId); // Seleccionar la mesa del pedido

            await fetchMenuItems();
            populateItemSelect();

            showOrderModal();
            // Deshabilitar la selección de mesa si el pedido ya está en curso y la mesa está ocupada
            if (order.status !== 'pending') { // Solo permitir cambiar mesa si el pedido está pendiente
                 tableSelect.disabled = true;
            }

        } catch (error) {
            console.error("Error al ver pedido:", error);
            if (showAlert) showAlert('Error al cargar los detalles del pedido.', 'error');
            hideOrderModal();
        }
    };

    const handleSubmitOrderForm = async (event) => {
        event.preventDefault();

        const orderId = orderIdInput.value;
        const tableId = tableSelect.value;
        const notes = orderNotesInput.value;

        if (!tableId || currentOrderItems.length === 0) {
            if (showAlert) showAlert('Por favor, selecciona una mesa y añade al menos un artículo al pedido.', 'warning');
            return;
        }

        const orderData = {
            tableId: parseInt(tableId),
            notes: notes,
            items: currentOrderItems.map(item => ({ productId: item.productId, quantity: item.quantity })),
        };

        try {
            if (orderId) {
                // Editar pedido existente
                await updateOrder(orderId, orderData);
                if (showAlert) showAlert('Pedido actualizado exitosamente.', 'success');
            } else {
                // Crear nuevo pedido
                const result = await createOrder(orderData);
                if (showAlert) showAlert(result.message, 'success');
                // Marcar mesa como ocupada si era un nuevo pedido
                await updateTableStatus(parseInt(tableId), 'occupied');
            }
            hideOrderModal();
            loadTables(); // Recargar la lista de mesas
        } catch (error) {
            console.error('Error al guardar pedido:', error);
            if (showAlert) showAlert(error.message || 'Error al guardar el pedido. Inténtalo de nuevo.', 'error');
        }
    };

    const handleAddItemToOrder = () => {
        addItemSection.style.display = 'block';
        itemSelect.value = allMenuItems.length > 0 ? allMenuItems[0].id : ''; // Seleccionar el primer item por defecto
        itemQuantityInput.value = 1;
    };

    const handleConfirmAddItem = () => {
        const selectedItemId = itemSelect.value;
        const selectedItemQuantity = parseInt(itemQuantityInput.value);

        if (!selectedItemId || selectedItemQuantity <= 0) {
            if (showAlert) showAlert('Por favor, selecciona un producto y una cantidad válida.', 'warning');
            return;
        }

        const product = allMenuItems.find(item => item.id === selectedItemId);
        if (product) {
            // Verificar si el producto ya está en el pedido y actualizar cantidad
            const existingItemIndex = currentOrderItems.findIndex(item => item.productId === selectedItemId);
            if (existingItemIndex > -1) {
                currentOrderItems[existingItemIndex].quantity += selectedItemQuantity;
            } else {
                currentOrderItems.push({ 
                    productId: selectedItemId, 
                    name: product.name, 
                    quantity: selectedItemQuantity 
                });
            }
            renderOrderItems(currentOrderItems);
            addItemSection.style.display = 'none'; // Ocultar la sección de añadir artículo
        } else {
            if (showAlert) showAlert('Producto no encontrado en el menú.', 'error');
        }
    };

    const handleCancelAddItem = () => {
        addItemSection.style.display = 'none';
    };

    const handleCloseTable = async (tableId) => {
        if (!confirm(`¿Está seguro de que desea cerrar la Mesa ${tableId}? Esto marcará la mesa como 'necesita limpieza'.`)) {
            return;
        }
        try {
            await updateTableStatus(tableId, 'needs_cleaning');
            if (showAlert) showAlert(`Mesa ${tableId} marcada para limpieza.`, 'success');
            loadTables();
        } catch (error) {
            console.error('Error al cerrar mesa:', error);
            if (showAlert) showAlert('Error al cerrar la mesa.', 'error');
        }
    };

    const handleCleanTable = async (tableId) => {
        if (!confirm(`¿Confirma que la Mesa ${tableId} ya está limpia y disponible?`)) {
            return;
        }
        try {
            await updateTableStatus(tableId, 'available');
            if (showAlert) showAlert(`Mesa ${tableId} marcada como disponible.`, 'success');
            loadTables();
        } catch (error) {
            console.error('Error al marcar mesa limpia:', error);
            if (showAlert) showAlert('Error al marcar la mesa como limpia.', 'error');
        }
    };

    // Función para adjuntar event listeners a los botones de mesa dinámicos
    const attachTableButtonListeners = () => {
        document.querySelectorAll('.open-order-btn').forEach(button => {
            button.addEventListener('click', (e) => handleOpenOrderClick(parseInt(e.currentTarget.dataset.tableId)));
        });
        document.querySelectorAll('.view-order-btn').forEach(button => {
            button.addEventListener('click', (e) => handleViewOrderClick(e.currentTarget.dataset.orderId));
        });
        document.querySelectorAll('.close-table-btn').forEach(button => {
            button.addEventListener('click', (e) => handleCloseTable(parseInt(e.currentTarget.dataset.tableId)));
        });
        document.querySelectorAll('.clean-table-btn').forEach(button => {
            button.addEventListener('click', (e) => handleCleanTable(parseInt(e.currentTarget.dataset.tableId)));
        });
    };

    // --- Carga principal de Mesas y Menú ---
    const loadTables = async () => {
        if (!tablesGrid) return;
        tablesGrid.innerHTML = '<div class="loading-message">Cargando mesas...</div>';
        try {
            const tables = await fetchTables(currentTableFilter);
            renderTables(tables);
        } catch (error) {
            console.error("Error al cargar mesas:", error);
            tablesGrid.innerHTML = '<div class="error-message">Error al cargar mesas.</div>';
            if (showAlert) showAlert('Error al cargar el estado de las mesas.', 'error');
        }
    };

    const loadMenu = async () => {
        try {
            allMenuItems = await fetchMenuItems();
        } catch (error) {
            console.error("Error al cargar menú:", error);
            if (showAlert) showAlert('Error al cargar el menú de productos.', 'error');
        }
    };

    // --- Inicialización de Event Listeners Globales ---
    if (newOrderBtn) newOrderBtn.addEventListener('click', handleNewOrderClick);
    if (refreshTablesBtn) refreshTablesBtn.addEventListener('click', loadTables);

    // Eventos del Modal
    if (closeOrderModalBtn) closeOrderModalBtn.addEventListener('click', hideOrderModal);
    if (cancelOrderModalBtn) cancelOrderModalBtn.addEventListener('click', hideOrderModal);
    if (orderModal) { // Cerrar modal al hacer clic fuera de él
        orderModal.addEventListener('click', (e) => {
            if (e.target === orderModal) {
                hideOrderModal();
            }
        });
    }

    if (orderForm) orderForm.addEventListener('submit', handleSubmitOrderForm);
    if (addItemBtn) addItemBtn.addEventListener('click', handleAddItemToOrder);
    if (confirmAddItemBtn) confirmAddItemBtn.addEventListener('click', handleConfirmAddItem);
    if (cancelAddItemBtn) cancelAddItemBtn.addEventListener('click', handleCancelAddItem);

    // Eventos del Dropdown de Filtro de Mesas
    if (tableFilterToggle) {
        tableFilterToggle.addEventListener('click', () => {
            tableFilterMenu.classList.toggle('show');
        });
    }
    if (tableFilterMenu) {
        tableFilterMenu.querySelectorAll('.dropdown__item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                currentTableFilter = e.currentTarget.dataset.status;
                currentFilterText.textContent = e.currentTarget.textContent.replace(' las Mesas', ''); // Actualizar texto del botón
                tableFilterMenu.classList.remove('show');
                loadTables();
            });
        });
    }

    // Cerrar dropdown si se hace clic fuera
    document.addEventListener('click', (e) => {
        if (tableFilterToggle && !tableFilterToggle.contains(e.target) && tableFilterMenu && !tableFilterMenu.contains(e.target)) {
            tableFilterMenu.classList.remove('show');
        }
    });

    // --- Carga inicial de datos al cargar el controlador ---
    loadMenu();
    loadTables();
};