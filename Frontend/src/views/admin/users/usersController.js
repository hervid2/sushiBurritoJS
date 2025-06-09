import { showAlert } from '../../../helpers/alerts.js'; // Asumiendo que este helper es Vanilla JS

export const usersController = (params) => {
    console.log("Users Management Controller Initialized (Vanilla JS with fetch).", params);

    // --- Referencias a elementos del DOM ---
    const addUserBtn = document.getElementById('add-user-btn');
    const userFormSection = document.getElementById('user-form-section');
    const userForm = document.getElementById('user-form');
    const formTitle = document.getElementById('form-title');
    const userIdInput = document.getElementById('user-id');
    const nameInput = document.getElementById('name');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const roleSelect = document.getElementById('role');
    const saveUserBtn = document.getElementById('save-user-btn');
    const cancelUserFormBtn = document.getElementById('cancel-user-form-btn');
    const usersTableBody = document.querySelector('#users-table tbody');

    // Modal de confirmación
    const confirmModal = document.getElementById('confirm-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const userToDeleteNameSpan = document.getElementById('user-to-delete-name');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');

    let userToDeleteId = null; // Para almacenar el ID del usuario a eliminar

    // --- Funciones de Utilidad ---

    const showForm = (isEditing = false) => {
        userFormSection.style.display = 'block';
        formTitle.textContent = isEditing ? 'Editar Usuario' : 'Añadir Nuevo Usuario';
        saveUserBtn.textContent = isEditing ? 'Guardar Cambios' : 'Crear Usuario';
        if (!isEditing) {
            userForm.reset(); // Limpia el formulario si es para añadir
            userIdInput.value = '';
            passwordInput.setAttribute('required', 'required'); // La contraseña es obligatoria al crear
        } else {
            passwordInput.removeAttribute('required'); // La contraseña es opcional al editar
        }
    };

    const hideForm = () => {
        userFormSection.style.display = 'none';
        userForm.reset();
        userIdInput.value = '';
    };

    const showConfirmModal = (userName, userId) => {
        userToDeleteNameSpan.textContent = userName;
        userToDeleteId = userId;
        confirmModal.style.display = 'block';
    };

    const hideConfirmModal = () => {
        confirmModal.style.display = 'none';
        userToDeleteId = null;
    };

    // --- Simulación de API con fetch ---

    const fetchUsers = async () => {
        // Simulación:
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([
                    { id: 1, name: 'Administrador Principal', username: 'admin', email: 'admin@example.com', role: 'admin' },
                    { id: 2, name: 'María Pérez', username: 'mariap', email: 'maria@example.com', role: 'waiter' },
                    { id: 3, name: 'Carlos Ruíz', username: 'carlosr', email: 'carlos@example.com', role: 'kitchen' },
                    { id: 4, name: 'Sofía Gomez', username: 'sofiag', email: 'sofia@example.com', role: 'client' },
                ]);
            }, 300);
        });
        // Real:
        // const response = await fetch('/api/users');
        // if (!response.ok) throw new Error('Failed to fetch users');
        // return await response.json();
    };

    const fetchUserById = async (id) => {
         // Simulación:
         return new Promise(resolve => {
            setTimeout(() => {
                const users = [
                    { id: 1, name: 'Administrador Principal', username: 'admin', email: 'admin@example.com', role: 'admin' },
                    { id: 2, name: 'María Pérez', username: 'mariap', email: 'maria@example.com', role: 'waiter' },
                    { id: 3, name: 'Carlos Ruíz', username: 'carlosr', email: 'carlos@example.com', role: 'kitchen' },
                    { id: 4, name: 'Sofía Gomez', username: 'sofiag', email: 'sofia@example.com', role: 'client' },
                ];
                resolve(users.find(u => u.id == id)); // Comparación débil para ID
            }, 200);
        });
        // Real:
        // const response = await fetch(`/api/users/${id}`);
        // if (!response.ok) throw new Error(`Failed to fetch user ${id}`);
        // return await response.json();
    };

    const createUser = async (userData) => {
        // Simulación:
        return new Promise(resolve => {
            setTimeout(() => {
                console.log("Simulating user creation:", userData);
                resolve({ success: true, message: 'User created (simulated)' });
            }, 400);
        });
        // Real:
        // const response = await fetch('/api/users', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(userData)
        // });
        // if (!response.ok) throw new Error('Failed to create user');
        // return await response.json();
    };

    const updateUser = async (id, userData) => {
        // Simulación:
        return new Promise(resolve => {
            setTimeout(() => {
                console.log(`Simulating user update for ID ${id}:`, userData);
                resolve({ success: true, message: 'User updated (simulated)' });
            }, 400);
        });
        // Real:
        // const response = await fetch(`/api/users/${id}`, {
        //     method: 'PUT',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(userData)
        // });
        // if (!response.ok) throw new Error(`Failed to update user ${id}`);
        // return await response.json();
    };

    const deleteUserApi = async (id) => { // Renombrada para no chocar con la función deleteUser
        // Simulación:
        return new Promise(resolve => {
            setTimeout(() => {
                console.log(`Simulating user deletion for ID ${id}`);
                resolve({ success: true, message: 'User deleted (simulated)' });
            }, 300);
        });
        // Real:
        // const response = await fetch(`/api/users/${id}`, {
        //     method: 'DELETE'
        // });
        // if (!response.ok) throw new Error(`Failed to delete user ${id}`);
        // return await response.json(); // La API podría retornar un mensaje de éxito
    };

    // --- Carga de Usuarios ---

    const loadUsers = async () => {
        usersTableBody.innerHTML = '<tr><td colspan="6" class="loading-message">Cargando usuarios...</td></tr>';
        try {
            const users = await fetchUsers(); // Usar la función simulada con fetch

            if (users.length === 0) {
                usersTableBody.innerHTML = '<tr><td colspan="6">No hay usuarios registrados.</td></tr>';
                return;
            }

            usersTableBody.innerHTML = users.map(user => `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.username}</td>
                    <td>${user.email || 'N/A'}</td>
                    <td>${user.role}</td>
                    <td>
                        <button class="btn btn--info btn--small edit-user-btn" data-id="${user.id}">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn--danger btn--small delete-user-btn" data-id="${user.id}" data-name="${user.name}">
                            <i class="fas fa-trash-alt"></i> Eliminar
                        </button>
                    </td>
                </tr>
            `).join('');

            // Asignar event listeners a los botones generados
            document.querySelectorAll('.edit-user-btn').forEach(button => {
                button.addEventListener('click', (e) => editUser(e.currentTarget.dataset.id));
            });
            document.querySelectorAll('.delete-user-btn').forEach(button => {
                button.addEventListener('click', (e) => 
                    showConfirmModal(e.currentTarget.dataset.name, e.currentTarget.dataset.id)
                );
            });

        } catch (error) {
            console.error("Error al cargar usuarios:", error);
            usersTableBody.innerHTML = '<tr><td colspan="6" class="error-message">Error al cargar usuarios.</td></tr>';
            if (showAlert) showAlert('Error al cargar usuarios.', 'error');
        }
    };

    // --- Añadir/Editar Usuario ---

    const editUser = async (id) => {
        try {
            const user = await fetchUserById(id); // Usar la función simulada con fetch

            if (user) {
                userIdInput.value = user.id;
                nameInput.value = user.name;
                usernameInput.value = user.username;
                emailInput.value = user.email || '';
                roleSelect.value = user.role;
                
                showForm(true); // Mostrar el formulario en modo edición
            } else {
                if (showAlert) showAlert(`Usuario con ID ${id} no encontrado.`, 'error');
            }
        } catch (error) {
            console.error(`Error al cargar usuario ${id} para edición:`, error);
            if (showAlert) showAlert(`Error al cargar usuario ${id}.`, 'error');
        }
    };

    const saveUser = async (event) => {
        event.preventDefault(); // Previene la recarga de la página

        const id = userIdInput.value;
        const userData = {
            name: nameInput.value,
            username: usernameInput.value,
            email: emailInput.value,
            role: roleSelect.value,
        };

        if (passwordInput.value) { // Solo añadir password si no está vacío
            userData.password = passwordInput.value;
        }

        try {
            if (id) {
                await updateUser(id, userData); // Usar la función simulada con fetch
                if (showAlert) showAlert('Usuario actualizado exitosamente.', 'success');
            } else {
                await createUser(userData); // Usar la función simulada con fetch
                if (showAlert) showAlert('Usuario creado exitosamente.', 'success');
            }
            hideForm();
            loadUsers(); // Recargar la lista de usuarios
        } catch (error) {
            console.error("Error al guardar usuario:", error);
            if (showAlert) showAlert('Error al guardar usuario.', 'error');
        }
    };

    // --- Eliminar Usuario ---

    const deleteUser = async () => {
        if (!userToDeleteId) return;

        try {
            await deleteUserApi(userToDeleteId); // Usar la función simulada con fetch
            if (showAlert) showAlert('Usuario eliminado exitosamente.', 'success');
            hideConfirmModal();
            loadUsers(); // Recargar la lista de usuarios
        } catch (error) {
            console.error(`Error al eliminar usuario ${userToDeleteId}:`, error);
            if (showAlert) showAlert('Error al eliminar usuario.', 'error');
        }
    };

    // --- Event Listeners ---
    addUserBtn.addEventListener('click', () => showForm(false));
    cancelUserFormBtn.addEventListener('click', hideForm);
    userForm.addEventListener('submit', saveUser);

    // Modal de confirmación
    closeModalBtn.addEventListener('click', hideConfirmModal);
    cancelDeleteBtn.addEventListener('click', hideConfirmModal);
    confirmDeleteBtn.addEventListener('click', deleteUser);

    // Cargar usuarios al inicializar el controlador
    loadUsers();
};