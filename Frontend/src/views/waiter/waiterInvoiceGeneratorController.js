// src/views/waiter/waiterInvoiceGeneratorController.js

import { showAlert } from '../../helpers/alerts.js';
import { showConfirmModal } from '../../helpers/modalHelper.js';

export const waiterInvoiceGeneratorController = () => {
    // --- Referencias al DOM ---
    const selectOrder = document.getElementById('select-order-for-invoice'), loadBtn = document.getElementById('load-invoice-details-btn');
    const detailsSection = document.getElementById('invoice-details-section'), tableBody = document.getElementById('invoice-items-table-body');
    const summarySubtotal = document.getElementById('summary-subtotal'), summaryTax = document.getElementById('summary-tax'), tipInput = document.getElementById('tip-amount'), summaryTotal = document.getElementById('summary-total');
    const finalizeBtn = document.getElementById('finalize-invoice-btn'), finalInvoiceSection = document.getElementById('final-invoice-section'), finalInvoiceContent = document.getElementById('final-invoice-content');
    const modifyInvoiceBtn = document.getElementById('modify-invoice-btn'), sendEmailBtn = document.getElementById('send-email-btn');
    const editItemModal = document.getElementById('edit-item-modal'), editItemForm = document.getElementById('edit-item-form'), editItemName = document.getElementById('edit-item-name');
    const editItemQuantity = document.getElementById('edit-item-quantity'), cancelEditBtn = document.getElementById('cancel-edit-btn'), saveEditBtn = document.getElementById('save-edit-btn');
    const sendEmailModal = document.getElementById('send-email-modal'), sendEmailForm = document.getElementById('send-email-form'), emailInput = document.getElementById('email-input'), cancelEmailBtn = document.getElementById('cancel-email-btn');

    // --- Estado ---
    let currentItems = [];

    // --- API Simulada ---
    const fetchOrdersForInvoice = async () => new Promise(r => setTimeout(() => r([ { id: 'ORD123', table: 'Mesa 5', items: [{ id: 'P01', name: 'Sushi Roll', quantity: 2, price: 12.50 }, { id: 'B01', name: 'Coca-Cola', quantity: 1, price: 2.50 }] } ]), 200));
    
    // --- Lógica de Cálculo y Renderizado (ACTUALIZADA) ---
    const calculateAndRenderTotals = (isInitialLoad = false) => {
        const subtotal = currentItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const tax = subtotal * 0.08;
        
        // Si es la carga inicial, calcula la propina sugerida del 8% sobre (subtotal + impuesto)
        if (isInitialLoad) {
            const suggestedTip = (subtotal + tax) * 0.08;
            tipInput.value = suggestedTip.toFixed(2);
        }

        // Obtiene el valor actual de la propina (ya sea el sugerido o el editado por el usuario)
        const tip = parseFloat(tipInput.value) || 0;
        
        // Calcula el total final
        const total = subtotal + tax + tip;
        
        // Actualiza la interfaz
        summarySubtotal.textContent = `$${subtotal.toFixed(2)}`;
        summaryTax.textContent = `$${tax.toFixed(2)}`;
        summaryTotal.textContent = `$${total.toFixed(2)}`;
    };

    const renderTable = () => {
        tableBody.innerHTML = currentItems.map((item, index) => `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>$${(item.price * item.quantity).toFixed(2)}</td>
                <td class="table-actions">
                    <button class="btn btn--info btn--small edit-item-btn" data-index="${index}">Editar</button>
                    <button class="btn btn--danger btn--small delete-item-btn" data-index="${index}" data-name="${item.name}">Eliminar</button>
                </td>
            </tr>
        `).join('');
        
        tableBody.querySelectorAll('.edit-item-btn').forEach(btn => btn.onclick = (e) => handleEditItem(e.currentTarget.dataset.index));
        tableBody.querySelectorAll('.delete-item-btn').forEach(btn => btn.onclick = (e) => handleDeleteItem(e.currentTarget.dataset.index, e.currentTarget.dataset.name));
        
        // Al renderizar la tabla, no se resetea la propina, solo se recalculan los totales
        calculateAndRenderTotals(false); 
    };

    // --- Manejadores de Eventos ---
    const handleLoadOrder = async () => {
        const orderId = selectOrder.value;
        if (!orderId) { showAlert('Por favor, seleccione un pedido.', 'warning'); return; }
        currentItems = [{ id: 'P01', name: 'Sushi Roll', quantity: 2, price: 12.50 }, { id: 'B01', name: 'Coca-Cola', quantity: 1, price: 2.50 }];
        
        renderTable(); // Renderiza la tabla primero
        calculateAndRenderTotals(true); // Luego calcula totales Y la propina por defecto
        
        detailsSection.style.display = 'block';
    };

    const handleEditItem = (index) => {
        const item = currentItems[index];
        editItemForm.querySelector('#edit-item-index').value = index;
        editItemName.textContent = item.name;
        editItemQuantity.value = item.quantity;
        editItemModal.classList.add('is-active');
    };

    const handleSaveEdit = () => {
        const index = editItemForm.querySelector('#edit-item-index').value;
        currentItems[index].quantity = parseInt(editItemQuantity.value, 10);
        renderTable(); // Esto automáticamente recalculará los totales
        editItemModal.classList.remove('is-active');
    };

    const handleDeleteItem = async (index, name) => {
        try {
            await showConfirmModal('Confirmar Eliminación', `¿Está seguro de que desea eliminar <strong>${name}</strong> de la factura?`);
            currentItems.splice(index, 1);
            renderTable(); // Recalcular todo al eliminar un ítem
            showAlert('Artículo eliminado.', 'success');
        } catch { console.log("Eliminación cancelada."); }
    };
    
    const handleFinalizeInvoice = () => {
        detailsSection.style.display = 'none';
        document.getElementById('order-selection-section').style.display = 'none';
        
        const finalTableHTML = `<table class="invoice-table"><thead>${document.getElementById('invoice-items-table').querySelector('thead').innerHTML}</thead><tbody>${tableBody.innerHTML}</tbody></table>`;
        const finalSummaryHTML = `<div class="invoice-summary">${document.querySelector('.invoice-summary-details').outerHTML}</div>`;

        finalInvoiceContent.innerHTML = finalTableHTML + finalSummaryHTML;
        finalInvoiceSection.style.display = 'block';
    };

    const handleModifyInvoice = () => {
        finalInvoiceSection.style.display = 'none';
        document.getElementById('order-selection-section').style.display = 'block';
        detailsSection.style.display = 'block';
    };

    const handleSendEmail = async (e) => {
        e.preventDefault();
        const email = emailInput.value;
        if (email && /^\S+@\S+\.\S+$/.test(email)) {
            sendEmailModal.classList.remove('is-active');
            try {
                await showConfirmModal('Factura Enviada', `La factura ha sido enviada exitosamente a <strong>${email}</strong>.`);
            } catch {}
        } else {
            showAlert('Formato de correo inválido.', 'error');
        }
    };

    // --- Inicialización ---
    const init = async () => {
        const orders = await fetchOrdersForInvoice();
        selectOrder.innerHTML += orders.map(o => `<option value="${o.id}">Pedido #${o.id} - ${o.table}</option>`).join('');
        
        loadBtn.onclick = handleLoadOrder;
        // El listener 'oninput' asegura que los totales se recalculen cada vez que el usuario escribe en el campo de propina
        tipInput.oninput = () => calculateAndRenderTotals(false); 
        finalizeBtn.onclick = handleFinalizeInvoice;
        modifyInvoiceBtn.onclick = handleModifyInvoice;
        sendEmailBtn.onclick = () => sendEmailModal.classList.add('is-active');
        
        cancelEditBtn.onclick = () => editItemModal.classList.remove('is-active');
        editItemModal.querySelector('.modal__close-btn').onclick = () => editItemModal.classList.remove('is-active');
        saveEditBtn.onclick = handleSaveEdit;
        
        cancelEmailBtn.onclick = () => sendEmailModal.classList.remove('is-active');
        sendEmailModal.querySelector('.modal__close-btn').onclick = () => sendEmailModal.classList.remove('is-active');
        sendEmailForm.onsubmit = handleSendEmail;
    };

    init();
};
