'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('servicios', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            usuarioId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'usuarios',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            tipo: {
                type: Sequelize.ENUM(
                    'fotografia',
                    'dj',
                    'wedding_planner',
                    'catering',
                    'decoracion',
                    'musica',
                    'video',
                    'flores',
                    'transporte',
                    'animacion',
                    'otros'
                ),
                allowNull: false,
            },
            nombre: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            descripcion: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            ciudad: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            provincia: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            pais: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'Argentina',
            },
            latitud: {
                type: Sequelize.DECIMAL(10, 8),
                allowNull: false,
            },
            longitud: {
                type: Sequelize.DECIMAL(11, 8),
                allowNull: false,
            },
            precioDesde: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
            },
            imagenes: {
                type: Sequelize.JSON,
                allowNull: true,
                defaultValue: [],
            },
            contactoEmail: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            contactoTelefono: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            sitioWeb: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            activo: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });

        // Índices para búsquedas
        await queryInterface.addIndex('servicios', ['usuarioId']);
        await queryInterface.addIndex('servicios', ['tipo']);
        await queryInterface.addIndex('servicios', ['ciudad']);
        await queryInterface.addIndex('servicios', ['latitud', 'longitud']);
        await queryInterface.addIndex('servicios', ['activo']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('servicios');
    }
};
