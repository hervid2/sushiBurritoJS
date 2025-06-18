// src/views/admin/users/usersController.js (ACTUALIZADO)

import { showAlert } from '../../../helpers/alerts.js';
import { showConfirmModal } from '../../../helpers/modalHelper.js';

export const usersController = () => {
    console.log("Users Management Controller Initialized.");

    // --- Referencias al DOM ---
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
    
    // --- Funciones de Utilidad ---
    const showForm = (isEditing = false) => {
        const titleElement = document.getElementById('form-title');
        const saveButton = document.getElementById('save-user-btn');
        const passwordGroup = passwordInput.closest('.form-group');
        userFormSection.style.display = 'block';
        
        if (titleElement) {
            titleElement.textContent = isEditing ? 'Editar Información del Usuario' : 'Añadir Nuevo Usuario';
        }
        if (saveButton) {
            saveButton.textContent = isEditing ? 'Guardar Cambios' : 'Crear Usuario';
        }

        if (isEditing) {
            if (passwordGroup) passwordGroup.style.display = 'none';
            roleSelect.disabled = true;
        } else {
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

    // --- API Simulada (con datos restaurados) ---
    const FAKE_USERS_DB = [
        { id: 1, name: 'Carlos Administrador', email: 'admin@sushi.com', role: 'admin' },
        { id: 2, name: 'Ana Pérez (Mesera)', email: 'ana.perez@sushi.com', role: 'waiter' },
        { id: 3, name: 'Luis García (Cocinero)', email: 'luis.garcia@sushi.com', role: 'kitchen' },
        { id: 4, name: 'Sofía Rodríguez (Mesera)', email: 'sofia.r@sushi.com', role: 'waiter' },
        { id: 5, name: 'Jorge Martinez (Admin)', email: 'jorge.martinez@sushi.com', role: 'admin' },
    ];
    
    const fetchUsers = async () => new Promise(r => setTimeout(() => r([...FAKE_USERS_DB]), 300));
    const fetchUserById = async (id) => new Promise(r => setTimeout(() => r(FAKE_USERS_DB.find(u => u.id == id)), 200));
    const updateUser = async (id, userData) => new Promise(r => setTimeout(() => { 
        const index = FAKE_USERS_DB.findIndex(u => u.id == id);
        if (index !== -1) {
            FAKE_USERS_DB[index].name = userData.name;
            FAKE_USERS_DB[index].email = userData.email;
        }
        r({ success: true }); 
    }, 400));
    const createUser = async (userData) => new Promise(r => setTimeout(() => {
        const newId = Math.max(...FAKE_USERS_DB.map(u => u.id)) + 1;
        FAKE_USERS_DB.push({ id: newId, ...userData });
        r({ success: true }); 
    }, 400));
    const deleteUserApi = async (id) => new Promise(r => setTimeout(() => { 
        const index = FAKE_USERS_DB.findIndex(u => u.id == id);
        if (index !== -1) FAKE_USERS_DB.splice(index, 1);
        r({ success: true }); 
    }, 300));

    // --- Lógica de borrado y edición ---
    const handleDeleteUser = async (userId, userName) => {
        try {
            await showConfirmModal('Confirmar Eliminación', `¿Está seguro de que desea eliminar a <strong>${userName}</strong>?`);
            await deleteUserApi(userId);
            showAlert('Usuario eliminado exitosamente.', 'success');
            loadUsers();
        } catch { console.log('Eliminación cancelada.'); }
    };

    const handleEditClick = async (userId) => {
        try {
            const user = await fetchUserById(userId);
            if (!user) { showAlert('Usuario no encontrado.', 'error'); return; }
            userIdInput.value = user.id;
            nameInput.value = user.name;
            emailInput.value = user.email;
            roleSelect.value = user.role;
            showForm(true);
        } catch (error) { showAlert('Error al cargar los datos del usuario.', 'error'); }
    };

    // --- LÓGICA DE GUARDAR (ACTUALIZADA) ---
    const handleSaveUser = async (event) => {
        event.preventDefault();
        const id = userIdInput.value;
        if (nameInput.value.trim() === '' || emailInput.value.trim() === '') {
            showAlert('El nombre y el email no pueden estar vacíos.', 'warning');
            return;
        }
        const userData = { name: nameInput.value, email: emailInput.value, };

        if (id) {
            try {
                await showConfirmModal('Confirmar Cambios', '¿Está seguro de que desea guardar las modificaciones para este usuario?');
                await updateUser(id, userData);
                showAlert('Usuario actualizado exitosamente.', 'success');
                hideForm();
                loadUsers();
            } catch {
                console.log("Edición de usuario cancelada.");
            }
        } else {
            if (!passwordInput.value) {
                showAlert('La contraseña es obligatoria para nuevos usuarios.', 'warning');
                return;
            }
            userData.password = passwordInput.value;
            userData.role = roleSelect.value;
            try {
                await createUser(userData);
                showAlert('Usuario creado exitosamente.', 'success');
                hideForm();
                loadUsers();
            } catch (error) {
                 showAlert('Error al crear el usuario.', 'error');
            }
        }
    };
    
    // --- Renderizado y Lógica ---
    const loadUsers = async () => {
        if (!usersTableBody) return;
        usersTableBody.innerHTML = '<tr><td colspan="5" class="loading-message">Cargando...</td></tr>';
        try {
            const users = await fetchUsers();
            if (users.length === 0) {
                usersTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No hay usuarios.</td></tr>';
                return;
            }
            usersTableBody.innerHTML = users.map(user => `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td><span class="role-badge role-${user.role}">${user.role}</span></td>
                    <td class="table-actions">
                        <button class="btn btn--info btn--small edit-btn" data-id="${user.id}">Editar</button>
                        <button class="btn btn--danger btn--small delete-btn" data-id="${user.id}" data-name="${user.name}">Eliminar</button>
                    </td>
                </tr>
            `).join('');

            document.querySelectorAll('.delete-btn').forEach(btn => btn.onclick = (e) => handleDeleteUser(e.currentTarget.dataset.id, e.currentTarget.dataset.name));
            document.querySelectorAll('.edit-btn').forEach(btn => btn.onclick = (e) => handleEditClick(e.currentTarget.dataset.id));
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

