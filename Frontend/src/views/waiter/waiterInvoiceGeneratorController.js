// src/views/waiter/waiterInvoiceGeneratorController.js
import { showAlert } from '../../helpers/alerts.js';

export const waiterInvoiceGeneratorController = (params) => {
    console.log("Waiter Invoice Generator Controller Initialized.", params);

    // --- Referencias a elementos del DOM ---
    const selectOrderForInvoice = document.getElementById('select-order-for-invoice');
    const loadInvoiceDetailsBtn = document.getElementById('load-invoice-details-btn');
    const invoiceItemsTableBody = document.getElementById('invoice-items-table-body');
    const grandTotalAmount = document.getElementById('grand-total-amount');
    const finalizeInvoiceBtn = document.getElementById('finalize-invoice-btn');
    const paginationContainer = document.getElementById('invoice-pagination');

    // --- Variables de estado ---
    const itemsPerPage = 5; // Ítems de factura por página
    let currentPage = 1;
    let currentOrderItems = []; // Almacena los ítems del pedido seleccionado
    let allOrdersForSelection = []; // Almacena todos los pedidos disponibles para facturar

    // --- Funciones para simular la API de Pedidos y Facturas ---

    // Simula obtener pedidos listos para facturar
    const fetchOrdersForInvoiceSelection = async () => {
        return new Promise(resolve => {
            setTimeout(() => {
                const orders = [
                    { id: 'INV001', table: 'Mesa 1', status: 'ready_to_invoice', items: [
                        { productId: 'P001', description: 'Sushi Roll California (8p)', quantity: 2, unitPrice: 12.50, taxRate: 0.10 },
                        { productId: 'P002', description: 'Gyoza de Cerdo (6u)', quantity: 1, unitPrice: 8.00, taxRate: 0.10 }
                    ]},
                    { id: 'INV002', table: 'Mesa 5', status: 'ready_to_invoice', items: [
                        { productId: 'P003', description: 'Ramen de Cerdo', quantity: 1, unitPrice: 15.00, taxRate: 0.10 },
                        { productId: 'P004', description: 'Agua Mineral', quantity: 2, unitPrice: 2.00, taxRate: 0.10 },
                        { productId: 'P005', description: 'Té Verde Helado', quantity: 1, unitPrice: 3.50, taxRate: 0.10 },
                        { productId: 'P006', description: 'Tempura de Langostinos', quantity: 1, unitPrice: 18.00, taxRate: 0.10 },
                        { productId: 'P007', description: 'Sopa Miso', quantity: 1, unitPrice: 4.00, taxRate: 0.10 },
                        { productId: 'P008', description: 'Nigiri Atún (2p)', quantity: 3, unitPrice: 6.00, taxRate: 0.10 },
                        { productId: 'P009', description: 'Sashimi Salmón (5p)', quantity: 1, unitPrice: 22.00, taxRate: 0.10 }
                    ]},
                    { id: 'INV003', table: 'Mesa 8', status: 'ready_to_invoice', items: [
                        { productId: 'P010', description: 'Curry Vegetariano', quantity: 1, unitPrice: 14.00, taxRate: 0.10 }
                    ]}
                ];
                resolve(orders);
            }, 300);
        });
    };

    // Simula la generación de una factura final
    const finalizeInvoice = async (invoiceData) => {
        return new Promise(resolve => {
            setTimeout(() => {
                console.log("Generando factura:", invoiceData);
                resolve({ success: true, invoiceId: 'FACT' + Date.now(), message: 'Factura generada exitosamente.' });
            }, 700);
        });
    };

    // --- Funciones de Renderizado ---

    const populateOrderSelection = (orders) => {
        if (!selectOrderForInvoice) return;
        selectOrderForInvoice.innerHTML = '<option value="">-- Seleccione un pedido --</option>';
        orders.forEach(order => {
            const option = document.createElement('option');
            option.value = order.id;
            option.textContent = `Pedido #${order.id} - Mesa ${order.table}`;
            selectOrderForInvoice.appendChild(option);
        });
    };

    const calculateItemTotals = (item) => {
        const subtotal = item.quantity * item.unitPrice;
        const tax = subtotal * item.taxRate;
        const total = subtotal + tax;
        return { subtotal, tax, total };
    };

    const renderInvoiceItemsTable = (items) => {
        if (!invoiceItemsTableBody) return;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const itemsToDisplay = items.slice(startIndex, endIndex);

        if (itemsToDisplay.length === 0) {
            invoiceItemsTableBody.innerHTML = '<tr><td colspan="8" class="empty-message">No hay ítems para este pedido.</td></tr>';
            grandTotalAmount.textContent = '0.00';
            return;
        }

        let currentGrandTotal = 0;
        invoiceItemsTableBody.innerHTML = itemsToDisplay.map(item => {
            const { subtotal, tax, total } = calculateItemTotals(item);
            currentGrandTotal += total;
            return `
                <tr>
                    <td>${item.productId}</td>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>${subtotal.toFixed(2)}</td>
                    <td>${tax.toFixed(2)}</td>
                    <td>${total.toFixed(2)}</td>
                    <td>
                        <select class="form-select payment-method-select">
                            <option value="Efectivo">Efectivo</option>
                            <option value="Tarjeta crédito">Tarjeta crédito</option>
                            <option value="Tarjeta débito">Tarjeta débito</option>
                            <option value="Transferencia">Transferencia</option>
                        </select>
                    </td>
                    <td>
                        <button class="btn btn--small btn--danger remove-item-btn" data-product-id="${item.productId}">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        grandTotalAmount.textContent = currentGrandTotal.toFixed(2);
        renderPagination(items.length);
        attachInvoiceItemListeners();
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
            renderInvoiceItemsTable(currentOrderItems);
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
                renderInvoiceItemsTable(currentOrderItems);
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
            renderInvoiceItemsTable(currentOrderItems);
        });
        nextLi.appendChild(nextBtn);
        ul.appendChild(nextLi);

        paginationContainer.appendChild(ul);
    };

    // --- Manejadores de Eventos ---

    const handleLoadInvoiceDetails = () => {
        const selectedOrderId = selectOrderForInvoice.value;
        if (!selectedOrderId) {
            showAlert('Por favor, seleccione un pedido.', 'warning');
            return;
        }
        const selectedOrder = allOrdersForSelection.find(order => order.id === selectedOrderId);
        if (selectedOrder) {
            currentOrderItems = selectedOrder.items;
            currentPage = 1; // Resetear paginación al cargar nuevo pedido
            renderInvoiceItemsTable(currentOrderItems);
        } else {
            invoiceItemsTableBody.innerHTML = '<tr><td colspan="8" class="empty-message">No se encontraron detalles para este pedido.</td></tr>';
            grandTotalAmount.textContent = '0.00';
            currentOrderItems = [];
            paginationContainer.innerHTML = '';
        }
    };

    const handleRemoveItem = (productId) => {
        currentOrderItems = currentOrderItems.filter(item => item.productId !== productId);
        renderInvoiceItemsTable(currentOrderItems);
        showAlert(`Producto ${productId} eliminado del detalle de factura.`, 'info');
    };

    const handleFinalizeInvoice = async () => {
        const selectedOrderId = selectOrderForInvoice.value;
        if (!selectedOrderId) {
            showAlert('Debe seleccionar un pedido para generar la factura.', 'error');
            return;
        }

        if (currentOrderItems.length === 0) {
            showAlert('El pedido no tiene ítems para facturar.', 'warning');
            return;
        }

        const itemsWithPaymentMethods = Array.from(invoiceItemsTableBody.querySelectorAll('tr')).map(row => {
            const productId = row.querySelector('td:first-child').textContent;
            const paymentMethod = row.querySelector('.payment-method-select').value;
            const item = currentOrderItems.find(i => i.productId === productId); // Encuentra el item original para obtener todos sus datos
            if (!item) return null; // Fallback si no se encuentra el ítem (debería ser raro)

            const { subtotal, tax, total } = calculateItemTotals(item);

            return {
                ...item, // Incluye todos los detalles originales del producto
                subtotal: subtotal,
                tax: tax,
                total: total,
                paymentMethod: paymentMethod
            };
        }).filter(item => item !== null);

        const invoiceData = {
            orderId: selectedOrderId,
            items: itemsWithPaymentMethods,
            grandTotal: parseFloat(grandTotalAmount.textContent),
            invoiceDate: new Date().toISOString()
        };

        try {
            showAlert('Generando factura...', 'info');
            const result = await finalizeInvoice(invoiceData);
            if (result.success) {
                showAlert(`Factura ${result.invoiceId} generada exitosamente para el Pedido #${selectedOrderId}.`, 'success');
                // Opcional: Limpiar la vista o redirigir
                selectOrderForInvoice.value = '';
                invoiceItemsTableBody.innerHTML = '<tr><td colspan="8" class="empty-message">Seleccione un pedido para ver sus detalles.</td></tr>';
                grandTotalAmount.textContent = '0.00';
                currentOrderItems = [];
                paginationContainer.innerHTML = '';
                loadInitialData(); // Volver a cargar la lista de pedidos disponibles
            } else {
                showAlert('Error al generar la factura.', 'error');
            }
        } catch (error) {
            console.error("Error al generar factura:", error);
            showAlert('Error al generar la factura.', 'error');
        }
    };

    const attachInvoiceItemListeners = () => {
        document.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', (e) => handleRemoveItem(e.currentTarget.dataset.productId));
        });
        // No hay listeners para 'change' en el select de método de pago por ítem individual,
        // ya que se recopila al generar la factura final.
    };

    const loadInitialData = async () => {
        try {
            allOrdersForSelection = await fetchOrdersForInvoiceSelection();
            populateOrderSelection(allOrdersForSelection);
        } catch (error) {
            console.error("Error al cargar pedidos para selección de factura:", error);
            if (showAlert) showAlert('Error al cargar pedidos para facturación.', 'error');
        }
    };

    // --- Inicialización de Event Listeners Globales ---
    if (loadInvoiceDetailsBtn) {
        loadInvoiceDetailsBtn.addEventListener('click', handleLoadInvoiceDetails);
    }
    if (finalizeInvoiceBtn) {
        finalizeInvoiceBtn.addEventListener('click', handleFinalizeInvoice);
    }

    // --- Carga inicial ---
    loadInitialData();
};