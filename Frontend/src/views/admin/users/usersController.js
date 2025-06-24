// =================================================================
// ARCHIVO: src/views/admin/users/usersController.js
// DESCRIPCIÓN: Controlador final que usa el servicio API centralizado.
// =================================================================

import { showAlert } from '../../../helpers/alerts.js';
import { showConfirmModal } from '../../../helpers/modalHelper.js';
import { validatePassword } from '../../../helpers/auth.js';
import { api } from '../../../helpers/solicitudes.js'; // ¡Importamos nuestro nuevo servicio!

export const usersController = () => {
    // --- Referencias al DOM (solo se obtienen una vez) ---
    const userFormSection = document.getElementById('user-form-section');
    const userForm = document.getElementById('user-form');
    const usersTableBody = document.querySelector('#users-table tbody');
    const formTitle = document.getElementById('form-title');
    const passwordGroup = document.getElementById('password').closest('.form-group');
    const roleSelect = document.getElementById('role');
    
    // --- Lógica de la Interfaz ---
    const showForm = (isEditing = false, user = {}) => {
        userForm.reset();
        formTitle.textContent = isEditing ? 'Editar Usuario' : 'Añadir Nuevo Usuario';
        
        // El campo de contraseña solo es visible y requerido al crear un usuario nuevo.
        passwordGroup.style.display = isEditing ? 'none' : 'block';
        document.getElementById('password').required = !isEditing;

        // El rol no se puede cambiar al editar para evitar escalada de privilegios accidental.
        roleSelect.disabled = isEditing;

        // Rellenamos el formulario con los datos del usuario si estamos editando.
        if(isEditing) {
            document.getElementById('user-id').value = user.usuario_id;
            document.getElementById('name').value = user.nombre;
            document.getElementById('email').value = user.correo;
            roleSelect.value = user.rol;
        }

        userFormSection.style.display = 'block';
    };

    const hideForm = () => {
        userFormSection.style.display = 'none';
        userForm.reset();
    };

    // --- Lógica de Negocio y API ---
    const loadUsers = async () => {
        try {
            const users = await api.get('usuarios');
            renderTable(users);
        } catch (error) {
            showAlert(error.message, 'error');
            usersTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-error">Error al cargar los usuarios.</td></tr>`;
        }
    };

    const handleSaveUser = async (event) => {
        event.preventDefault();
        const id = document.getElementById('user-id').value;
        const userData = {
            nombre: document.getElementById('name').value,
            correo: document.getElementById('email').value,
        };

        try {
            if (id) { // --- MODO EDICIÓN ---
                await api.put(`usuarios/${id}`, userData);
                showAlert('Usuario actualizado exitosamente.', 'success');
            } else { // --- MODO CREACIÓN ---
                const password = document.getElementById('password').value;
                if (!validatePassword(password)) {
                    showAlert('La contraseña no cumple los requisitos de seguridad.', 'warning');
                    return;
                }
                userData.contraseña = password;
                userData.rol = roleSelect.value;
                await api.post('usuarios', userData);
                showAlert('Usuario creado exitosamente.', 'success');
            }
            hideForm();
            await loadUsers(); // Recargamos la tabla para ver los cambios.
        } catch (error) {
            showAlert(error.message, 'error');
        }
    };

    const handleEditClick = (user) => {
        // Pasamos el objeto de usuario completo para rellenar el formulario,
        // así evitamos una llamada innecesaria a la API para obtener los datos.
        showForm(true, user);
    };

    const handleDeleteClick = async (userId, userName) => {
        try {
            // Usamos el modal de confirmación que ya tienes.
            await showConfirmModal('Confirmar Eliminación', `¿Está seguro de que desea eliminar a <strong>${userName}</strong>?`);
            // Si el usuario confirma, procedemos a eliminar.
            await api.delete(`usuarios/${userId}`);
            showAlert('Usuario eliminado exitosamente.', 'success');
            await loadUsers(); // Recargamos la tabla.
        } catch (error) {
            // Si hay un error de la API, lo mostramos.
            // Si el usuario cancela, `showConfirmModal` rechaza la promesa y no hacemos nada.
            if (error && error.message) {
                 showAlert(error.message, 'error');
            } else {
                console.log("Eliminación cancelada por el usuario.");
            }
        }
    };

    // --- Renderizado de la Tabla ---
    const renderTable = (users) => {
        usersTableBody.innerHTML = ''; // Limpiamos la tabla antes de renderizar.
        if (users.length === 0) {
            usersTableBody.innerHTML = `<tr><td colspan="5" class="text-center">No hay usuarios registrados.</td></tr>`;
            return;
        }

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.usuario_id}</td>
                <td>${user.nombre}</td>
                <td>${user.correo}</td>
                <td><span class="role-badge role-${user.rol.replace('administrador', 'admin')}">${user.rol}</span></td>
                <td class="table-actions">
                    <button class="btn btn--info btn--small edit-btn">Editar</button>
                    <button class="btn btn--danger btn--small delete-btn">Eliminar</button>
                </td>
            `;

            // Asignamos los listeners directamente a los botones de esta fila.
            row.querySelector('.edit-btn').addEventListener('click', () => handleEditClick(user));
            row.querySelector('.delete-btn').addEventListener('click', () => handleDeleteClick(user.usuario_id, user.nombre));

            usersTableBody.appendChild(row);
        });
    };

    // --- Inicialización del Controlador ---
    const init = () => {
        document.getElementById('add-user-btn').addEventListener('click', () => showForm(false));
        document.getElementById('cancel-user-form-btn').addEventListener('click', hideForm);
        userForm.addEventListener('submit', handleSaveUser);
        
        loadUsers(); // Carga inicial de usuarios al entrar a la vista.
    };

    init();
};