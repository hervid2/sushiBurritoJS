// src/views/admin/users/usersController.js 

import { showAlert } from '../../../helpers/alerts.js';
import { showConfirmModal } from '../../../helpers/modalHelper.js';
import { validateEmail, validatePassword } from '../../../helpers/auth.js';

const API_URL = 'http://localhost:3000/api';

// --- API Service Helper ---
// Un pequeño servicio para manejar las peticiones fetch y la autenticación
const apiService = {
    getAuthHeaders: () => {
        const token = localStorage.getItem('accessToken');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    },
    get: async (endpoint) => {
        const response = await fetch(`${API_URL}/${endpoint}`, { headers: apiService.getAuthHeaders() });
        if (!response.ok) throw new Error((await response.json()).message || 'Error en la petición GET');
        return response.json();
    },
    post: async (endpoint, data) => {
        const response = await fetch(`${API_URL}/${endpoint}`, { method: 'POST', headers: apiService.getAuthHeaders(), body: JSON.stringify(data) });
        if (!response.ok) throw new Error((await response.json()).message || 'Error en la petición POST');
        return response.json();
    },
    put: async (endpoint, data) => {
        const response = await fetch(`${API_URL}/${endpoint}`, { method: 'PUT', headers: apiService.getAuthHeaders(), body: JSON.stringify(data) });
        if (!response.ok) throw new Error((await response.json()).message || 'Error en la petición PUT');
        return response.json();
    },
    delete: async (endpoint) => {
        const response = await fetch(`${API_URL}/${endpoint}`, { method: 'DELETE', headers: apiService.getAuthHeaders() });
        if (!response.ok) throw new Error((await response.json()).message || 'Error en la petición DELETE');
        return response.json();
    }
};

export const usersController = () => {
    console.log("Users Management Controller Initialized.");

    // --- Referencias al DOM ---
    const addUserBtn = document.getElementById('add-user-btn');
    const userFormSection = document.getElementById('user-form-section');
    const userForm = document.getElementById('user-form');
    const usersTable = document.getElementById('users-table');
    
    // --- Lógica de la Interfaz ---
    const showForm = (isEditing = false, user = {}) => {
        userFormSection.style.display = 'block';
        // CSeleccionar elementos por ID desde el documento
        const titleElement = document.getElementById('form-title');
        const saveButton = document.getElementById('save-user-btn');
        const passwordInput = document.getElementById('password');
        const roleSelect = document.getElementById('role');
        const passwordGroup = passwordInput.closest('.form-group');
        // Actualizar título y botón
        if (titleElement) titleElement.textContent = isEditing ? 'Editar Usuario' : 'Añadir Nuevo Usuario';
        if (saveButton) saveButton.textContent = isEditing ? 'Guardar Cambios' : 'Crear Usuario';

        if (isEditing) {
            // Ocultar el contenedor del campo de contraseña
            if (passwordGroup) passwordGroup.style.display = 'none';
            roleSelect.disabled = true;
        } else {
            userForm.reset();
            document.getElementById('user-id').value = '';
            if (passwordGroup) passwordGroup.style.display = 'block';
            roleSelect.disabled = false;
        }
        // Poblar el formulario (se hace después de la lógica de mostrar/ocultar)
        document.getElementById('user-id').value = user.usuario_id || '';
        document.getElementById('name').value = user.nombre || '';
        document.getElementById('email').value = user.correo || '';
        document.getElementById('role').value = user.rol || 'mesero';
    };
    const hideForm = () => { userFormSection.style.display = 'none'; };

    // --- Lógica de Negocio y API ---
    const loadUsers = async () => {
        try {
            const users = await apiService.get('usuarios');
            renderTable(users);
        } catch (error) {
            showAlert(error.message, 'error');
        }
    };

    const handleSaveUser = async (event) => {
        event.preventDefault();
        const id = userForm.querySelector('#user-id').value;
        const userData = {
            nombre: userForm.querySelector('#name').value,
            correo: userForm.querySelector('#email').value,
            rol: userForm.querySelector('#role').value,
        };
        
        try {
            if (id) { // --- MODO EDICIÓN ---
                await apiService.put(`usuarios/${id}`, userData);
                showAlert('Usuario actualizado exitosamente.', 'success');
            } else { // --- MODO CREACIÓN ---
                const password = userForm.querySelector('#password').value;
                if (!validatePassword(password)) {
                    showAlert('La contraseña no cumple los requisitos de seguridad.', 'warning');
                    return;
                }
                userData.contraseña = password;
                await apiService.post('usuarios', userData);
                showAlert('Usuario creado exitosamente.', 'success');
            }
            hideForm();
            loadUsers();
        } catch (error) {
            showAlert(error.message, 'error');
        }
    };

    const handleEditClick = async (userId) => {
        try {
            const user = await apiService.get(`usuarios/${userId}`);
            showForm(true, user);
        } catch (error) {
            showAlert(error.message, 'error');
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        try {
            await showConfirmModal('Confirmar Eliminación', `¿Está seguro de que desea eliminar a <strong>${userName}</strong>?`);
            await apiService.delete(`usuarios/${userId}`);
            showAlert('Usuario eliminado exitosamente.', 'success');
            loadUsers();
        } catch (error) {
            if(error) showAlert(error.message, 'error');
            else console.log("Eliminación cancelada.");
        }
    };

    // --- Renderizado ---
    const renderTable = (users) => {
        usersTable.innerHTML = `
            <thead>
                <tr><th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Acciones</th></tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td>${user.usuario_id}</td>
                        <td>${user.nombre}</td>
                        <td>${user.correo}</td>
                        <td><span class="role-badge role-${user.rol.replace('administrador', 'admin')}">${user.rol}</span></td>
                        <td class="table-actions">
                            <button class="btn btn--info btn--small edit-btn" data-id="${user.usuario_id}">Editar</button>
                            <button class="btn btn--danger btn--small delete-btn" data-id="${user.usuario_id}" data-name="${user.nombre}">Eliminar</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        // Re-asignar listeners a los nuevos botones
        usersTable.querySelectorAll('.edit-btn').forEach(btn => btn.onclick = () => handleEditClick(btn.dataset.id));
        usersTable.querySelectorAll('.delete-btn').forEach(btn => btn.onclick = () => handleDeleteUser(btn.dataset.id, btn.dataset.name));
    };

    // --- Inicialización ---
    document.getElementById('add-user-btn').addEventListener('click', () => showForm(false));
    document.getElementById('cancel-user-form-btn').addEventListener('click', hideForm);
    userForm.addEventListener('submit', handleSaveUser);
    
    loadUsers();
};

