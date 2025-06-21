// src/views/admin/users/usersController.js (COMPLETO Y ACTUALIZADO)

import { showAlert } from '../../../helpers/alerts.js';
import { showConfirmModal } from '../../../helpers/modalHelper.js';
import { validateEmail, validatePassword } from '../../../helpers/auth.js';

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
    const paginationContainer = document.getElementById('users-pagination');
    
    // --- Estado ---
    let FAKE_USERS_DB = Array.from({ length: 20 }, (_, i) => ({ id: 1 + i, name: `Usuario Ejemplo ${i+1}`, email: `usuario${i+1}@sushi.com`, role: ['admin', 'waiter', 'kitchen'][i%3] }));
    let currentPage = 1;
    const itemsPerPage = 8;

    // --- Funciones de Utilidad ---
    const showForm = (isEditing = false) => {
        const titleElement = document.getElementById('form-title');
        const saveButton = document.getElementById('save-user-btn');
        const passwordGroup = passwordInput.closest('.form-group');
        userFormSection.style.display = 'block';
        
        if (titleElement) titleElement.textContent = isEditing ? 'Editar Información del Usuario' : 'Añadir Nuevo Usuario';
        if (saveButton) saveButton.textContent = isEditing ? 'Guardar Cambios' : 'Crear Usuario';

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
    
    // --- API Simulada ---
    const fetchUsers = async () => new Promise(r => setTimeout(() => r([...FAKE_USERS_DB]), 300));
    const fetchUserById = async (id) => new Promise(r => setTimeout(() => r(FAKE_USERS_DB.find(u => u.id == id)), 200));
    const updateUser = async (id, userData) => new Promise(r => setTimeout(() => {
        const index = FAKE_USERS_DB.findIndex(u => u.id == id);
        if (index !== -1) { FAKE_USERS_DB[index] = { ...FAKE_USERS_DB[index], ...userData }; }
        r({ success: true });
    }, 400));
    const createUser = async (userData) => new Promise(r => setTimeout(() => {
        const newId = FAKE_USERS_DB.length > 0 ? Math.max(...FAKE_USERS_DB.map(u => u.id)) + 1 : 1;
        FAKE_USERS_DB.push({ id: newId, ...userData });
        r({ success: true });
    }, 400));
    const deleteUserApi = async (id) => new Promise(r => setTimeout(() => {
        FAKE_USERS_DB = FAKE_USERS_DB.filter(u => u.id != id);
        r({ success: true });
    }, 300));

    // --- Lógica de borrado y edición ---
    const handleDeleteUser = async (userId, userName) => {
        try {
            await showConfirmModal('Confirmar Eliminación', `¿Está seguro de que desea eliminar a <strong>${userName}</strong>?`);
            await deleteUserApi(userId);
            showAlert('Usuario eliminado.', 'success');
            loadUsers();
        } catch { console.log('Eliminación cancelada.'); }
    };

    const handleEditClick = async (userId) => {
        const user = await fetchUserById(userId);
        if (user) {
            userIdInput.value = user.id;
            nameInput.value = user.name;
            emailInput.value = user.email;
            roleSelect.value = user.role;
            showForm(true);
        } else { showAlert('Usuario no encontrado.', 'error'); }
    };

    // --- Lógica de Guardar ---
    const handleSaveUser = async (event) => {
        event.preventDefault();
        const id = userIdInput.value;
        const userData = { name: nameInput.value, email: emailInput.value };

        if (!validateEmail(userData.email)) {
            showAlert('Por favor, ingrese un correo electrónico válido.', 'warning');
            return;
        }

        if (id) {
            try {
                await showConfirmModal('Confirmar Cambios', '¿Guardar los cambios para este usuario?');
                await updateUser(id, userData);
                showAlert('Usuario actualizado.', 'success');
                hideForm();
                loadUsers();
            } catch { console.log("Edición cancelada."); }
        } else {
            if (!validatePassword(passwordInput.value)) {
                showAlert('La contraseña no cumple los requisitos de seguridad.', 'warning');
                return;
            }
            userData.password = passwordInput.value;
            userData.role = roleSelect.value;
            try {
                await showConfirmModal('Confirmar Creación', `¿Crear al nuevo usuario <strong>${userData.name}</strong>?`);
                await createUser(userData);
                showAlert('Usuario creado.', 'success');
                hideForm();
                loadUsers();
            } catch { console.log("Creación cancelada."); }
        }
    };
    
    // --- Renderizado y Paginación ---
    const renderPage = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const pageUsers = FAKE_USERS_DB.slice(startIndex, startIndex + itemsPerPage);
        
        usersTableBody.innerHTML = pageUsers.map(user => `
            <tr>
                <td>${user.id}</td><td>${user.name}</td><td>${user.email}</td>
                <td><span class="role-badge role-${user.role}">${user.role}</span></td>
                <td class="table-actions">
                    <button class="btn btn--info btn--small edit-btn" data-id="${user.id}">Editar</button>
                    <button class="btn btn--danger btn--small delete-btn" data-id="${user.id}" data-name="${user.name}">Eliminar</button>
                </td>
            </tr>`).join('');

        renderPagination();
        usersTableBody.querySelectorAll('.delete-btn').forEach(btn => btn.onclick = (e) => handleDeleteUser(e.currentTarget.dataset.id, e.currentTarget.dataset.name));
        usersTableBody.querySelectorAll('.edit-btn').forEach(btn => btn.onclick = (e) => handleEditClick(e.currentTarget.dataset.id));
    };

    const renderPagination = () => {
        const totalPages = Math.ceil(FAKE_USERS_DB.length / itemsPerPage);
        paginationContainer.innerHTML = '';
        if (totalPages <= 1) return;
        
        let buttonsHTML = `<ul>`;
        for (let i = 1; i <= totalPages; i++) {
            buttonsHTML += `<li><button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button></li>`;
        }
        buttonsHTML += `</ul>`;
        paginationContainer.innerHTML = buttonsHTML;

        paginationContainer.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.onclick = () => { currentPage = parseInt(btn.dataset.page); renderPage(); };
        });
    };

    const loadUsers = async () => {
        usersTableBody.innerHTML = '<tr><td colspan="5" class="loading-message">Cargando...</td></tr>';
        try {
            const users = await fetchUsers();
            FAKE_USERS_DB = users;
            currentPage = 1;
            renderPage();
        } catch (error) { usersTableBody.innerHTML = '<tr><td colspan="5" class="error-message">Error al cargar.</td></tr>'; }
    };

    // --- Inicialización ---
    addUserBtn.addEventListener('click', () => showForm(false));
    cancelUserFormBtn.addEventListener('click', hideForm);
    userForm.addEventListener('submit', handleSaveUser);
    loadUsers();
};

