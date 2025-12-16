// Dashboard.js - Provider Dashboard Management
const API_URL = 'http://localhost:3000/api/v1';

let currentEditingSalon = null;
let currentEditingService = null;

// Check authentication and redirect if not provider
document.addEventListener('DOMContentLoaded', () => {
    if (!AuthManager.isAuthenticated()) {
        alert('Debes iniciar sesión para acceder al dashboard');
        window.location.href = 'login.html';
        return;
    }

    if (!AuthManager.isProvider()) {
        alert('Solo los proveedores pueden acceder al dashboard');
        window.location.href = 'index.html';
        return;
    }

    // Initialize dashboard
    initializeTabs();
    loadSalones();
    loadServicios();

    // Setup form handlers
    document.getElementById('salonForm').addEventListener('submit', handleSalonSubmit);
    document.getElementById('serviceForm').addEventListener('submit', handleServiceSubmit);
});

// ========================================
// Tab Management
// ========================================

function initializeTabs() {
    const tabs = document.querySelectorAll('.dashboard-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.dashboard-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

// ========================================
// Load Salones
// ========================================

async function loadSalones() {
    const loadingEl = document.getElementById('salonesLoading');
    const gridEl = document.getElementById('salonesGrid');

    try {
        const response = await AuthManager.fetchWithAuth(`${API_URL}/salones/usuario/mis-publicaciones`);
        const result = await response.json();

        loadingEl.style.display = 'none';

        if (result.success && result.data.length > 0) {
            gridEl.innerHTML = result.data.map(salon => createSalonCard(salon)).join('');
        } else {
            gridEl.innerHTML = '<div class="empty-state">No tienes salones publicados aún. ¡Agrega tu primer salón!</div>';
        }
    } catch (error) {
        console.error('Error loading salones:', error);
        loadingEl.style.display = 'none';
        gridEl.innerHTML = '<div class="error-state">Error al cargar los salones</div>';
    }
}

function createSalonCard(salon) {
    const precio = salon.precioBase ? `$${parseInt(salon.precioBase).toLocaleString('es-AR')}` : 'Sin precio';
    const imagenes = salon.imagenes ? JSON.parse(salon.imagenes) : [];
    const imageUrl = imagenes.length > 0 ? imagenes[0] : 'https://via.placeholder.com/400x300?text=Sin+imagen';

    return `
        <div class="dashboard-card">
            <div class="dashboard-card-image">
                <img src="${imageUrl}" alt="${salon.nombre}" onerror="this.src='https://via.placeholder.com/400x300?text=Sin+imagen'">
                ${!salon.activo ? '<div class="card-badge inactive">Inactivo</div>' : ''}
            </div>
            <div class="dashboard-card-content">
                <h3>${salon.nombre}</h3>
                <p class="card-location">${salon.ciudad}, ${salon.provincia}</p>
                <div class="card-details">
                    <span><strong>Capacidad:</strong> ${salon.capacidad || 'N/A'} personas</span>
                    <span><strong>Precio:</strong> ${precio}</span>
                </div>
                <div class="card-actions">
                    <button class="btn-icon" onclick="viewSalon(${salon.id})" title="Ver">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                    </button>
                    <button class="btn-icon" onclick="editSalon(${salon.id})" title="Editar">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteSalon(${salon.id}, '${salon.nombre}')" title="Eliminar">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ========================================
// Load Servicios
// ========================================

async function loadServicios() {
    const loadingEl = document.getElementById('serviciosLoading');
    const gridEl = document.getElementById('serviciosGrid');

    try {
        const response = await AuthManager.fetchWithAuth(`${API_URL}/servicios/usuario/mis-publicaciones`);
        const result = await response.json();

        loadingEl.style.display = 'none';

        if (result.success && result.data.length > 0) {
            gridEl.innerHTML = result.data.map(servicio => createServiceCard(servicio)).join('');
        } else {
            gridEl.innerHTML = '<div class="empty-state">No tienes servicios publicados aún. ¡Agrega tu primer servicio!</div>';
        }
    } catch (error) {
        console.error('Error loading servicios:', error);
        loadingEl.style.display = 'none';
        gridEl.innerHTML = '<div class="error-state">Error al cargar los servicios</div>';
    }
}

function createServiceCard(servicio) {
    const precio = servicio.precioDesde ? `$${parseInt(servicio.precioDesde).toLocaleString('es-AR')}` : 'Sin precio';
    const imagenes = servicio.imagenes ? JSON.parse(servicio.imagenes) : [];
    const imageUrl = imagenes.length > 0 ? imagenes[0] : 'https://via.placeholder.com/400x300?text=Sin+imagen';

    const tipoLabels = {
        'fotografia': 'Fotografía',
        'dj': 'DJ',
        'wedding_planner': 'Wedding Planner',
        'catering': 'Catering',
        'decoracion': 'Decoración',
        'musica': 'Música',
        'video': 'Video',
        'flores': 'Flores',
        'transporte': 'Transporte',
        'animacion': 'Animación',
        'otros': 'Otros'
    };

    return `
        <div class="dashboard-card">
            <div class="dashboard-card-image">
                <img src="${imageUrl}" alt="${servicio.nombre}" onerror="this.src='https://via.placeholder.com/400x300?text=Sin+imagen'">
                <div class="card-badge">${tipoLabels[servicio.tipo] || servicio.tipo}</div>
                ${!servicio.activo ? '<div class="card-badge inactive">Inactivo</div>' : ''}
            </div>
            <div class="dashboard-card-content">
                <h3>${servicio.nombre}</h3>
                <p class="card-location">${servicio.ciudad}, ${servicio.provincia}</p>
                <div class="card-details">
                    <span><strong>Precio:</strong> ${precio}</span>
                </div>
                <div class="card-actions">
                    <button class="btn-icon" onclick="viewService(${servicio.id})" title="Ver">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                    </button>
                    <button class="btn-icon" onclick="editService(${servicio.id})" title="Editar">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteService(${servicio.id}, '${servicio.nombre}')" title="Eliminar">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ========================================
// Salon Modal Functions
// ========================================

function showAddSalonForm() {
    currentEditingSalon = null;
    document.getElementById('salonModalTitle').textContent = 'Agregar Salón';
    document.getElementById('salonForm').reset();
    document.getElementById('salonId').value = '';
    document.getElementById('salonModal').classList.add('active');
}

function closeSalonModal() {
    document.getElementById('salonModal').classList.remove('active');
    document.getElementById('salonForm').reset();
    currentEditingSalon = null;
}

async function editSalon(id) {
    try {
        const response = await fetch(`${API_URL}/salones/${id}`);
        const result = await response.json();

        if (result.success) {
            const salon = result.data;
            currentEditingSalon = salon;

            document.getElementById('salonModalTitle').textContent = 'Editar Salón';
            document.getElementById('salonId').value = salon.id;
            document.getElementById('salonNombre').value = salon.nombre || '';
            document.getElementById('salonDescripcion').value = salon.descripcion || '';
            document.getElementById('salonDireccion').value = salon.direccion || '';
            document.getElementById('salonCiudad').value = salon.ciudad || '';
            document.getElementById('salonProvincia').value = salon.provincia || '';
            document.getElementById('salonPais').value = salon.pais || 'Argentina';
            document.getElementById('salonCodigoPostal').value = salon.codigoPostal || '';
            document.getElementById('salonLatitud').value = salon.latitud || '';
            document.getElementById('salonLongitud').value = salon.longitud || '';
            document.getElementById('salonCapacidad').value = salon.capacidad || '';
            document.getElementById('salonPrecioBase').value = salon.precioBase || '';

            // Handle images array
            if (salon.imagenes) {
                const imagenes = JSON.parse(salon.imagenes);
                document.getElementById('salonImagenes').value = imagenes.join(', ');
            }

            // Handle servicios array
            if (salon.serviciosIncluidos) {
                const servicios = JSON.parse(salon.serviciosIncluidos);
                document.getElementById('salonServicios').value = servicios.join(', ');
            }

            document.getElementById('salonModal').classList.add('active');
        }
    } catch (error) {
        console.error('Error loading salon:', error);
        alert('Error al cargar el salón');
    }
}

async function handleSalonSubmit(e) {
    e.preventDefault();

    const formData = {
        nombre: document.getElementById('salonNombre').value,
        descripcion: document.getElementById('salonDescripcion').value,
        direccion: document.getElementById('salonDireccion').value,
        ciudad: document.getElementById('salonCiudad').value,
        provincia: document.getElementById('salonProvincia').value,
        pais: document.getElementById('salonPais').value,
        codigoPostal: document.getElementById('salonCodigoPostal').value,
        latitud: parseFloat(document.getElementById('salonLatitud').value),
        longitud: parseFloat(document.getElementById('salonLongitud').value),
        capacidad: parseInt(document.getElementById('salonCapacidad').value) || null,
        precioBase: parseFloat(document.getElementById('salonPrecioBase').value) || null,
    };

    // Process images
    const imagenesText = document.getElementById('salonImagenes').value.trim();
    if (imagenesText) {
        formData.imagenes = JSON.stringify(imagenesText.split(',').map(url => url.trim()));
    }

    // Process servicios
    const serviciosText = document.getElementById('salonServicios').value.trim();
    if (serviciosText) {
        formData.serviciosIncluidos = JSON.stringify(serviciosText.split(',').map(s => s.trim()));
    }

    try {
        const salonId = document.getElementById('salonId').value;
        const url = salonId ? `${API_URL}/salones/${salonId}` : `${API_URL}/salones`;
        const method = salonId ? 'PUT' : 'POST';

        const response = await AuthManager.fetchWithAuth(url, {
            method: method,
            body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (result.success) {
            alert(salonId ? 'Salón actualizado correctamente' : 'Salón creado correctamente');
            closeSalonModal();
            loadSalones();
        } else {
            throw new Error(result.error || 'Error al guardar el salón');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar el salón: ' + error.message);
    }
}

async function deleteSalon(id, nombre) {
    if (!confirm(`¿Estás seguro de que deseas eliminar el salón "${nombre}"?`)) {
        return;
    }

    try {
        const response = await AuthManager.fetchWithAuth(`${API_URL}/salones/${id}`, {
            method: 'DELETE',
        });

        const result = await response.json();

        if (result.success) {
            alert('Salón eliminado correctamente');
            loadSalones();
        } else {
            throw new Error(result.error || 'Error al eliminar el salón');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el salón: ' + error.message);
    }
}

function viewSalon(id) {
    window.open(`salon-detail.html?id=${id}`, '_blank');
}

// ========================================
// Service Modal Functions
// ========================================

function showAddServiceForm() {
    currentEditingService = null;
    document.getElementById('serviceModalTitle').textContent = 'Agregar Servicio';
    document.getElementById('serviceForm').reset();
    document.getElementById('serviceId').value = '';
    document.getElementById('serviceModal').classList.add('active');
}

function closeServiceModal() {
    document.getElementById('serviceModal').classList.remove('active');
    document.getElementById('serviceForm').reset();
    currentEditingService = null;
}

async function editService(id) {
    try {
        const response = await fetch(`${API_URL}/servicios/${id}`);
        const result = await response.json();

        if (result.success) {
            const servicio = result.data;
            currentEditingService = servicio;

            document.getElementById('serviceModalTitle').textContent = 'Editar Servicio';
            document.getElementById('serviceId').value = servicio.id;
            document.getElementById('serviceTipo').value = servicio.tipo || '';
            document.getElementById('serviceNombre').value = servicio.nombre || '';
            document.getElementById('serviceDescripcion').value = servicio.descripcion || '';
            document.getElementById('serviceCiudad').value = servicio.ciudad || '';
            document.getElementById('serviceProvincia').value = servicio.provincia || '';
            document.getElementById('servicePais').value = servicio.pais || 'Argentina';
            document.getElementById('serviceLatitud').value = servicio.latitud || '';
            document.getElementById('serviceLongitud').value = servicio.longitud || '';
            document.getElementById('servicePrecio').value = servicio.precioDesde || '';
            document.getElementById('serviceExperiencia').value = servicio.experiencia || '';

            // Handle images array
            if (servicio.imagenes) {
                const imagenes = JSON.parse(servicio.imagenes);
                document.getElementById('serviceImagenes').value = imagenes.join(', ');
            }

            document.getElementById('serviceModal').classList.add('active');
        }
    } catch (error) {
        console.error('Error loading service:', error);
        alert('Error al cargar el servicio');
    }
}

async function handleServiceSubmit(e) {
    e.preventDefault();

    const formData = {
        tipo: document.getElementById('serviceTipo').value,
        nombre: document.getElementById('serviceNombre').value,
        descripcion: document.getElementById('serviceDescripcion').value,
        ciudad: document.getElementById('serviceCiudad').value,
        provincia: document.getElementById('serviceProvincia').value,
        pais: document.getElementById('servicePais').value,
        latitud: parseFloat(document.getElementById('serviceLatitud').value),
        longitud: parseFloat(document.getElementById('serviceLongitud').value),
        precioDesde: parseFloat(document.getElementById('servicePrecio').value) || null,
        experiencia: document.getElementById('serviceExperiencia').value || null,
    };

    // Process images
    const imagenesText = document.getElementById('serviceImagenes').value.trim();
    if (imagenesText) {
        formData.imagenes = JSON.stringify(imagenesText.split(',').map(url => url.trim()));
    }

    try {
        const serviceId = document.getElementById('serviceId').value;
        const url = serviceId ? `${API_URL}/servicios/${serviceId}` : `${API_URL}/servicios`;
        const method = serviceId ? 'PUT' : 'POST';

        const response = await AuthManager.fetchWithAuth(url, {
            method: method,
            body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (result.success) {
            alert(serviceId ? 'Servicio actualizado correctamente' : 'Servicio creado correctamente');
            closeServiceModal();
            loadServicios();
        } else {
            throw new Error(result.error || 'Error al guardar el servicio');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar el servicio: ' + error.message);
    }
}

async function deleteService(id, nombre) {
    if (!confirm(`¿Estás seguro de que deseas eliminar el servicio "${nombre}"?`)) {
        return;
    }

    try {
        const response = await AuthManager.fetchWithAuth(`${API_URL}/servicios/${id}`, {
            method: 'DELETE',
        });

        const result = await response.json();

        if (result.success) {
            alert('Servicio eliminado correctamente');
            loadServicios();
        } else {
            throw new Error(result.error || 'Error al eliminar el servicio');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el servicio: ' + error.message);
    }
}

function viewService(id) {
    window.open(`servicio-detail.html?id=${id}`, '_blank');
}

// Close modal when clicking outside
window.onclick = function (event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}
