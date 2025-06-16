// src/views/admin/users/usersController.js

import { showAlert } from '../../../helpers/alerts.js';
import { showConfirmModal } from '../../../helpers/modalHelper.js';

export const usersController = () => {
    console.log("Users Management Controller Initialized.");

    // --- Referencias a elementos del DOM ---
    const addUserBtn = document.getElementById('add-user-btn');
    const userFormSection = document.getElementById('user-form-section');
    const userForm = document.getElementById('user-form');
    const userIdInput = document.getElementById('user-id');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const roleSelect = document.getElementById('role');
    const cancelUserFormBtn = document.getElementById('cancel-user-form-btn');
    const usersTableBody = document.querySelector('#users-table tbody');
    
    // --- Funciones de Utilidad (CORREGIDA) ---
    const showForm = (isEditing = false) => {
        // Referencias a elementos que cambian
        const titleElement = document.getElementById('form-title');
        const saveButton = document.getElementById('save-user-btn');
        const passwordGroup = passwordInput.closest('.form-group');

        userFormSection.style.display = 'block';
        
        // Actualizar título y botón
        if (titleElement) {
            titleElement.textContent = isEditing ? 'Editar Información del Usuario' : 'Añadir Nuevo Usuario';
        }
        if (saveButton) {
            saveButton.textContent = isEditing ? 'Guardar Cambios' : 'Crear Usuario';
        }

        if (isEditing) {
            // Modo Edición: Ocultar contraseña y deshabilitar rol
            if (passwordGroup) passwordGroup.style.display = 'none';
            roleSelect.disabled = true;
        } else {
            // Modo Creación: Mostrar contraseña, habilitar rol y resetear
            userForm.reset();
            userIdInput.value = '';
            if (passwordGroup) passwordGroup.style.display = 'block';
            roleSelect.disabled = false;
        }
    };

    const hideForm = () => {
        userFormSection.style.display = 'none';
        userForm.reset();
        userIdInput.value = '';
    };

    // --- Funciones API (simuladas) ---
    const FAKE_USERS_DB = [
        { id: 1, name: 'Carlos Administrador', email: 'admin@sushi.com', role: 'admin' },
        { id: 2, name: 'Ana Pérez (Mesera)', email: 'ana.perez@sushi.com', role: 'waiter' },
        { id: 3, name: 'Luis García (Cocinero)', email: 'luis.garcia@sushi.com', role: 'kitchen' },
        { id: 4, name: 'Sofía Rodríguez (Mesera)', email: 'sofia.r@sushi.com', role: 'waiter' },
        { id: 5, name: 'Jorge Martinez (Admin)', email: 'jorge.martinez@sushi.com', role: 'admin' },
    ];

    const fetchUsers = async () => {
        return new Promise(r => setTimeout(() => r([...FAKE_USERS_DB]), 300));
    };

    const fetchUserById = async (id) => {
        return new Promise(r => setTimeout(() => {
            const user = FAKE_USERS_DB.find(u => u.id == id);
            r(user);
        }, 200));
    };

    const updateUser = async (id, userData) => {
        return new Promise(r => setTimeout(() => {
            console.log(`Simulating update for user ${id} with data:`, userData);
            const index = FAKE_USERS_DB.findIndex(u => u.id == id);
            if (index !== -1) {
                // Solo actualiza nombre y email, el rol no cambia
                FAKE_USERS_DB[index].name = userData.name;
                FAKE_USERS_DB[index].email = userData.email;
            }
            r({ success: true });
        }, 400));
    };
    
    const createUser = async (userData) => {
         return new Promise(r => setTimeout(() => {
            console.log(`Simulating creation of user with data:`, userData);
            const newId = Math.max(...FAKE_USERS_DB.map(u => u.id)) + 1;
            FAKE_USERS_DB.push({ id: newId, ...userData });
            r({ success: true });
        }, 400));
    };

    const deleteUserApi = async (id) => {
        return new Promise(r => setTimeout(() => {
            console.log(`Simulating deletion of user ${id}`);
            const index = FAKE_USERS_DB.findIndex(u => u.id == id);
            if (index !== -1) FAKE_USERS_DB.splice(index, 1);
            r({ success: true });
        }, 300));
    };

    // --- Lógica de borrado y edición ---
    const handleDeleteUser = async (userId, userName) => {
        try {
            await showConfirmModal('Confirmar Eliminación', `¿Está seguro de que desea eliminar a <strong>${userName}</strong>?`);
            await deleteUserApi(userId);
            showAlert('Usuario eliminado exitosamente.', 'success');
            loadUsers();
        } catch {
            console.log('Eliminación cancelada.');
        }
    };

    const handleEditClick = async (userId) => {
        try {
            const user = await fetchUserById(userId);
            if (!user) {
                showAlert('Usuario no encontrado.', 'error');
                return;
            }
            
            userIdInput.value = user.id;
            nameInput.value = user.name;
            emailInput.value = user.email;
            roleSelect.value = user.role;
            
            showForm(true);

        } catch (error) {
            showAlert('Error al cargar los datos del usuario.', 'error');
        }
    };

    // --- Lógica de Guardar (Crear o Editar) ---
    const handleSaveUser = async (event) => {
        event.preventDefault();
        
        const id = userIdInput.value;
        
        if (nameInput.value.trim() === '' || emailInput.value.trim() === '') {
            showAlert('El nombre y el email no pueden estar vacíos.', 'warning');
            return;
        }

        const userData = {
            name: nameInput.value,
            email: emailInput.value,
        };

        try {
            if (id) {
                // Actualización (solo envía nombre y email)
                await updateUser(id, userData);
                showAlert('Usuario actualizado exitosamente.', 'success');
            } else {
                // Creación (requiere contraseña y rol)
                if (!passwordInput.value) {
                    showAlert('La contraseña es obligatoria para nuevos usuarios.', 'warning');
                    return;
                }
                userData.password = passwordInput.value;
                userData.role = roleSelect.value;
                await createUser(userData);
                showAlert('Usuario creado exitosamente.', 'success');
            }
            hideForm();
            loadUsers();
        } catch (error) {
            showAlert('Error al guardar el usuario.', 'error');
        }
    };
    
    // --- Renderizado y Lógica ---
    const loadUsers = async () => {
        if (!usersTableBody) return;
        usersTableBody.innerHTML = '<tr><td colspan="5" class="loading-message">Cargando...</td></tr>';
        try {
            const users = await fetchUsers();
            if (users.length === 0) {
                 usersTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No hay usuarios registrados.</td></tr>';
                 return;
            }

            usersTableBody.innerHTML = users.map(user => `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td><span class="role-badge role-${user.role}">${user.role}</span></td>
                    <td class="table__actions">
                        <button class="btn btn--info btn--small edit-btn" data-id="${user.id}">Editar</button>
                        <button class="btn btn--danger btn--small delete-btn" data-id="${user.id}" data-name="${user.name}">Eliminar</button>
                    </td>
                </tr>
            `).join('');

            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const { id, name } = e.currentTarget.dataset;
                    handleDeleteUser(id, name);
                });
            });
            
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    handleEditClick(e.currentTarget.dataset.id);
                });
            });

        } catch (error) {
            usersTableBody.innerHTML = '<tr><td colspan="5" class="error-message">Error al cargar usuarios.</td></tr>';
        }
    };

    // --- Inicialización ---
    addUserBtn.addEventListener('click', () => showForm(false));
    cancelUserFormBtn.addEventListener('click', hideForm);
    userForm.addEventListener('submit', handleSaveUser);
    
    loadUsers();
};
