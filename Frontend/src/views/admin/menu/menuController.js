// src/views/admin/menu/menuController.js

import { showAlert } from '../../../helpers/alerts.js';
import { showConfirmModal } from '../../../helpers/modalHelper.js';

export const menuController = () => {
    console.log("Menu Management Controller Initialized.");

    // --- Referencias al DOM ---
    const addMenuItemBtn = document.getElementById('add-menu-item-btn');
    const menuItemFormSection = document.getElementById('menu-item-form-section');
    const menuItemForm = document.getElementById('menu-item-form');
    const menuItemIdInput = document.getElementById('menu-item-id');
    const itemNameInput = document.getElementById('item-name');
    const itemDescriptionInput = document.getElementById('item-description');
    const itemPriceInput = document.getElementById('item-price');
    const itemCategorySelect = document.getElementById('item-category');
    const cancelMenuItemFormBtn = document.getElementById('cancel-menu-item-form-btn');
    const menuItemsTable = document.getElementById('menu-items-table');

    // --- Funciones de Utilidad ---
    const showForm = (isEditing = false) => {
        menuItemFormSection.style.display = 'block';

        // Seleccionar los elementos por su ID directamente desde el documento
        const titleElement = document.getElementById('form-title');
        const saveButton = document.getElementById('save-menu-item-btn');

        if (titleElement) {
            titleElement.textContent = isEditing ? 'Actualizar un plato/bebida existente' : 'Añadir Nuevo Plato/Bebida';
        }
        if (saveButton) {
            saveButton.textContent = isEditing ? 'Guardar Cambios' : 'Crear Ítem';
        }

        if (!isEditing) {
            menuItemForm.reset();
            menuItemIdInput.value = '';
        }
    };
    const hideForm = () => {
        menuItemFormSection.style.display = 'none';
        menuItemForm.reset();
        menuItemIdInput.value = '';
    };

    // --- API Simulada  ---
    const FAKE_MENU_DB = [
        { id: 101, name: 'Sushi Roll California', description: 'Aguacate, pepino, kanikama.', price: 12.50, category: 'sushi' },
        { id: 102, name: 'Burrito de Pollo Teriyaki', description: 'Pollo teriyaki, arroz, vegetales frescos.', price: 9.99, category: 'burrito' },
        { id: 103, name: 'Gyoza de Cerdo (6u)', description: 'Empanadillas japonesas fritas.', price: 6.00, category: 'entradas' },
        { id: 104, name: 'Coca-Cola (lata)', description: 'Bebida gaseosa refrescante.', price: 2.00, category: 'bebidas' },
        { id: 105, name: 'Tarta de Matcha', description: 'Postre cremoso de té verde.', price: 4.50, category: 'postres' },
    ];

    const fetchMenuItems = async () => new Promise(r => setTimeout(() => r([...FAKE_MENU_DB]), 300));
    const fetchMenuItemById = async (id) => new Promise(r => setTimeout(() => r(FAKE_MENU_DB.find(item => item.id == id)), 200));
    const updateMenuItem = async (id, data) => new Promise(r => setTimeout(() => {
        const index = FAKE_MENU_DB.findIndex(item => item.id == id);
        if (index !== -1) FAKE_MENU_DB[index] = { ...FAKE_MENU_DB[index], ...data };
        r({ success: true });
    }, 400));
    const createMenuItem = async (data) => new Promise(r => setTimeout(() => {
        const newId = Math.max(...FAKE_MENU_DB.map(item => item.id)) + 1;
        FAKE_MENU_DB.push({ id: newId, ...data });
        r({ success: true });
    }, 400));
    const deleteMenuItemApi = async (id) => new Promise(r => setTimeout(() => {
        const index = FAKE_MENU_DB.findIndex(item => item.id == id);
        if (index !== -1) FAKE_MENU_DB.splice(index, 1);
        r({ success: true });
    }, 300));

    // --- Lógica de Edición y Borrado ---
    const handleEditClick = async (itemId) => {
        const item = await fetchMenuItemById(itemId);
        if (item) {
            menuItemIdInput.value = item.id;
            itemNameInput.value = item.name;
            itemDescriptionInput.value = item.description;
            itemPriceInput.value = item.price;
            itemCategorySelect.value = item.category;
            showForm(true);
        } else {
            showAlert('Ítem del menú no encontrado.', 'error');
        }
    };

    const handleDeleteMenuItem = async (itemId, itemName) => {
        try {
            await showConfirmModal('Confirmar Eliminación', `¿Está seguro de que desea eliminar <strong>${itemName}</strong>?`);
            await deleteMenuItemApi(itemId);
            showAlert('Ítem eliminado exitosamente.', 'success');
            loadMenuItems();
        } catch {
            console.log('Eliminación de ítem cancelada.');
        }
    };
    
    // --- Guardar (Crear o Editar) ---
    const handleSaveMenuItem = async (event) => {
        event.preventDefault();
        const id = menuItemIdInput.value;
        const itemData = {
            name: itemNameInput.value,
            description: itemDescriptionInput.value,
            price: parseFloat(itemPriceInput.value),
            category: itemCategorySelect.value,
        };

        try {
            if (id) {
                await updateMenuItem(id, itemData);
                showAlert('Ítem actualizado exitosamente.', 'success');
            } else {
                await createMenuItem(itemData);
                showAlert('Ítem creado exitosamente.', 'success');
            }
            hideForm();
            loadMenuItems();
        } catch (error) {
            showAlert('Error al guardar el ítem.', 'error');
        }
    };
    
    // --- Renderizado de la Tabla ---
    const loadMenuItems = async () => {
        if (!menuItemsTable) return;
        menuItemsTable.innerHTML = `
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Precio</th>
                    <th>Categoría</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                <tr><td colspan="5" class="loading-message">Cargando...</td></tr>
            </tbody>
        `;
        const tableBody = menuItemsTable.querySelector('tbody');

        try {
            const menuItems = await fetchMenuItems();
            if (menuItems.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No hay ítems en el menú.</td></tr>';
                return;
            }

            tableBody.innerHTML = menuItems.map(item => `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.name}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td><span class="category-badge category-${item.category}">${item.category}</span></td>
                    <td class="table__actions">
                        <button class="btn btn--info btn--small edit-btn" data-id="${item.id}">Editar</button>
                        <button class="btn btn--danger btn--small delete-btn" data-id="${item.id}" data-name="${item.name}">Eliminar</button>
                    </td>
                </tr>
            `).join('');

            menuItemsTable.querySelectorAll('.edit-btn').forEach(btn => btn.onclick = (e) => handleEditClick(e.currentTarget.dataset.id));
            menuItemsTable.querySelectorAll('.delete-btn').forEach(btn => btn.onclick = (e) => handleDeleteMenuItem(e.currentTarget.dataset.id, e.currentTarget.dataset.name));
        } catch (error) {
            tableBody.innerHTML = '<tr><td colspan="5" class="error-message">Error al cargar el menú.</td></tr>';
        }
    };

    // --- Inicialización ---
    addMenuItemBtn.addEventListener('click', () => showForm(false));
    cancelMenuItemFormBtn.addEventListener('click', hideForm);
    menuItemForm.addEventListener('submit', handleSaveMenuItem);
    
    loadMenuItems();
};
