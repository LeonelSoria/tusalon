const API_URL = 'http://localhost:3000/api/v1';
let currentUser = null;
let currentFavoritoTipo = 'salon';

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    if (!AuthManager.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    loadProfile();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Profile navigation
    document.querySelectorAll('.profile-nav-item').forEach(item => {
        item.addEventListener('click', function () {
            if (this.classList.contains('profile-nav-logout')) return;

            const section = this.dataset.section;
            switchSection(section);
        });
    });

    // Profile form
    document.getElementById('profileForm').addEventListener('submit', handleProfileSubmit);

    // Password form
    document.getElementById('passwordForm').addEventListener('submit', handlePasswordSubmit);

    // Password strength indicator
    document.getElementById('newPassword').addEventListener('input', updatePasswordStrength);

    // Favorites tabs
    document.querySelectorAll('.favorites-tab').forEach(tab => {
        tab.addEventListener('click', function () {
            const tipo = this.dataset.tipo;
            switchFavoritosTab(tipo);
        });
    });
}

// Switch between sections
function switchSection(sectionName) {
    // Update nav
    document.querySelectorAll('.profile-nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === sectionName) {
            item.classList.add('active');
        }
    });

    // Update sections
    document.querySelectorAll('.profile-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`section-${sectionName}`).classList.add('active');

    // Load data if needed
    if (sectionName === 'favoritos') {
        loadFavoritos(currentFavoritoTipo);
    }
}

// Load user profile
async function loadProfile() {
    try {
        const response = await AuthManager.fetchWithAuth(`${API_URL}/perfil`);
        const result = await response.json();

        if (result.success) {
            currentUser = result.data;
            displayProfile(currentUser);
        } else {
            throw new Error(result.error || 'Error al cargar perfil');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar el perfil');
    }
}

// Display profile data
function displayProfile(user) {
    document.getElementById('nombre').value = user.nombre || '';
    document.getElementById('apellido').value = user.apellido || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('telefono').value = user.telefono || '';

    // Update nav user name
    document.getElementById('navUserName').textContent = user.nombre || 'Mi Perfil';

    // Update user type badge
    const badge = document.getElementById('userTypeBadge');
    badge.textContent = user.tipoUsuario === 'proveedor' ? 'Proveedor' : 'Cliente';
    badge.classList.add(user.tipoUsuario === 'proveedor' ? 'badge-provider' : 'badge-client');

    // Display avatar if exists
    if (user.foto) {
        const avatarDiv = document.getElementById('avatarPreview');
        avatarDiv.innerHTML = `<img src="${user.foto}" alt="Avatar">`;
    }
}

// Handle profile form submission
async function handleProfileSubmit(e) {
    e.preventDefault();

    const data = {
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
        email: document.getElementById('email').value,
        telefono: document.getElementById('telefono').value
    };

    try {
        const response = await AuthManager.fetchWithAuth(`${API_URL}/perfil`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            currentUser = result.data;
            alert('Perfil actualizado correctamente');
            displayProfile(currentUser);
        } else {
            throw new Error(result.error || 'Error al actualizar perfil');
        }
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Error al actualizar el perfil');
    }
}

// Handle password form submission
async function handlePasswordSubmit(e) {
    e.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validations
    if (newPassword !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
    }

    if (newPassword.length < 8) {
        alert('La nueva contraseña debe tener al menos 8 caracteres');
        return;
    }

    try {
        const response = await AuthManager.fetchWithAuth(`${API_URL}/perfil/cambiar-contrasena`, {
            method: 'POST',
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const result = await response.json();

        if (result.success) {
            alert('Contraseña cambiada correctamente');
            document.getElementById('passwordForm').reset();
            document.getElementById('passwordStrength').className = 'password-strength';
        } else {
            throw new Error(result.error || 'Error al cambiar contraseña');
        }
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Error al cambiar la contraseña');
    }
}

// Update password strength indicator
function updatePasswordStrength(e) {
    const password = e.target.value;
    const strengthDiv = document.getElementById('passwordStrength');

    let strength = 'weak';
    if (password.length >= 8) {
        if (password.match(/[a-z]/) && password.match(/[A-Z]/) && password.match(/[0-9]/) && password.match(/[^a-zA-Z0-9]/)) {
            strength = 'strong';
        } else if (password.match(/[a-zA-Z]/) && password.match(/[0-9]/)) {
            strength = 'medium';
        }
    }

    strengthDiv.className = `password-strength strength-${strength}`;
}

// Handle file selection for avatar
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
        alert('Por favor selecciona una imagen');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB');
        return;
    }

    const reader = new FileReader();
    reader.onload = async function (e) {
        const base64 = e.target.result;

        // Preview
        const avatarDiv = document.getElementById('avatarPreview');
        avatarDiv.innerHTML = `<img src="${base64}" alt="Avatar">`;

        // Upload
        try {
            const response = await AuthManager.fetchWithAuth(`${API_URL}/perfil/foto`, {
                method: 'POST',
                body: JSON.stringify({ fotoBase64: base64 })
            });

            const result = await response.json();

            if (result.success) {
                alert('Foto actualizada correctamente');
            } else {
                throw new Error(result.error || 'Error al subir foto');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al subir la foto');
        }
    };

    reader.readAsDataURL(file);
}

// Switch favorites tabs
function switchFavoritosTab(tipo) {
    currentFavoritoTipo = tipo;

    // Update tabs
    document.querySelectorAll('.favorites-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tipo === tipo) {
            tab.classList.add('active');
        }
    });

    loadFavoritos(tipo);
}

// Load favorites
async function loadFavoritos(tipo) {
    const grid = document.getElementById('favoritesGrid');
    grid.innerHTML = '<div class="loading">Cargando...</div>';

    try {
        const response = await AuthManager.fetchWithAuth(`${API_URL}/favoritos?tipo=${tipo}`);
        const result = await response.json();

        if (result.success) {
            displayFavoritos(result.data.filter(fav => fav.tipoItem === tipo));
        } else {
            throw new Error(result.error || 'Error al cargar favoritos');
        }
    } catch (error) {
        console.error('Error:', error);
        grid.innerHTML = '<div class="empty-state">Error al cargar favoritos</div>';
    }
}

// Display favorites
function displayFavoritos(favoritos) {
    const grid = document.getElementById('favoritesGrid');

    // Update counts
    document.getElementById('salonesCount').textContent = favoritos.filter(f => f.tipoItem === 'salon').length;
    document.getElementById('serviciosCount').textContent = favoritos.filter(f => f.tipoItem === 'servicio').length;

    if (favoritos.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
                <p>No tienes favoritos aún</p>
                <a href="${currentFavoritoTipo === 'salon' ? 'salones.html' : 'servicios.html'}" class="btn btn-primary">
                    Explorar ${currentFavoritoTipo === 'salon' ? 'Salones' : 'Servicios'}
                </a>
            </div>
        `;
        return;
    }

    grid.innerHTML = favoritos.map(fav => {
        const item = fav.item;
        if (!item) return '';

        const imagen = item.imagenes ? JSON.parse(item.imagenes)[0] : 'https://via.placeholder.com/400x300';
        const precio = item.precioDesde ? `$${parseInt(item.precioDesde).toLocaleString('es-AR')}` : 'Consultar';
        const detailUrl = fav.tipoItem === 'salon' ? `salon-detail.html?id=${item.id}` : `servicio-detail.html?id=${item.id}`;

        return `
            <div class="favorite-card">
                <div class="favorite-image">
                    <img src="${imagen}" alt="${item.nombre}">
                    <button class="favorite-remove" onclick="removeFavorite('${fav.id}')">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                        </svg>
                    </button>
                </div>
                <div class="favorite-info">
                    <h3><a href="${detailUrl}">${item.nombre}</a></h3>
                    <p class="favorite-location">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        ${item.ciudad}, ${item.provincia}
                    </p>
                    <p class="favorite-price">${precio}</p>
                </div>
            </div>
        `;
    }).join('');
}

// Remove from favorites
async function removeFavorite(favoritoId) {
    if (!confirm('¿Eliminar de favoritos?')) return;

    try {
        const response = await AuthManager.fetchWithAuth(`${API_URL}/favoritos/${favoritoId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            loadFavoritos(currentFavoritoTipo);
        } else {
            throw new Error(result.error || 'Error al eliminar favorito');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar favorito');
    }
}

// Logout
function logout() {
    AuthManager.logout();
    window.location.href = 'index.html';
}
