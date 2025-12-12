'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('salones', {
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
            nombre: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            descripcion: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            direccion: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            ciudad: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            provincia: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            codigoPostal: {
                type: Sequelize.STRING,
                allowNull: true,
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
            capacidad: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            precioBase: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
            },
            imagenes: {
                type: Sequelize.JSON,
                allowNull: true,
                defaultValue: [],
            },
            serviciosIncluidos: {
                type: Sequelize.JSON,
                allowNull: true,
                defaultValue: [],
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

        // Índices para búsquedas geográficas y por usuario
        await queryInterface.addIndex('salones', ['usuarioId']);
        await queryInterface.addIndex('salones', ['ciudad']);
        await queryInterface.addIndex('salones', ['latitud', 'longitud']);
        await queryInterface.addIndex('salones', ['activo']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('salones');
    }
};
