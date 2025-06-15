// src/views/admin/users/usersController.js

import { showAlert } from '../../../helpers/alerts.js';
import { showConfirmModal } from '../../../helpers/modalHelper.js'; // <- NUEVO IMPORT

export const usersController = () => {
    console.log("Users Management Controller Initialized.");

    // --- Referencias a elementos del DOM ---
    const addUserBtn = document.getElementById('add-user-btn');
    const userFormSection = document.getElementById('user-form-section');
    const userForm = document.getElementById('user-form');
    // ... otras referencias al formulario ...
    const userIdInput = document.getElementById('user-id');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const roleSelect = document.getElementById('role');
    const cancelUserFormBtn = document.getElementById('cancel-user-form-btn');
    const usersTableBody = document.querySelector('#users-table tbody');
    
    // YA NO SE NECESITAN LAS REFERENCIAS AL MODAL ANTIGUO

    // --- Funciones de Utilidad (sin cambios) ---
    const showForm = (isEditing = false) => {
        userFormSection.style.display = 'block';
        userForm.querySelector('#form-title').textContent = isEditing ? 'Editar Usuario' : 'Añadir Nuevo Usuario';
        if (!isEditing) {
            userForm.reset();
            userIdInput.value = '';
            passwordInput.setAttribute('required', 'required');
        } else {
            passwordInput.removeAttribute('required');
        }
    };
    const hideForm = () => {
        userFormSection.style.display = 'none';
        userForm.reset();
        userIdInput.value = '';
    };

    // --- Funciones API (simuladas, sin cambios) ---
    const fetchUsers = async () => {
        return new Promise(r => setTimeout(() => r([
            { id: 1, name: 'Administrador', email: 'admin@sushi.com', role: 'admin' },
            { id: 2, name: 'Juan Mesero', email: 'waiter@sushi.com', role: 'waiter' }
        ]), 300));
    };
    const deleteUserApi = async (id) => {
        return new Promise(r => setTimeout(() => {
            console.log(`Simulating deletion of user ${id}`);
            r({ success: true });
        }, 300));
    };
    // ... otras funciones API (createUser, updateUser, etc.) ...

    // --- Lógica de borrado (actualizada) ---
    const handleDeleteUser = async (userId, userName) => {
        try {
            // USA EL NUEVO HELPER
            await showConfirmModal(
                'Confirmar Eliminación',
                `¿Está seguro de que desea eliminar al usuario <strong>${userName}</strong>? Esta acción es irreversible.`
            );

            // Si el usuario confirma, continúa
            await deleteUserApi(userId);
            showAlert('Usuario eliminado exitosamente.', 'success');
            loadUsers(); // Recargar la tabla

        } catch {
            // El usuario canceló
            console.log('Eliminación de usuario cancelada.');
        }
    };
    
    // --- Renderizado y Lógica (sin cambios significativos, excepto el listener) ---
    const loadUsers = async () => {
        usersTableBody.innerHTML = '<tr><td colspan="5" class="loading-message">Cargando...</td></tr>';
        try {
            const users = await fetchUsers();
            usersTableBody.innerHTML = users.map(user => `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td>
                        <button class="btn btn--info btn--small edit-btn" data-id="${user.id}">Editar</button>
                        <button class="btn btn--danger btn--small delete-btn" data-id="${user.id}" data-name="${user.name}">Eliminar</button>
                    </td>
                </tr>
            `).join('');

            // Asignar listeners a los botones de eliminar
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const { id, name } = e.currentTarget.dataset;
                    handleDeleteUser(id, name); // Llama a la nueva función de borrado
                });
            });
            // ... listeners para editar ...
        } catch (error) {
            usersTableBody.innerHTML = '<tr><td colspan="5" class="error-message">Error al cargar usuarios.</td></tr>';
        }
    };

    // --- Inicialización ---
    addUserBtn.addEventListener('click', () => showForm(false));
    cancelUserFormBtn.addEventListener('click', hideForm);
    // ... listener para userForm.addEventListener('submit', ...) ...
    
    loadUsers();
};