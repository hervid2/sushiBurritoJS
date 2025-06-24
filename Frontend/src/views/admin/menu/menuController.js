// =================================================================
// ARCHIVO: src/views/admin/menu/menuController.js
// DESCRIPCIÓN: Controlador refactorizado para gestionar productos, categorías y mesas.
// =================================================================

import { showAlert } from '../../../helpers/alerts.js';
import { showConfirmModal } from '../../../helpers/modalHelper.js';
import { api } from '../../../helpers/solicitudes.js';

export const menuController = () => {
    // --- Referencias al DOM ---
    const menuItemFormSection = document.getElementById('menu-item-form-section');
    const menuItemForm = document.getElementById('menu-item-form');
    const formTitle = document.getElementById('form-title');
    const menuItemsTableBody = document.querySelector('#menu-items-table tbody');
    const categoriesTableBody = document.querySelector('#categories-table tbody');
    const tablesTableBody = document.querySelector('#tables-table tbody');
    const addCategoryForm = document.getElementById('add-category-form');
    const addTableForm = document.getElementById('add-table-form');
    const itemCategorySelect = document.getElementById('item-category');

    // --- Estado ---
    const categoryColorMap = {}; // Almacena los colores generados para cada categoría
    let categoryNameMap = new Map(); // <-- NUEVO: Almacena ID -> Nombre de la categoría

    // --- Lógica de Colores ---
    const getCategoryStyle = (categoryName) => {
        if (!categoryColorMap[categoryName]) {
            const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
            categoryColorMap[categoryName] = randomColor;
        }
        return `style="background-color: ${categoryColorMap[categoryName]}"`;
    };

    // --- Lógica de Renderizado ---
    const renderMenuItems = (items) => {
        menuItemsTableBody.innerHTML = items.map(item => {
            // CAMBIO CLAVE: Usamos el mapa para encontrar el nombre de la categoría a partir del ID del producto
            const categoryName = categoryNameMap.get(item.categoria_id) || 'Sin categoría';
            const style = categoryName !== 'Sin categoría' ? getCategoryStyle(categoryName) : 'style="background-color: #6c757d;"';
            
            return `
                <tr>
                    <td>${item.nombre_producto}</td>
                    <td>$${parseFloat(item.valor_neto).toFixed(2)}</td>
                    <td><span class="category-badge" ${style}>${categoryName}</span></td>
                    <td class="table-actions">
                        <button class="btn btn--info btn--small edit-item-btn" data-id="${item.producto_id}">Editar</button>
                        <button class="btn btn--danger btn--small delete-item-btn" data-id="${item.producto_id}" data-name="${item.nombre_producto}">Eliminar</button>
                    </td>
                </tr>`;
        }).join('');
        menuItemsTableBody.querySelectorAll('.edit-item-btn').forEach(btn => btn.addEventListener('click', (e) => handleEditClick(e.currentTarget.dataset.id)));
        menuItemsTableBody.querySelectorAll('.delete-item-btn').forEach(btn => btn.addEventListener('click', (e) => handleDeleteClick(e.currentTarget.dataset.id, e.currentTarget.dataset.name, 'productos')));
    };

    const renderCategories = (categories) => {
        // CAMBIO CLAVE: Llenamos el mapa de nombres de categorías al renderizar
        categoryNameMap = new Map(categories.map(cat => [cat.categoria_id, cat.nombre]));

        categoriesTableBody.innerHTML = categories.map(cat => `
            <tr>
                <td><span class="category-badge" ${getCategoryStyle(cat.nombre)}>${cat.nombre}</span></td>
                <td class="table-actions"><button class="btn btn--danger btn--small delete-category-btn" data-id="${cat.categoria_id}" data-name="${cat.nombre}">Eliminar</button></td>
            </tr>
        `).join('');
        itemCategorySelect.innerHTML = `<option value="" disabled selected>Seleccione...</option>` + categories.map(c => `<option value="${c.categoria_id}">${c.nombre}</option>`).join('');
        categoriesTableBody.querySelectorAll('.delete-category-btn').forEach(btn => btn.addEventListener('click', (e) => handleDeleteClick(e.currentTarget.dataset.id, e.currentTarget.dataset.name, 'categorias')));
    };

    const renderTables = (tables) => {
        tablesTableBody.innerHTML = tables.map(table => `
            <tr>
                <td>${table.numero_mesa}</td>
                <td>${table.estado}</td>
                <td class="table-actions"><button class="btn btn--danger btn--small delete-table-btn" data-id="${table.mesa_id}" data-name="Mesa ${table.numero_mesa}">Eliminar</button></td>
            </tr>
        `).join('');
        tablesTableBody.querySelectorAll('.delete-table-btn').forEach(btn => btn.addEventListener('click', (e) => handleDeleteClick(e.currentTarget.dataset.id, e.currentTarget.dataset.name, 'mesas')));
    };

    // --- Carga de Datos ---
    const loadAllData = async () => {
        try {
            const [menuData, categoryData, tableData] = await Promise.all([api.get('productos'), api.get('categorias'), api.get('mesas')]);
            renderCategories(categoryData);
            renderMenuItems(menuData);
            renderTables(tableData);
        } catch (error) {
            showAlert(error.message, 'error');
        }
    };

    // --- (El resto de las funciones de manejo de eventos permanecen sin cambios) ---
    const handleSaveMenuItem = async (e) => {
        e.preventDefault();
        const id = document.getElementById('menu-item-id').value;
        const itemData = {
            nombre_producto: document.getElementById('item-name').value,
            descripcion_ingredientes: document.getElementById('item-description').value,
            valor_neto: parseFloat(document.getElementById('item-price').value),
            categoria_id: parseInt(itemCategorySelect.value)
        };
        try {
            const endpoint = id ? `productos/${id}` : 'productos';
            const method = id ? 'put' : 'post';
            await api[method](endpoint, itemData);
            showAlert(`Producto ${id ? 'actualizado' : 'creado'} correctamente.`, 'success');
            menuItemFormSection.style.display = 'none';
            loadAllData();
        } catch (error) {
            showAlert(error.message, 'error');
        }
    };

    const handleEditClick = async (id) => {
        try {
            const item = await api.get(`productos/${id}`);
            formTitle.textContent = 'Editar Plato/Bebida';
            document.getElementById('menu-item-id').value = item.producto_id;
            document.getElementById('item-name').value = item.nombre_producto;
            document.getElementById('item-description').value = item.descripcion_ingredientes;
            document.getElementById('item-price').value = item.valor_neto;
            itemCategorySelect.value = item.categoria_id;
            menuItemFormSection.style.display = 'block';
        } catch (error) {
            showAlert(error.message, 'error');
        }
    };
    
    const handleDeleteClick = async (id, name, type) => {
        try {
            await showConfirmModal('Confirmar Eliminación', `¿Seguro que desea eliminar <strong>${name}</strong>?`);
            await api.delete(`${type}/${id}`);
            showAlert(`${name} eliminado exitosamente.`, 'success');
            loadAllData();
        } catch (error) {
            if (error) showAlert(error.message, 'error');
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('new-category-name');
        try {
            await api.post('categorias', { nombre: nameInput.value });
            showAlert('Categoría creada con éxito.', 'success');
            nameInput.value = '';
            loadAllData();
        } catch (error) {
            showAlert(error.message, 'error');
        }
    };

    const handleAddTable = async (e) => {
        e.preventDefault();
        const numInput = document.getElementById('table-number');
        try {
            await api.post('mesas', { numero_mesa: parseInt(numInput.value), estado: 'disponible' });
            showAlert('Mesa creada con éxito.', 'success');
            numInput.value = '';
            loadAllData();
        } catch (error) {
            showAlert(error.message, 'error');
        }
    };

    const init = () => {
        document.getElementById('add-menu-item-btn').addEventListener('click', () => {
            menuItemForm.reset();
            formTitle.textContent = 'Añadir Nuevo Plato/Bebida';
            document.getElementById('menu-item-id').value = '';
            menuItemFormSection.style.display = 'block';
        });
        document.getElementById('cancel-menu-item-form-btn').addEventListener('click', () => {
            menuItemFormSection.style.display = 'none';
        });
        menuItemForm.addEventListener('submit', handleSaveMenuItem);
        addCategoryForm.addEventListener('submit', handleAddCategory);
        addTableForm.addEventListener('submit', handleAddTable);
        loadAllData();
    };
    
    init();
};