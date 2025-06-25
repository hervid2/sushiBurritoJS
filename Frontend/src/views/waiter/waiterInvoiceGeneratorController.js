// =============================================
// ARCHIVO: waiterInvoiceGeneratorController.js 
// =============================================


import { showAlert } from '../../helpers/alerts.js';
import { showConfirmModal } from '../../helpers/modalHelper.js';
import { api } from '../../helpers/solicitudes.js';

export const waiterInvoiceGeneratorController = () => {
    // --- Referencias al DOM ---
    const selectOrder = document.getElementById('select-order-for-invoice'), loadBtn = document.getElementById('load-invoice-details-btn');
    const detailsSection = document.getElementById('invoice-details-section'), tableBody = document.getElementById('invoice-items-table-body');
    const summarySubtotal = document.getElementById('summary-subtotal'), summaryTax = document.getElementById('summary-tax'), tipInput = document.getElementById('tip-amount'), summaryTotal = document.getElementById('summary-total');
    const paymentMethodSelect = document.getElementById('payment-method');
    const finalizeBtn = document.getElementById('finalize-invoice-btn'), finalInvoiceSection = document.getElementById('final-invoice-section'), finalInvoiceContent = document.getElementById('final-invoice-content'), finalInvoiceTitle = document.getElementById('final-invoice-title');
    const modifyInvoiceBtn = document.getElementById('modify-invoice-btn'), sendEmailBtn = document.getElementById('send-email-btn');
    const sendEmailModal = document.getElementById('send-email-modal'), sendEmailForm = document.getElementById('send-email-form'), emailInput = document.getElementById('email-input'), cancelEmailBtn = document.getElementById('cancel-email-btn');
    // Referencias para el modal de edición de artículo
    const editItemModal = document.getElementById('edit-item-modal'), editItemForm = document.getElementById('edit-item-form'), editItemName = document.getElementById('edit-item-name');
    const editItemQuantity = document.getElementById('edit-item-quantity'), cancelEditBtn = document.getElementById('cancel-edit-btn'), saveEditBtn = document.getElementById('save-edit-btn');


    // --- Estado ---
    let currentOrder = null;
    let generatedInvoiceId = null;

    // --- Lógica de Cálculo y Renderizado ---
    const calculateAndRenderTotals = () => {
        if (!currentOrder) return;
        const subtotal = currentOrder.Productos.reduce((acc, item) => acc + (item.valor_neto * item.DetallePedido.cantidad), 0);
        const tax = subtotal * 0.08;
        const tip = parseFloat(tipInput.value) || 0;
        const total = subtotal + tax + tip;
        summarySubtotal.textContent = `$${subtotal.toFixed(2)}`;
        summaryTax.textContent = `$${tax.toFixed(2)}`;
        summaryTotal.textContent = `$${total.toFixed(2)}`;
    };

    const renderTable = () => {
        tableBody.innerHTML = currentOrder.Productos.map((item, index) => `
            <tr>
                <td>${item.nombre_producto}</td>
                <td>${item.DetallePedido.cantidad}</td>
                <td>$${parseFloat(item.valor_neto).toFixed(2)}</td>
                <td>$${(item.valor_neto * item.DetallePedido.cantidad).toFixed(2)}</td>
                <td class="table-actions">
                    <button class="btn btn--info btn--small edit-item-btn" data-index="${index}">Editar</button>
                    <button class="btn btn--danger btn--small delete-item-btn" data-index="${index}" data-name="${item.nombre_producto}">Eliminar</button>
                </td>
            </tr>
        `).join('');
        calculateAndRenderTotals();
    };

    // --- Manejadores de Eventos y API ---
    const handleLoadOrder = async () => {
        const orderId = selectOrder.value;
        if (!orderId) { showAlert('Por favor, seleccione un pedido.', 'warning'); return; }
        
        try {
            currentOrder = await api.get(`pedidos/${orderId}`);
            tipInput.value = "0.00";
            renderTable();
            detailsSection.style.display = 'block';
            finalInvoiceSection.style.display = 'none';
        } catch (error) {
            showAlert(error.message, 'error');
        }
    };
    
    const handleEditItem = (index) => {
        const item = currentOrder.Productos[index];
        editItemForm.querySelector('#edit-item-index').value = index;
        editItemName.textContent = item.nombre_producto;
        editItemQuantity.value = item.DetallePedido.cantidad;
        editItemModal.classList.add('is-active');
    };

    const handleSaveEdit = () => {
        const index = editItemForm.querySelector('#edit-item-index').value;
        currentOrder.Productos[index].DetallePedido.cantidad = parseInt(editItemQuantity.value, 10);
        renderTable(); // Recalcular todo
        editItemModal.classList.remove('is-active');
    };

    const handleDeleteItem = async (index, name) => {
        try {
            await showConfirmModal('Confirmar Eliminación', `¿Está seguro de que desea eliminar <strong>${name}</strong> de la factura?`);
            currentOrder.Productos.splice(index, 1);
            renderTable();
            showAlert('Artículo eliminado de la factura.', 'success');
        } catch { 
            console.log("Eliminación de artículo cancelada.");
        }
    };
    
    const handleFinalizeInvoice = async () => {
        if (!currentOrder) return;
        const invoiceData = {
            pedido_id: currentOrder.pedido_id,
            metodo_pago_id: paymentMethodSelect.value,
            propina: parseFloat(tipInput.value) || 0
        };

        try {
            const result = await api.post('facturas', invoiceData);
            generatedInvoiceId = result.factura.factura_id;
            showAlert(result.message, 'success');
            
            // Refrescar la lista de pedidos para que el facturado ya no aparezca
            await init(true);

            detailsSection.style.display = 'none';
            document.getElementById('order-selection-section').style.display = 'block';
            finalInvoiceTitle.textContent = `Factura #${generatedInvoiceId} Generada`;
            const finalTableHTML = `<table class="invoice-table"><thead>${document.getElementById('invoice-items-table').querySelector('thead').innerHTML}</thead><tbody>${tableBody.innerHTML}</tbody></table>`;
            const finalSummaryHTML = `<div class="invoice-summary">${document.querySelector('.invoice-summary-details').outerHTML}</div>`;
            finalInvoiceContent.innerHTML = finalTableHTML + finalSummaryHTML;
            finalInvoiceSection.style.display = 'block';

        } catch (error) {
            showAlert(error.message, 'error');
        }
    };

    const handleModifyInvoice = () => {
        finalInvoiceSection.style.display = 'none';
        detailsSection.style.display = 'block';
    };

    const handleSendEmail = async (e) => {
        e.preventDefault();
        const email = emailInput.value;
        if (email && /^\S+@\S+\.\S+$/.test(email) && generatedInvoiceId) {
            try {
                const response = await api.post(`facturas/${generatedInvoiceId}/send-email`, { email });
                sendEmailModal.classList.remove('is-active');
                showAlert(response.message, 'success');
            } catch (error) {
                showAlert(error.message, 'error');
            }
        } else {
            showAlert('Formato de correo inválido.', 'error');
        }
    };

    // --- Inicialización ---
    const init = async (isRefresh = false) => {
        try {
            if (!isRefresh) {
                // Cargar métodos de pago solo la primera vez
                const paymentMethods = await api.get('metodos-pago');
                paymentMethodSelect.innerHTML = paymentMethods.map(p => `<option value="${p.metodo_pago_id}">${p.nombre_metodo}</option>`).join('');
            }
            // Cargar pedidos listos para facturar
            const orders = await api.get('pedidos?estado=entregado');
            selectOrder.innerHTML = '<option value="">-- Seleccione un pedido --</option>' + 
                orders.map(o => `<option value="${o.pedido_id}">Pedido #${o.pedido_id} - Mesa ${o.Mesa?.numero_mesa || 'N/A'}</option>`).join('');

        } catch (error) {
            showAlert(error.message, 'error');
        }
    };
    
    // Se añade listener para la tabla (delegación de eventos)
    tableBody.addEventListener('click', (e) => {
        const target = e.target;
        if (target.matches('.edit-item-btn')) {
            handleEditItem(target.dataset.index);
        } else if (target.matches('.delete-item-btn')) {
            handleDeleteItem(target.dataset.index, target.dataset.name);
        }
    });

    loadBtn.onclick = handleLoadOrder;
    tipInput.oninput = () => calculateAndRenderTotals();
    finalizeBtn.onclick = handleFinalizeInvoice;
    modifyInvoiceBtn.onclick = handleModifyInvoice;
    sendEmailBtn.onclick = () => sendEmailModal.classList.add('is-active');
    
    // Listeners para el modal de edición
    cancelEditBtn.onclick = () => editItemModal.classList.remove('is-active');
    editItemModal.querySelector('.modal__close-btn').onclick = () => editItemModal.classList.remove('is-active');
    saveEditBtn.onclick = handleSaveEdit;

    // Listeners para el modal de envío de email
    cancelEmailBtn.onclick = () => sendEmailModal.classList.remove('is-active');
    sendEmailModal.querySelector('.modal__close-btn').onclick = () => sendEmailModal.classList.remove('is-active');
    sendEmailForm.onsubmit = handleSendEmail;

    init();
};