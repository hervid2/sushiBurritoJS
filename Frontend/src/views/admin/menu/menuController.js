// src/views/admin/menu/menuController.js

import { showAlert } from '../../../helpers/alerts.js'; // Asumiendo que este helper es Vanilla JS

export const menuController = (params) => {
    console.log("Menu Management Controller Initialized (Vanilla JS with fetch).", params);

    // --- Referencias a elementos del DOM ---
    const addMenuItemBtn = document.getElementById('add-menu-item-btn');
    const menuItemFormSection = document.getElementById('menu-item-form-section');
    const menuItemForm = document.getElementById('menu-item-form');
    const formTitle = document.getElementById('form-title');
    const menuItemIdInput = document.getElementById('menu-item-id');
    const itemNameInput = document.getElementById('item-name');
    const itemDescriptionInput = document.getElementById('item-description');
    const itemPriceInput = document.getElementById('item-price');
    const itemCategorySelect = document.getElementById('item-category');
    const itemImageInput = document.getElementById('item-image');
    const itemAvailableCheckbox = document.getElementById('item-available');
    const saveMenuItemBtn = document.getElementById('save-menu-item-btn');
    const cancelMenuItemFormBtn = document.getElementById('cancel-menu-item-form-btn');
    const menuItemsTableBody = document.querySelector('#menu-items-table tbody');

    // Modal de confirmación
    const confirmModal = document.getElementById('confirm-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const itemToDeleteNameSpan = document.getElementById('item-to-delete-name');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');

    let itemToDeleteId = null; // Para almacenar el ID del ítem a eliminar

    // --- Funciones de Utilidad ---

    const showForm = (isEditing = false) => {
        menuItemFormSection.style.display = 'block';
        formTitle.textContent = isEditing ? 'Editar Plato/Bebida' : 'Añadir Nuevo Plato/Bebida';
        saveMenuItemBtn.textContent = isEditing ? 'Guardar Cambios' : 'Crear Plato';
        if (!isEditing) {
            menuItemForm.reset(); // Limpia el formulario si es para añadir
            menuItemIdInput.value = '';
            itemAvailableCheckbox.checked = true; // Por defecto, disponible al crear
        }
    };

    const hideForm = () => {
        menuItemFormSection.style.display = 'none';
        menuItemForm.reset();
        menuItemIdInput.value = '';
    };

    const showConfirmModal = (itemName, itemId) => {
        itemToDeleteNameSpan.textContent = itemName;
        itemToDeleteId = itemId;
        confirmModal.style.display = 'block';
    };

    const hideConfirmModal = () => {
        confirmModal.style.display = 'none';
        itemToDeleteId = null;
    };

    // --- Simulación de API con fetch ---

    const fetchMenuItems = async () => {
        // Simulación:
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([
                    { id: 101, name: 'Sushi Roll California', description: 'Aguacate, pepino, kanikama', price: 12.50, category: 'Sushi', image: '/img/sushi-roll.jpg', available: true },
                    { id: 102, name: 'Burrito de Pollo Teriyaki', description: 'Pollo teriyaki, arroz, vegetales', price: 9.99, category: 'Burrito', image: '/img/burrito-pollo.jpg', available: true },
                    { id: 103, name: 'Gyoza de Cerdo (6u)', description: 'Empanadillas japonesas fritas', price: 6.00, category: 'Entradas', image: '/img/gyoza.jpg', available: true },
                    { id: 104, name: 'Coca-Cola (lata)', description: 'Bebida gaseosa', price: 2.00, category: 'Bebidas', image: '/img/coca-cola.jpg', available: true },
                    { id: 105, name: 'Tarta de Matcha', description: 'Postre de té verde', price: 4.50, category: 'Postres', image: '/img/tarta-matcha.jpg', available: false },
                ]);
            }, 300);
        });
        // Real:
        // const response = await fetch('/api/menu');
        // if (!response.ok) throw new Error('Failed to fetch menu items');
        // return await response.json();
    };

    const fetchMenuItemById = async (id) => {
        // Simulación:
        return new Promise(resolve => {
            setTimeout(() => {
                const items = [
                    { id: 101, name: 'Sushi Roll California', description: 'Aguacate, pepino, kanikama', price: 12.50, category: 'sushi', image: '/img/sushi-roll.jpg', available: true },
                    { id: 102, name: 'Burrito de Pollo Teriyaki', description: 'Pollo teriyaki, arroz, vegetales', price: 9.99, category: 'burrito', image: '/img/burrito-pollo.jpg', available: true },
                    { id: 103, name: 'Gyoza de Cerdo (6u)', description: 'Empanadillas japonesas fritas', price: 6.00, category: 'entradas', image: '/img/gyoza.jpg', available: true },
                    { id: 104, name: 'Coca-Cola (lata)', description: 'Bebida gaseosa', price: 2.00, category: 'bebidas', image: '/img/coca-cola.jpg', available: true },
                    { id: 105, name: 'Tarta de Matcha', description: 'Postre de té verde', price: 4.50, category: 'postres', image: '/img/tarta-matcha.jpg', available: false },
                ];
                resolve(items.find(item => item.id == id));
            }, 200);
        });
        // Real:
        // const response = await fetch(`/api/menu/${id}`);
        // if (!response.ok) throw new Error(`Failed to fetch menu item ${id}`);
        // return await response.json();
    };

    const createMenuItem = async (itemData) => {
        // Simulación:
        return new Promise(resolve => {
            setTimeout(() => {
                console.log("Simulating menu item creation:", itemData);
                resolve({ success: true, message: 'Menu item created (simulated)' });
            }, 400);
        });
        // Real:
        // const response = await fetch('/api/menu', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(itemData)
        // });
        // if (!response.ok) throw new Error('Failed to create menu item');
        // return await response.json();
    };

    const updateMenuItem = async (id, itemData) => {
        // Simulación:
        return new Promise(resolve => {
            setTimeout(() => {
                console.log(`Simulating menu item update for ID ${id}:`, itemData);
                resolve({ success: true, message: 'Menu item updated (simulated)' });
            }, 400);
        });
        // Real:
        // const response = await fetch(`/api/menu/${id}`, {
        //     method: 'PUT',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(itemData)
        // });
        // if (!response.ok) throw new Error(`Failed to update menu item ${id}`);
        // return await response.json();
    };

    const deleteMenuItemApi = async (id) => { // Renombrada para no chocar con la función deleteMenuItem
        // Simulación:
        return new Promise(resolve => {
            setTimeout(() => {
                console.log(`Simulating menu item deletion for ID ${id}`);
                resolve({ success: true, message: 'Menu item deleted (simulated)' });
            }, 300);
        });
        // Real:
        // const response = await fetch(`/api/menu/${id}`, {
        //     method: 'DELETE'
        // });
        // if (!response.ok) throw new Error(`Failed to delete menu item ${id}`);
        // return await response.json();
    };

    // --- Carga de Ítems del Menú ---

    const loadMenuItems = async () => {
        menuItemsTableBody.innerHTML = '<tr><td colspan="8" class="loading-message">Cargando ítems del menú...</td></tr>';
        try {
            const menuItems = await fetchMenuItems(); // Usar la función simulada con fetch

            if (menuItems.length === 0) {
                menuItemsTableBody.innerHTML = '<tr><td colspan="8">No hay ítems en el menú.</td></tr>';
                return;
            }

            menuItemsTableBody.innerHTML = menuItems.map(item => `
                <tr>
                    <td>${item.id}</td>
                    <td><img src="${item.image || '/img/placeholder.jpg'}" alt="${item.name}" class="menu-item-thumb"></td>
                    <td>${item.name}</td>
                    <td>${item.description}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>${item.category}</td>
                    <td>${item.available ? 'Sí' : 'No'}</td>
                    <td>
                        <button class="btn btn--info btn--small edit-menu-item-btn" data-id="${item.id}">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn--danger btn--small delete-menu-item-btn" data-id="${item.id}" data-name="${item.name}">
                            <i class="fas fa-trash-alt"></i> Eliminar
                        </button>
                    </td>
                </tr>
            `).join('');

            // Asignar event listeners a los botones generados
            document.querySelectorAll('.edit-menu-item-btn').forEach(button => {
                button.addEventListener('click', (e) => editMenuItem(e.currentTarget.dataset.id));
            });
            document.querySelectorAll('.delete-menu-item-btn').forEach(button => {
                button.addEventListener('click', (e) => 
                    showConfirmModal(e.currentTarget.dataset.name, e.currentTarget.dataset.id)
                );
            });

        } catch (error) {
            console.error("Error al cargar ítems del menú:", error);
            menuItemsTableBody.innerHTML = '<tr><td colspan="8" class="error-message">Error al cargar ítems del menú.</td></tr>';
            if (showAlert) showAlert('Error al cargar ítems del menú.', 'error');
        }
    };

    // --- Añadir/Editar Ítem del Menú ---

    const editMenuItem = async (id) => {
        try {
            const item = await fetchMenuItemById(id); // Usar la función simulada con fetch

            if (item) {
                menuItemIdInput.value = item.id;
                itemNameInput.value = item.name;
                itemDescriptionInput.value = item.description;
                itemPriceInput.value = item.price;
                itemCategorySelect.value = item.category.toLowerCase(); // Asegurarse que el valor coincida con el select
                itemImageInput.value = item.image || '';
                itemAvailableCheckbox.checked = item.available;
                
                showForm(true); // Mostrar el formulario en modo edición
            } else {
                if (showAlert) showAlert(`Ítem de menú con ID ${id} no encontrado.`, 'error');
            }
        } catch (error) {
            console.error(`Error al cargar ítem ${id} para edición:`, error);
            if (showAlert) showAlert(`Error al cargar ítem ${id}.`, 'error');
        }
    };

    const saveMenuItem = async (event) => {
        event.preventDefault(); // Previene la recarga de la página

        const id = menuItemIdInput.value;
        const itemData = {
            name: itemNameInput.value,
            description: itemDescriptionInput.value,
            price: parseFloat(itemPriceInput.value),
            category: itemCategorySelect.value,
            image: itemImageInput.value || null,
            available: itemAvailableCheckbox.checked
        };

        try {
            if (id) {
                await updateMenuItem(id, itemData); // Usar la función simulada con fetch
                if (showAlert) showAlert('Plato/Bebida actualizado exitosamente.', 'success');
            } else {
                await createMenuItem(itemData); // Usar la función simulada con fetch
                if (showAlert) showAlert('Plato/Bebida creado exitosamente.', 'success');
            }
            hideForm();
            loadMenuItems(); // Recargar la lista de ítems del menú
        } catch (error) {
            console.error("Error al guardar ítem del menú:", error);
            if (showAlert) showAlert('Error al guardar ítem del menú.', 'error');
        }
    };

    // --- Eliminar Ítem del Menú ---

    const deleteMenuItem = async () => {
        if (!itemToDeleteId) return;

        try {
            await deleteMenuItemApi(itemToDeleteId); // Usar la función simulada con fetch
            if (showAlert) showAlert('Plato/Bebida eliminado exitosamente.', 'success');
            hideConfirmModal();
            loadMenuItems(); // Recargar la lista de ítems del menú
        } catch (error) {
            console.error(`Error al eliminar ítem ${itemToDeleteId}:`, error);
            if (showAlert) showAlert('Error al eliminar ítem del menú.', 'error');
        }
    };

    // --- Event Listeners ---
    addMenuItemBtn.addEventListener('click', () => showForm(false));
    cancelMenuItemFormBtn.addEventListener('click', hideForm);
    menuItemForm.addEventListener('submit', saveMenuItem);

    // Modal de confirmación
    closeModalBtn.addEventListener('click', hideConfirmModal);
    cancelDeleteBtn.addEventListener('click', hideConfirmModal);
    confirmDeleteBtn.addEventListener('click', deleteMenuItem);

    // Cargar ítems del menú al inicializar el controlador
    loadMenuItems();
};