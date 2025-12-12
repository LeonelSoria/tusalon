const bcrypt = require('bcryptjs');
const db = require('../models');
const { Usuario, Salon, Servicio, Consulta } = db;

async function seedDatabase() {
    try {
        console.log('🌱 Iniciando carga de datos de ejemplo...');

        // Limpiar base de datos (opcional - comentar si no quieres borrar datos existentes)
        await Consulta.destroy({ where: {}, force: true });
        await Salon.destroy({ where: {}, force: true });
        await Servicio.destroy({ where: {}, force: true });
        await Usuario.destroy({ where: {}, force: true });

        // Crear usuarios de ejemplo
        const hashedPassword = await bcrypt.hash('password123', 10);

        const usuarios = await Usuario.bulkCreate([
            {
                email: 'proveedor1@tusalon.com',
                password: hashedPassword,
                nombre: 'María',
                apellido: 'González',
                telefono: '+54 11 1234-5678',
                tipoUsuario: 'proveedor',
                verificado: true,
                activo: true,
            },
            {
                email: 'proveedor2@tusalon.com',
                password: hashedPassword,
                nombre: 'Carlos',
                apellido: 'Rodríguez',
                telefono: '+54 11 8765-4321',
                tipoUsuario: 'proveedor',
                verificado: true,
                activo: true,
            },
            {
                email: 'cliente1@tusalon.com',
                password: hashedPassword,
                nombre: 'Ana',
                apellido: 'Martínez',
                telefono: '+54 11 5555-1111',
                tipoUsuario: 'cliente',
                verificado: true,
                activo: true,
            },
            {
                email: 'admin@tusalon.com',
                password: hashedPassword,
                nombre: 'Admin',
                apellido: 'Sistema',
                telefono: '+54 11 9999-0000',
                tipoUsuario: 'admin',
                verificado: true,
                activo: true,
            },
        ]);

        console.log('✅ Usuarios creados:', usuarios.length);

        // Crear salones de ejemplo (Buenos Aires)
        const salones = await Salon.bulkCreate([
            {
                usuarioId: usuarios[0].id,
                nombre: 'Salón Elegancia',
                descripcion: 'Salón de eventos premium con vista panorámica de la ciudad. Ideal para bodas y eventos corporativos.',
                direccion: 'Av. Libertador 2250',
                ciudad: 'Buenos Aires',
                provincia: 'Buenos Aires',
                codigoPostal: 'C1425AAJ',
                pais: 'Argentina',
                latitud: -34.5831, // Recoleta, Buenos Aires
                longitud: -58.3916,
                capacidad: 200,
                precioBase: 150000.00,
                imagenes: ['https://ejemplo.com/salon1-1.jpg', 'https://ejemplo.com/salon1-2.jpg'],
                serviciosIncluidos: ['Catering', 'Música', 'Decoración básica'],
                activo: true,
            },
            {
                usuarioId: usuarios[0].id,
                nombre: 'Jardín de Eventos Los Jazmines',
                descripcion: 'Hermoso jardín al aire libre perfecto para ceremonias y recepciones.',
                direccion: 'Calle Falsa 123',
                ciudad: 'Buenos Aires',
                provincia: 'Buenos Aires',
                codigoPostal: 'C1000',
                pais: 'Argentina',
                latitud: -34.6037, // Centro de Buenos Aires
                longitud: -58.3816,
                capacidad: 150,
                precioBase: 120000.00,
                imagenes: ['https://ejemplo.com/salon2-1.jpg'],
                serviciosIncluidos: ['Jardín', 'Estacionamiento'],
                activo: true,
            },
            {
                usuarioId: usuarios[1].id,
                nombre: 'Grand Palace',
                descripcion: 'Salón de lujo con instalaciones de primera categoría.',
                direccion: 'Av. Corrientes 5000',
                ciudad: 'Buenos Aires',
                provincia: 'Buenos Aires',
                codigoPostal: 'C1414',
                pais: 'Argentina',
                latitud: -34.6131, // Almagro, Buenos Aires
                longitud: -58.4278,
                capacidad: 300,
                precioBase: 250000.00,
                imagenes: ['https://ejemplo.com/salon3-1.jpg', 'https://ejemplo.com/salon3-2.jpg', 'https://ejemplo.com/salon3-3.jpg'],
                serviciosIncluidos: ['Catering premium', 'Valet parking', 'Decoración', 'Iluminación'],
                activo: true,
            },
        ]);

        console.log('✅ Salones creados:', salones.length);

        // Crear servicios de ejemplo
        const servicios = await Servicio.bulkCreate([
            {
                usuarioId: usuarios[1].id,
                tipo: 'fotografia',
                nombre: 'Foto Arte Eventos',
                descripcion: 'Fotografía profesional para bodas y eventos. 15 años de experiencia.',
                ciudad: 'Buenos Aires',
                provincia: 'Buenos Aires',
                pais: 'Argentina',
                latitud: -34.5975,
                longitud: -58.3832,
                precioDesde: 80000.00,
                imagenes: ['https://ejemplo.com/foto1.jpg'],
                contactoEmail: 'info@fotoarte.com',
                contactoTelefono: '+54 11 2222-3333',
                sitioWeb: 'https://fotoarte.com',
                activo: true,
            },
            {
                usuarioId: usuarios[1].id,
                tipo: 'dj',
                nombre: 'DJ Sound Pro',
                descripcion: 'DJ profesional con equipamiento de última generación.',
                ciudad: 'Buenos Aires',
                provincia: 'Buenos Aires',
                pais: 'Argentina',
                latitud: -34.6158,
                longitud: -58.4333,
                precioDesde: 50000.00,
                imagenes: ['https://ejemplo.com/dj1.jpg'],
                contactoEmail: 'dj@soundpro.com',
                contactoTelefono: '+54 11 4444-5555',
                activo: true,
            },
            {
                usuarioId: usuarios[0].id,
                tipo: 'wedding_planner',
                nombre: 'Eventos Perfectos',
                descripcion: 'Organización integral de bodas. Hacemos realidad tu sueño.',
                ciudad: 'Buenos Aires',
                provincia: 'Buenos Aires',
                pais: 'Argentina',
                latitud: -34.5889,
                longitud: -58.3956,
                precioDesde: 120000.00,
                imagenes: ['https://ejemplo.com/wedding1.jpg', 'https://ejemplo.com/wedding2.jpg'],
                contactoEmail: 'info@eventosperfectos.com',
                contactoTelefono: '+54 11 6666-7777',
                sitioWeb: 'https://eventosperfectos.com',
                activo: true,
            },
            {
                usuarioId: usuarios[1].id,
                tipo: 'catering',
                nombre: 'Catering Deluxe',
                descripcion: 'Servicio de catering gourmet para eventos exclusivos.',
                ciudad: 'Buenos Aires',
                provincia: 'Buenos Aires',
                pais: 'Argentina',
                latitud: -34.6092,
                longitud: -58.3842,
                precioDesde: 5000.00,
                imagenes: ['https://ejemplo.com/catering1.jpg'],
                contactoEmail: 'info@cateringdeluxe.com',
                contactoTelefono: '+54 11 8888-9999',
                activo: true,
            },
        ]);

        console.log('✅ Servicios creados:', servicios.length);

        // Crear consultas de ejemplo
        const consultas = await Consulta.bulkCreate([
            {
                clienteId: usuarios[2].id,
                proveedorId: usuarios[0].id,
                tipoConsulta: 'salon',
                salonId: salones[0].id,
                fechaEvento: '2024-06-15',
                numeroInvitados: 180,
                mensaje: 'Hola, me interesa el salón para mi boda en junio. ¿Está disponible? ¿Qué incluye el precio base?',
                estado: 'pendiente',
            },
            {
                clienteId: usuarios[2].id,
                proveedorId: usuarios[1].id,
                tipoConsulta: 'servicio',
                servicioId: servicios[0].id,
                fechaEvento: '2024-06-15',
                numeroInvitados: 180,
                mensaje: 'Necesito cotización para fotografía de boda. ¿Cuántas horas incluye el paquete?',
                estado: 'contactado',
                respuestaProveedor: 'Hola! El paquete incluye 8 horas de cobertura. Te envío más detalles por email.',
                fechaRespuesta: new Date(),
            },
        ]);

        console.log('✅ Consultas creadas:', consultas.length);

        console.log('\n🎉 ¡Datos de ejemplo cargados exitosamente!');
        console.log('\n📋 Resumen:');
        console.log(`   - ${usuarios.length} usuarios`);
        console.log(`   - ${salones.length} salones`);
        console.log(`   - ${servicios.length} servicios`);
        console.log(`   - ${consultas.length} consultas`);
        console.log('\n🔑 Credenciales de prueba:');
        console.log('   Email: proveedor1@tusalon.com | Password: password123');
        console.log('   Email: cliente1@tusalon.com | Password: password123');
        console.log('   Email: admin@tusalon.com | Password: password123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error al cargar datos:', error);
        process.exit(1);
    }
}

// Ejecutar el seeder
seedDatabase();
