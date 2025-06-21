// src/views/admin/menu/menuController.js

import { showAlert } from '../../../helpers/alerts.js';
import { showConfirmModal } from '../../../helpers/modalHelper.js';

export const menuController = () => {
    console.log("Menu Management Controller Initialized.");

    // --- Referencias al DOM ---
    const addMenuItemBtn = document.getElementById('add-menu-item-btn');
    const menuItemFormSection = document.getElementById('menu-item-form-section');
    const menuItemForm = document.getElementById('menu-item-form');
    const menuItemsTable = document.getElementById('menu-items-table');
    const menuPaginationContainer = document.getElementById('menu-items-pagination');
    const categoriesTable = document.getElementById('categories-table');
    const tablesTable = document.getElementById('tables-table');
    const addCategoryForm = document.getElementById('add-category-form');
    const addTableForm = document.getElementById('add-table-form');
    const itemCategorySelect = document.getElementById('item-category');

    // --- Estado ---
    let FAKE_MENU_DB = Array.from({ length: 25 }, (_, i) => ({ id: 101 + i, name: `Plato de Ejemplo ${i + 1}`, description: 'Descripción del plato.', price: (10 + i * 0.5), category: ['sushi', 'burrito', 'entradas', 'bebidas', 'postres'][i % 5] }));
    let FAKE_CATEGORIES_DB = [ { id: 'cat1', name: 'sushi' }, { id: 'cat2', name: 'burrito' }, { id: 'cat3', name: 'entradas' }, { id: 'cat4', name: 'bebidas' }, { id: 'cat5', name: 'postres' } ];
    let FAKE_TABLES_DB = Array.from({ length: 12 }, (_, i) => ({ id: `t${i+1}`, name: `Mesa ${i+1}` }));
    
    let menuCurrentPage = 1;
    const menuItemsPerPage = 8;
    
    // Objeto para almacenar colores de categorías dinámicas
    const categoryColorMap = {};
    const predefinedCategories = ['sushi', 'burrito', 'entradas', 'bebidas', 'postres'];

    // --- Lógica General ---
    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    const getCategoryStyle = (category) => {
        // Si es una categoría predefinida, usa la clase CSS
        if (predefinedCategories.includes(category)) {
            return `class="category-badge category-${category}"`;
        }
        // Si no, asigna un color aleatorio (o usa uno ya asignado)
        if (!categoryColorMap[category]) {
            categoryColorMap[category] = getRandomColor();
        }
        return `class="category-badge" style="background-color: ${categoryColorMap[category]}"`;
    };

    const showItemForm = (isEditing = false, item = {}) => {
        menuItemFormSection.style.display = 'block';
        const titleElement = document.getElementById('form-title');
        if (titleElement) {
            titleElement.textContent = isEditing ? 'Editar Plato/Bebida Existente' : 'Añadir Nuevo Plato/Bebida';
        }
        menuItemForm.querySelector('#menu-item-id').value = item.id || '';
        menuItemForm.querySelector('#item-name').value = item.name || '';
        menuItemForm.querySelector('#item-description').value = item.description || '';
        menuItemForm.querySelector('#item-price').value = item.price || '';
        menuItemForm.querySelector('#item-category').value = item.category || '';
    };
    const hideItemForm = () => { menuItemFormSection.style.display = 'none'; };

    // --- Renderizado ---
    const renderMenuItems = () => {
        const startIndex = (menuCurrentPage - 1) * menuItemsPerPage;
        const pageItems = FAKE_MENU_DB.slice(startIndex, startIndex + menuItemsPerPage);

        menuItemsTable.innerHTML = `
            <thead>
                <tr><th>Nombre</th><th>Descripción</th><th>Precio</th><th>Categoría</th><th>Acciones</th></tr>
            </thead>
            <tbody>
                ${pageItems.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.description}</td>
                        <td>$${item.price.toFixed(2)}</td>
                        <td><span ${getCategoryStyle(item.category)}>${item.category}</span></td>
                        <td class="table-actions">
                            <button class="btn btn--info btn--small edit-btn" data-id="${item.id}">Editar</button>
                            <button class="btn btn--danger btn--small delete-btn" data-id="${item.id}" data-name="${item.name}">Eliminar</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>`;
        
        renderMenuPagination();
        menuItemsTable.querySelectorAll('.edit-btn').forEach(btn => btn.onclick = (e) => handleEditClick(e.currentTarget.dataset.id));
        menuItemsTable.querySelectorAll('.delete-btn').forEach(btn => btn.onclick = (e) => handleDeleteMenuItem(e.currentTarget.dataset.id, e.currentTarget.dataset.name));
    };
    
    const renderMenuPagination = () => {
        const totalPages = Math.ceil(FAKE_MENU_DB.length / menuItemsPerPage);
        if (totalPages <= 1) {
            menuPaginationContainer.innerHTML = '';
            return;
        }
        let buttons = '';
        for (let i = 1; i <= totalPages; i++) {
            buttons += `<li><button class="pagination-btn ${i === menuCurrentPage ? 'active' : ''}" data-page="${i}">${i}</button></li>`;
        }
        menuPaginationContainer.innerHTML = `<ul>${buttons}</ul>`;
        
        menuPaginationContainer.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.onclick = () => {
                menuCurrentPage = parseInt(btn.dataset.page);
                renderMenuItems();
            };
        });
    };

    const renderCategories = () => {
        categoriesTable.innerHTML = `
            <thead><tr><th>Nombre de Categoría</th><th>Acción</th></tr></thead>
            <tbody>
                ${FAKE_CATEGORIES_DB.map(cat => `
                    <tr>
                        <td><span ${getCategoryStyle(cat.name)}>${cat.name}</span></td>
                        <td class="table-actions"><button class="btn btn--danger btn--small delete-category-btn" data-id="${cat.id}" data-name="${cat.name}">Eliminar</button></td>
                    </tr>`).join('')}
            </tbody>`;
        categoriesTable.querySelectorAll('.delete-category-btn').forEach(btn => btn.onclick = (e) => handleDeleteCategory(e.currentTarget.dataset.id, e.currentTarget.dataset.name));
        itemCategorySelect.innerHTML = FAKE_CATEGORIES_DB.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    };

    const renderTables = () => {
        tablesTable.innerHTML = `
            <thead><tr><th>Nombre de Mesa</th><th>Acción</th></tr></thead>
            <tbody>
                ${FAKE_TABLES_DB.map(table => `
                    <tr>
                        <td>${table.name}</td>
                        <td class="table-actions"><button class="btn btn--danger btn--small delete-table-btn" data-id="${table.id}" data-name="${table.name}">Eliminar</button></td>
                    </tr>`).join('')}
            </tbody>`;
        tablesTable.querySelectorAll('.delete-table-btn').forEach(btn => btn.onclick = (e) => handleDeleteTable(e.currentTarget.dataset.id, e.currentTarget.dataset.name));
    };

    // --- Manejadores de Eventos ---
    const handleSaveMenuItem = async (e) => {
        e.preventDefault();
        const id = menuItemForm.querySelector('#menu-item-id').value;
        const itemData = { name: menuItemForm.querySelector('#item-name').value, description: menuItemForm.querySelector('#item-description').value, price: parseFloat(menuItemForm.querySelector('#item-price').value), category: menuItemForm.querySelector('#item-category').value, };
        
        try {
            await showConfirmModal('Confirmar Cambios', `¿Está seguro de que desea guardar estos cambios?`);
            if (id) {
                const index = FAKE_MENU_DB.findIndex(item => item.id == id);
                if (index !== -1) FAKE_MENU_DB[index] = { ...FAKE_MENU_DB[index], ...itemData };
                showAlert('Ítem actualizado exitosamente.', 'success');
            } else {
                const newId = Math.max(...FAKE_MENU_DB.map(item => item.id || 0)) + 1;
                FAKE_MENU_DB.push({ id: newId, ...itemData });
                showAlert('Ítem creado exitosamente.', 'success');
            }
            hideItemForm();
            renderMenuItems();
        } catch { console.log("Guardado cancelado."); }
    };
    
    const handleEditClick = (itemId) => {
        const item = FAKE_MENU_DB.find(i => i.id == itemId);
        if(item) showItemForm(true, item);
    };

    const handleDeleteMenuItem = async (itemId, itemName) => {
        try {
            await showConfirmModal('Confirmar Eliminación', `¿Está seguro que desea eliminar <strong>${itemName}</strong>?`);
            FAKE_MENU_DB = FAKE_MENU_DB.filter(item => item.id != itemId);
            renderMenuItems();
            showAlert('Ítem eliminado exitosamente.', 'success');
        } catch { console.log('Eliminación de ítem cancelada.'); }
    };

    const handleAddCategory = (e) => {
        e.preventDefault();
        const input = document.getElementById('new-category-name');
        const newCategoryName = input.value.trim().toLowerCase();
        if (newCategoryName && !FAKE_CATEGORIES_DB.find(c => c.name === newCategoryName)) {
            FAKE_CATEGORIES_DB.push({ id: `cat${Date.now()}`, name: newCategoryName });
            renderCategories();
            input.value = '';
            showAlert(`Categoría "${newCategoryName}" añadida.`, 'success');
        } else {
            showAlert('La categoría no puede estar vacía o ya existe.', 'warning');
        }
    };
    const handleDeleteCategory = async (id, name) => {
        try {
            await showConfirmModal('Confirmar Eliminación', `¿Seguro que quieres eliminar la categoría <strong>${name}</strong>?`);
            FAKE_CATEGORIES_DB = FAKE_CATEGORIES_DB.filter(cat => cat.id !== id);
            renderCategories();
            showAlert(`Categoría "${name}" eliminada.`, 'success');
        } catch {}
    };

    const handleAddTable = (e) => {
        e.preventDefault();
        const input = document.getElementById('table-name');
        const newTableName = input.value.trim();
        if (newTableName) {
            FAKE_TABLES_DB.push({ id: `t${Date.now()}`, name: newTableName });
            renderTables();
            input.value = '';
            showAlert(`Mesa "${newTableName}" añadida.`, 'success');
        }
    };
    const handleDeleteTable = async (id, name) => {
        try {
            await showConfirmModal('Confirmar Eliminación', `¿Seguro que quieres eliminar la <strong>${name}</strong>?`);
            FAKE_TABLES_DB = FAKE_TABLES_DB.filter(table => table.id !== id);
            renderTables();
            showAlert(`Mesa "${name}" eliminada.`, 'success');
        } catch {}
    };
    
    // --- Inicialización ---
    addMenuItemBtn.addEventListener('click', () => showItemForm(false));
    menuItemForm.addEventListener('submit', handleSaveMenuItem);
    document.getElementById('cancel-menu-item-form-btn').onclick = hideItemForm;
    addCategoryForm.addEventListener('submit', handleAddCategory);
    addTableForm.addEventListener('submit', handleAddTable);
    
    renderMenuItems();
    renderCategories();
    renderTables();
};
