// TuSalón - Main JavaScript  
// Version: 2025-12-23-16:36 - Fixed TypeError and added debug logging
const API_URL = 'http://localhost:3000/api/v1';

// ========================================
// Search Functionality
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize search tabs
    initializeSearchTabs();

    // Load featured venues on homepage
    if (document.getElementById('featuredVenues')) {
        loadFeaturedVenues();
    }

    // Handle search form submission
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }
});

// Initialize search tabs switching
function initializeSearchTabs() {
    const tabs = document.querySelectorAll('.search-tab');
    const capacityInput = document.getElementById('capacityInput');
    const serviceTypeInput = document.getElementById('serviceTypeInput');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');

            // Show/hide appropriate inputs
            const tabType = tab.dataset.tab;
            if (tabType === 'salones') {
                capacityInput.classList.remove('hidden');
                serviceTypeInput.classList.add('hidden');
            } else {
                capacityInput.classList.add('hidden');
                serviceTypeInput.classList.remove('hidden');
            }
        });
    });
}

// Handle search form submission
async function handleSearch(e) {
    e.preventDefault();

    const activeTab = document.querySelector('.search-tab.active');
    const searchType = activeTab.dataset.tab;
    const location = document.getElementById('searchLocation').value;

    if (searchType === 'salones') {
        const capacity = document.getElementById('searchCapacity').value;
        window.location.href = `salones.html?location=${encodeURIComponent(location)}&capacity=${capacity}`;
    } else {
        const serviceType = document.getElementById('searchServiceType').value;
        window.location.href = `servicios.html?location=${encodeURIComponent(location)}&tipo=${serviceType}`;
    }
}

// ========================================
// Load Featured Venues
// ========================================

async function loadFeaturedVenues() {
    const container = document.getElementById('featuredVenues');

    try {
        const response = await fetch(`${API_URL}/salones`);
        if (!response.ok) throw new Error('Error al cargar salones');

        const result = await response.json();
        const salones = result.data || result; // Handle both {data: []} and direct array

        if (!salones || salones.length === 0) {
            container.innerHTML = '<p class="loading">No hay salones disponibles</p>';
            return;
        }

        // Show only first 3 venues for featured section
        const featured = salones.slice(0, 3);
        container.innerHTML = featured.map(salon => createVenueCard(salon)).join('');

    } catch (error) {
        console.error('Error loading venues:', error);
        container.innerHTML = `
            <div class="loading">
                <p>⚠️ No se pudieron cargar los salones.</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">Asegúrate de que el servidor backend esté corriendo en http://localhost:3000</p>
            </div>
        `;
    }
}

// Create venue card HTML
function createVenueCard(salon) {
    const precio = salon.precioBase ? `$${Number(salon.precioBase).toLocaleString('es-AR')}` : 'Consultar';
    const capacidad = salon.capacidad || 'No especificada';
    const proveedorNombre = salon.proveedor ? `${salon.proveedor.nombre} ${salon.proveedor.apellido || ''}` : 'Proveedor';

    // Get first image or use placeholder
    const imagen = (salon.imagenes && salon.imagenes.length > 0) ? salon.imagenes[0] : '';
    const imagenHtml = imagen ?
        `<img src="${imagen}" alt="${salon.nombre}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect width=%22400%22 height=%22300%22 fill=%22%23E5E5E5%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2224%22 fill=%22%236B6B6B%22%3E${encodeURIComponent(salon.nombre)}%3C/text%3E%3C/svg%3E'">` :
        `<div style="width: 100%; height: 100%; background: linear-gradient(135deg, #E5E5E5 0%, #6B6B6B 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; font-weight: 600;">${salon.nombre.substring(0, 2)}</div>`;

    return `
        <a href="salon-detail.html?id=${salon.id}" class="venue-card" style="text-decoration: none; color: inherit;">
            <div class="venue-image">
                ${imagenHtml}
            </div>
            <div class="venue-info">
                <h3 class="venue-title">${salon.nombre}</h3>
                <p class="venue-location">
                    <svg class="icon" style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    ${salon.ciudad}, ${salon.provincia}
                </p>
                
                <div class="venue-details">
                    <div class="venue-detail">
                        <svg class="icon" style="width: 18px; height: 18px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                        ${capacidad} personas
                    </div>
                </div>
                
                <div class="venue-price">
                    ${precio}
                    <span class="venue-price-label">desde</span>
                </div>
            </div>
        </a>
    `;
}

// ========================================
// Load All Venues (for salones.html page)
// ========================================

async function loadAllVenues(filters = {}) {
    const container = document.getElementById('venuesContainer');
    if (!container) return;

    container.innerHTML = '<div class="loading">Cargando salones...</div>';

    try {
        let url = `${API_URL}/salones`;
        const response = await fetch(url);

        if (!response.ok) throw new Error('Error al cargar salones');

        const result = await response.json();
        let salones = result.data || result; // Handle both {data: []} and direct array

        // Apply client-side filters
        if (filters.location) {
            const location = filters.location.toLowerCase();
            salones = salones.filter(s =>
                s.ciudad.toLowerCase().includes(location) ||
                s.provincia.toLowerCase().includes(location)
            );
        }

        if (filters.capacity) {
            salones = salones.filter(s => s.capacidad >= parseInt(filters.capacity));
        }

        if (salones.length === 0) {
            container.innerHTML = '<p class="loading">No se encontraron salones con los criterios seleccionados</p>';
            return;
        }

        container.innerHTML = salones.map(salon => createVenueCard(salon)).join('');

    } catch (error) {
        console.error('Error loading venues:', error);
        container.innerHTML = `
            <div class="loading">
                <p>⚠️ No se pudieron cargar los salones.</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">Asegúrate de que el servidor backend esté corriendo en http://localhost:3000</p>
            </div>
        `;
    }
}

// ========================================
// Load All Services (for servicios.html page)
// ========================================

async function loadAllServices(filters = {}) {
    const container = document.getElementById('servicesContainer');
    if (!container) return;

    container.innerHTML = '<div class="loading">Cargando servicios...</div>';

    try {
        let url = `${API_URL}/servicios`;
        const response = await fetch(url);

        if (!response.ok) throw new Error('Error al cargar servicios');

        const result = await response.json();
        let servicios = result.data || result; // Handle both {data: []} and direct array

        // Apply client-side filters
        if (filters.location) {
            const location = filters.location.toLowerCase();
            servicios = servicios.filter(s =>
                s.ciudad.toLowerCase().includes(location) ||
                s.provincia.toLowerCase().includes(location)
            );
        }

        if (filters.tipo) {
            servicios = servicios.filter(s => s.tipo === filters.tipo);
        }

        if (servicios.length === 0) {
            container.innerHTML = '<p class="loading">No se encontraron servicios con los criterios seleccionados</p>';
            return;
        }

        console.log('Servicios cargados:', servicios.length);
        console.log('Primer servicio:', servicios[0]);

        container.innerHTML = servicios.map(servicio => createServiceCard(servicio)).join('');

    } catch (error) {
        console.error('Error loading services:', error);
        container.innerHTML = `
            <div class="loading">
                <p>⚠️ No se pudieron cargar los servicios.</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">Asegúrate de que el servidor backend esté corriendo en http://localhost:3000</p>
            </div>
        `;
    }
}

// Create service card HTML
function createServiceCard(servicio) {
    const precio = servicio.precioDesde ? `$${Number(servicio.precioDesde).toLocaleString('es-AR')}` : 'Consultar';
    const proveedorNombre = servicio.proveedor ? `${servicio.proveedor.nombre} ${servicio.proveedor.apellido || ''}` : 'Proveedor';

    // Translate service type to Spanish
    const tipoTraducido = translateServiceType(servicio.tipo);

    // Get first image or use placeholder based on service type
    const imagen = (servicio.imagenes && servicio.imagenes.length > 0) ? servicio.imagenes[0] : '';
    const imagenHtml = imagen ?
        `<img src="${imagen}" alt="${servicio.nombre}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect width=%22400%22 height=%22300%22 fill=%22%23E5E5E5%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2224%22 fill=%22%236B6B6B%22%3E${encodeURIComponent(servicio.nombre)}%3C/text%3E%3C/svg%3E'">` :
        `<div style="width: 100%; height: 100%; background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; font-weight: 600;">${servicio.nombre.substring(0, 2)}</div>`;

    return `
        <a href="servicio-detail.html?id=${servicio.id}" class="venue-card" style="text-decoration: none; color: inherit;">
            <div class="venue-image">
                ${imagenHtml}
                <div style="position: absolute; top: 1rem; right: 1rem; background: var(--color-gold); color: var(--color-black); padding: 0.5rem 1rem; border-radius: 999px; font-weight: 600; font-size: 0.85rem; text-transform: uppercase;">
                    ${tipoTraducido}
                </div>
            </div>
            <div class="venue-info">
                <h3 class="venue-title">${servicio.nombre}</h3>
                <p class="venue-location">
                    <svg class="icon" style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    ${servicio.ciudad}, ${servicio.provincia}
                </p>
                
                <p style="color: var(--color-gray); margin: var(--spacing-sm) 0; font-size: 0.9rem;">
                    ${servicio.descripcion ? servicio.descripcion.substring(0, 100) + '...' : 'Servicio profesional para tu evento'}
                </p>
                
                <div class="venue-price">
                    ${precio}
                    <span class="venue-price-label">desde</span>
                </div>
            </div>
        </a>
    `;
}

// Translate service type from English to Spanish
function translateServiceType(tipo) {
    const translations = {
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
    return translations[tipo] || tipo;
}

// ========================================
// Utility: Get URL Parameters
// ========================================

function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        location: params.get('location') || '',
        capacity: params.get('capacity') || '',
        tipo: params.get('tipo') || ''
    };
}
