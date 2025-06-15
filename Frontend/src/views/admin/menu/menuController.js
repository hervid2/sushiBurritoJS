// src/views/admin/menu/menuController.js

import { showAlert } from '../../../helpers/alerts.js';
import { showConfirmModal } from '../../../helpers/modalHelper.js'; // <- NUEVO IMPORT

export const menuController = () => {
    console.log("Menu Management Controller Initialized.");

    // --- Referencias a elementos del DOM ---
    const addMenuItemBtn = document.getElementById('add-menu-item-btn');
    const menuItemFormSection = document.getElementById('menu-item-form-section');
    const menuItemForm = document.getElementById('menu-item-form');
    // ... otras referencias al formulario ...
    const menuItemsTableBody = document.querySelector('#menu-items-table tbody');
    
    // YA NO SE NECESITAN LAS REFERENCIAS AL MODAL ANTIGUO

    // --- Funciones de Utilidad (sin cambios) ---
    const showForm = (isEditing = false) => {
        menuItemFormSection.style.display = 'block';
        // ...
    };
    const hideForm = () => {
        menuItemFormSection.style.display = 'none';
        // ...
    };

    // --- Funciones API (simuladas, sin cambios) ---
    const fetchMenuItems = async () => {
        return new Promise(r => setTimeout(() => r([
            { id: 101, name: 'Sushi Roll California', description: 'Aguacate, pepino, kanikama', price: 12.50, category: 'Sushi' },
            { id: 102, name: 'Burrito de Pollo Teriyaki', description: 'Pollo, arroz, vegetales', price: 9.99, category: 'Burrito' },
        ]), 300));
    };
    const deleteMenuItemApi = async (id) => {
        return new Promise(r => setTimeout(() => {
            console.log(`Simulating deletion of menu item ${id}`);
            r({ success: true });
        }, 300));
    };
     // ... otras funciones API (create, update, etc.) ...

    // --- Lógica de borrado (actualizada) ---
    const handleDeleteMenuItem = async (itemId, itemName) => {
        try {
            // USA EL NUEVO HELPER
            await showConfirmModal(
                'Confirmar Eliminación',
                `¿Está seguro de que desea eliminar el ítem <strong>${itemName}</strong> del menú?`
            );
            
            // Si el usuario confirma, continúa
            await deleteMenuItemApi(itemId);
            showAlert('Ítem del menú eliminado exitosamente.', 'success');
            loadMenuItems(); // Recargar la tabla

        } catch {
            // El usuario canceló
            console.log('Eliminación de ítem cancelada.');
        }
    };
    
    // --- Renderizado y Lógica (sin cambios significativos, excepto el listener) ---
    const loadMenuItems = async () => {
        menuItemsTableBody.innerHTML = '<tr><td colspan="8" class="loading-message">Cargando...</td></tr>';
        try {
            const menuItems = await fetchMenuItems();
            menuItemsTableBody.innerHTML = menuItems.map(item => `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.name}</td>
                    <td>${item.description}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>${item.category}</td>
                    <td>
                        <button class="btn btn--info btn--small edit-btn" data-id="${item.id}">Editar</button>
                        <button class="btn btn--danger btn--small delete-btn" data-id="${item.id}" data-name="${item.name}">Eliminar</button>
                    </td>
                </tr>
            `).join('');

            // Asignar listeners a los botones de eliminar
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const { id, name } = e.currentTarget.dataset;
                    handleDeleteMenuItem(id, name);
                });
            });
            // ... listeners para editar ...
        } catch (error) {
             menuItemsTableBody.innerHTML = '<tr><td colspan="8" class="error-message">Error al cargar el menú.</td></tr>';
        }
    };

    // --- Inicialización ---
    addMenuItemBtn.addEventListener('click', () => showForm(false));
    // ... otros listeners ...
    
    loadMenuItems();
};