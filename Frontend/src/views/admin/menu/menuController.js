// src/views/admin/menu/menuController.js

import { showAlert } from '../../../helpers/alerts.js';
import { showConfirmModal } from '../../../helpers/modalHelper.js';

const API_URL = 'http://localhost:3000/api';

// --- API Service Helper ---
const apiService = {
    getAuthHeaders: () => ({ 'Content-Type': 'application/json', 'x-access-token': localStorage.getItem('accessToken') }),
    get: async (endpoint) => {
        const response = await fetch(`${API_URL}/${endpoint}`, { headers: { 'Content-Type': 'application/json' } }); 
        if (!response.ok) throw new Error((await response.json()).message);
        return response.json();
    },
    post: async (endpoint, data) => {
        const response = await fetch(`${API_URL}/${endpoint}`, { method: 'POST', headers: apiService.getAuthHeaders(), body: JSON.stringify(data) });
        if (!response.ok) throw new Error((await response.json()).message);
        return response.json();
    },
    put: async (endpoint, data) => {
        const response = await fetch(`${API_URL}/${endpoint}`, { method: 'PUT', headers: apiService.getAuthHeaders(), body: JSON.stringify(data) });
        if (!response.ok) throw new Error((await response.json()).message);
        return response.json();
    },
    delete: async (endpoint) => {
        const response = await fetch(`${API_URL}/${endpoint}`, { method: 'DELETE', headers: apiService.getAuthHeaders() });
        if (!response.ok) throw new Error((await response.json()).message);
        return response.json();
    }
};

export const menuController = () => {
    console.log("Menu Management Controller Initialized.");

    // --- Referencias al DOM ---
    const menuItemFormSection = document.getElementById('menu-item-form-section');
    const menuItemForm = document.getElementById('menu-item-form');
    const menuItemsTable = document.getElementById('menu-items-table');
    const menuPaginationContainer = document.getElementById('menu-items-pagination');
    const categoriesTable = document.getElementById('categories-table');
    const tablesTable = document.getElementById('tables-table');
    const itemCategorySelect = document.getElementById('item-category');

    // --- Estado ---
    let allMenuItems = [], allCategories = [], allTables = [];
    let menuCurrentPage = 1;
    const menuItemsPerPage = 8;
    const categoryColorMap = {};
    const predefinedCategories = ['sushi', 'burrito', 'entradas', 'bebidas', 'postres'];

    // --- Lógica General ---
    const getCategoryStyle = (categoryName) => {
        if (predefinedCategories.includes(categoryName)) return `class="category-badge category-${categoryName}"`;
        if (!categoryColorMap[categoryName]) categoryColorMap[categoryName] = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
        return `class="category-badge" style="background-color: ${categoryColorMap[categoryName]}"`;
    };

    const showItemForm = (isEditing = false, item = {}) => {
        menuItemFormSection.style.display = 'block';
        menuItemForm.querySelector('#form-title').textContent = isEditing ? 'Editar Plato/Bebida' : 'Añadir Nuevo Plato';
        menuItemForm.querySelector('#menu-item-id').value = item.producto_id || '';
        menuItemForm.querySelector('#item-name').value = item.nombre_producto || '';
        menuItemForm.querySelector('#item-description').value = item.descripcion_ingredientes || '';
        menuItemForm.querySelector('#item-price').value = item.valor_neto || '';
        itemCategorySelect.value = item.categoria_id || '';
    };
    const hideItemForm = () => { menuItemFormSection.style.display = 'none'; };

    // --- Renderizado ---
    const renderAll = () => {
        renderMenuItems();
        renderCategories();
        renderTables();
    };

    const renderMenuItems = () => {
        const startIndex = (menuCurrentPage - 1) * menuItemsPerPage;
        const pageItems = allMenuItems.slice(startIndex, startIndex + menuItemsPerPage);
        menuItemsTable.innerHTML = `
            <thead><tr><th>Nombre</th><th>Descripción</th><th>Precio</th><th>Categoría</th><th>Acciones</th></tr></thead>
            <tbody>
                ${pageItems.map(item => `
                    <tr>
                        <td>${item.nombre_producto}</td>
                        <td>${item.descripcion_ingredientes}</td>
                        <td>$${parseFloat(item.valor_neto).toFixed(2)}</td>
                        <td><span ${getCategoryStyle(item.Categoria.nombre)}>${item.Categoria.nombre}</span></td>
                        <td class="table-actions">
                            <button class="btn btn--info btn--small edit-btn" data-id="${item.producto_id}">Editar</button>
                            <button class="btn btn--danger btn--small delete-btn" data-id="${item.producto_id}" data-name="${item.nombre_producto}">Eliminar</button>
                        </td>
                    </tr>`).join('')}
            </tbody>`;
        renderMenuPagination();
        menuItemsTable.querySelectorAll('.edit-btn').forEach(btn => btn.onclick = () => handleEditClick(btn.dataset.id, 'productos'));
        menuItemsTable.querySelectorAll('.delete-btn').forEach(btn => btn.onclick = () => handleDeleteClick(btn.dataset.id, btn.dataset.name, 'productos'));
    };

    const renderMenuPagination = () => {
        const totalPages = Math.ceil(allMenuItems.length / menuItemsPerPage);
        if (totalPages <= 1) { menuPaginationContainer.innerHTML = ''; return; }
        let buttons = '';
        for (let i = 1; i <= totalPages; i++) {
            buttons += `<li><button class="pagination-btn ${i === menuCurrentPage ? 'active' : ''}" data-page="${i}">${i}</button></li>`;
        }
        menuPaginationContainer.innerHTML = `<ul>${buttons}</ul>`;
        menuPaginationContainer.querySelectorAll('.pagination-btn').forEach(btn => btn.onclick = () => { menuCurrentPage = parseInt(btn.dataset.page); renderMenuItems(); });
    };

    const renderCategories = () => {
        categoriesTable.innerHTML = `
            <thead><tr><th>Nombre</th><th>Acción</th></tr></thead>
            <tbody>
                ${allCategories.map(cat => `
                    <tr>
                        <td><span ${getCategoryStyle(cat.nombre)}>${cat.nombre}</span></td>
                        <td class="table-actions"><button class="btn btn--danger btn--small delete-btn" data-id="${cat.categoria_id}" data-name="${cat.nombre}">Eliminar</button></td>
                    </tr>`).join('')}
            </tbody>`;
        categoriesTable.querySelectorAll('.delete-btn').forEach(btn => btn.onclick = () => handleDeleteClick(btn.dataset.id, btn.dataset.name, 'categorias'));
        itemCategorySelect.innerHTML = `<option value="" disabled selected>Seleccione...</option>` + allCategories.map(c => `<option value="${c.categoria_id}">${c.nombre}</option>`).join('');
    };

    const renderTables = () => {
        tablesTable.innerHTML = `
            <thead><tr><th>Número de Mesa</th><th>Estado</th><th>Acción</th></tr></thead>
            <tbody>
                ${allTables.map(table => `
                    <tr>
                        <td>${table.numero_mesa}</td>
                        <td>${table.estado}</td>
                        <td class="table-actions"><button class="btn btn--danger btn--small delete-btn" data-id="${table.mesa_id}" data-name="Mesa ${table.numero_mesa}">Eliminar</button></td>
                    </tr>`).join('')}
            </tbody>`;
        tablesTable.querySelectorAll('.delete-btn').forEach(btn => btn.onclick = () => handleDeleteClick(btn.dataset.id, btn.dataset.name, 'mesas'));
    };

    // --- Carga de Datos ---
    const loadAllData = async () => {
        try {
            const [menuData, categoryData, tableData] = await Promise.all([apiService.get('productos'), apiService.get('categorias'), apiService.get('mesas')]);
            allMenuItems = menuData;
            allCategories = categoryData;
            allTables = tableData;
            renderAll();
        } catch (error) { showAlert(error.message, 'error'); }
    };

    // --- Manejadores de Eventos ---
    const handleSaveMenuItem = async (e) => {
        e.preventDefault();
        const id = document.getElementById('menu-item-id').value;
        const itemData = {
            nombre_producto: document.getElementById('item-name').value,
            descripcion_ingredientes: document.getElementById('item-description').value,
            valor_neto: parseFloat(document.getElementById('item-price').value),
            categoria_id: parseInt(document.getElementById('item-category').value)
        };
        try {
            await showConfirmModal('Confirmar Cambios', `¿Guardar estos cambios?`);
            if (id) {
                await apiService.put(`productos/${id}`, itemData);
                showAlert('Ítem actualizado.', 'success');
            } else {
                await apiService.post('productos', itemData);
                showAlert('Ítem creado.', 'success');
            }
            hideItemForm();
            loadAllData();
        } catch {}
    };

    const handleEditClick = async (id, type) => {
        try {
            const item = await apiService.get(`${type}/${id}`);
            if(type === 'productos') showItemForm(true, item);
        } catch (error) { showAlert(error.message, 'error'); }
    };
    
    const handleDeleteClick = async (id, name, type) => {
        try {
            await showConfirmModal('Confirmar Eliminación', `¿Seguro que desea eliminar <strong>${name}</strong>?`);
            await apiService.delete(`${type}/${id}`);
            showAlert(`${name} eliminado exitosamente.`, 'success');
            loadAllData();
        } catch (error) { if (error) showAlert(error.message, 'error'); }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('new-category-name');
        try {
            await apiService.post('categorias', { nombre: nameInput.value });
            showAlert('Categoría creada.', 'success');
            nameInput.value = '';
            loadAllData();
        } catch (error) { showAlert(error.message, 'error'); }
    };

    const handleAddTable = async (e) => {
        e.preventDefault();
        const numInput = document.getElementById('table-number');
        try {
            await apiService.post('mesas', { numero_mesa: parseInt(numInput.value), estado: 'disponible' });
            showAlert('Mesa creada.', 'success');
            numInput.value = '';
            loadAllData();
        } catch (error) { showAlert(error.message, 'error'); }
    };

    // --- Inicialización ---
    document.getElementById('add-menu-item-btn').onclick = () => showItemForm();
    document.getElementById('cancel-menu-item-form-btn').onclick = hideItemForm;
    menuItemForm.addEventListener('submit', handleSaveMenuItem);
    addCategoryForm.addEventListener('submit', handleAddCategory);
    addTableForm.addEventListener('submit', handleAddTable);
    
    loadAllData();
};