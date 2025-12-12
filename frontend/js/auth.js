// Authentication Manager
const AUTH_TOKEN_KEY = 'tusalon_auth_token';
const AUTH_USER_KEY = 'tusalon_user';

class AuthManager {
    // Get token from localStorage
    static getToken() {
        return localStorage.getItem(AUTH_TOKEN_KEY);
    }

    // Set token in localStorage
    static setToken(token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
    }

    // Remove token from localStorage
    static removeToken() {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
    }

    // Get user from localStorage
    static getUser() {
        const userStr = localStorage.getItem(AUTH_USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    }

    // Set user in localStorage
    static setUser(user) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    }

    // Check if user is authenticated
    static isAuthenticated() {
        return !!this.getToken();
    }

    // Check if user is provider
    static isProvider() {
        const user = this.getUser();
        return user && (user.tipoUsuario === 'proveedor' || user.tipoUsuario === 'admin');
    }

    // Check if user is client
    static isClient() {
        const user = this.getUser();
        return user && user.tipoUsuario === 'cliente';
    }

    // Login
    static async login(email, password) {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al iniciar sesión');
            }

            this.setToken(data.token);
            this.setUser(data.user);

            return { success: true, user: data.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Register
    static async register(userData) {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.errors?.[0]?.msg || 'Error al registrarse');
            }

            this.setToken(data.token);
            this.setUser(data.user);

            return { success: true, user: data.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Logout
    static logout() {
        this.removeToken();
        window.location.href = 'index.html';
    }

    // Get current user from API
    static async getCurrentUser() {
        try {
            const token = this.getToken();
            if (!token) return null;

            const response = await fetch(`${API_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                this.removeToken();
                return null;
            }

            const data = await response.json();
            this.setUser(data.user);
            return data.user;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    // Make authenticated API request
    static async fetchWithAuth(url, options = {}) {
        const token = this.getToken();

        if (!token) {
            throw new Error('No autenticado');
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        };

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (response.status === 401) {
            this.logout();
            throw new Error('Sesión expirada');
        }

        return response;
    }
}

// Update navbar based on auth state
function updateNavbar() {
    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;

    if (AuthManager.isAuthenticated()) {
        const user = AuthManager.getUser();
        navActions.innerHTML = `
      ${AuthManager.isProvider() ? '<a href="dashboard.html" class="btn btn-outline">Dashboard</a>' : ''}
      <div class="user-menu">
        <button class="btn btn-primary" id="userMenuBtn">
          ${user.nombre}
          <svg class="icon" style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        <div class="user-dropdown hidden" id="userDropdown">
          <a href="perfil.html">Mi Perfil</a>
          ${AuthManager.isProvider() ? '<a href="dashboard.html">Mis Publicaciones</a>' : ''}
          <a href="mis-consultas.html">Mis Consultas</a>
          <a href="#" id="logoutBtn">Cerrar Sesión</a>
        </div>
      </div>
    `;

        // Toggle dropdown
        const userMenuBtn = document.getElementById('userMenuBtn');
        const userDropdown = document.getElementById('userDropdown');
        if (userMenuBtn) {
            userMenuBtn.addEventListener('click', () => {
                userDropdown.classList.toggle('hidden');
            });
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                AuthManager.logout();
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-menu')) {
                userDropdown?.classList.add('hidden');
            }
        });
    } else {
        navActions.innerHTML = `
      <a href="login.html" class="btn btn-outline">Ingresar</a>
      <a href="register.html" class="btn btn-primary">Registrarse</a>
    `;
    }
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
});
