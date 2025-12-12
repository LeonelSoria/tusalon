# TuSalón - Frontend

Interfaz web elegante para la plataforma TuSalón. Diseño premium con colores blanco, negro y dorado.

## 🎨 Características

- ✨ Diseño premium inspirado en casamientos.com.ar
- 🎨 Paleta de colores: Blanco, Negro y Dorado
- 📱 Completamente responsive
- ⚡ Conexión con API backend
- 🔍 Búsqueda de salones y servicios
- 🗺️ Integración con búsqueda geográfica

## 🚀 Ejecutar Localmente

### Opción 1: Servidor Local Simple

Usa cualquier servidor HTTP local. Ejemplos:

**Con Python:**
```bash
cd frontend

# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

**Con Node.js (http-server):**
```bash
npm install -g http-server
cd frontend
http-server -p 8080
```

**Con PHP:**
```bash
cd frontend
php -S localhost:8080
```

Luego abre: `http://localhost:8080`

### Opción 2: Abrir directo en navegador

También puedes abrir `index.html` directamente en tu navegador, pero algunas funciones pueden no trabajar correctamente por restricciones de CORS.

## ⚙️ Configuración

### Conectar con el Backend

Asegúrate de que el backend esté corriendo en `http://localhost:3000`

Si tu backend está en otra URL, edita `js/main.js`:

```javascript
const API_URL = 'http://localhost:3000/api/v1';  // Cambia esto
```

## 📄 Páginas

- **index.html** - Página principal con hero y búsqueda
- **salones.html** - Listado de todos los salones
- **servicios.html** - Listado de todos los servicios

## 🎨 Paleta de Colores

- **Dorado**: `#D4AF37` - Acentos y elementos destacados
- **Negro**: `#000000` - Texto principal y fondos
- **Blanco**: `#FFFFFF` - Fondos y texto claro
- **Gris**: Variantes para detalles

## 🔧 Estructura

```
frontend/
├── index.html          # Página principal
├── salones.html        # Página de salones
├── servicios.html      # Página de servicios
├── css/
│   └── style.css       # Estilos premium
└── js/
    └── main.js         # Lógica y API
```

## 📝 Próximas Mejoras

- [ ] Detalle individual de salones y servicios
- [ ] Sistema de login y registro
- [ ] Panel de proveedor para gestionar publicaciones
- [ ] Integración con Google Maps
- [ ] Sistema de favoritos
- [ ] Chat en vivo con proveedores
- [ ] Sistema de reseñas y calificaciones

## 🌐 URLs de Prueba

Una vez ejecutando:

- **Home**: http://localhost:8080/
- **Salones**: http://localhost:8080/salones.html
- **Servicios**: http://localhost:8080/servicios.html

---

**Diseño premium para eventos especiales** ✨
