'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('consultas', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            clienteId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'usuarios',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            proveedorId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'usuarios',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            tipoConsulta: {
                type: Sequelize.ENUM('salon', 'servicio'),
                allowNull: false,
            },
            salonId: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'salones',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            servicioId: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'servicios',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            fechaEvento: {
                type: Sequelize.DATEONLY,
                allowNull: true,
            },
            numeroInvitados: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            mensaje: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            estado: {
                type: Sequelize.ENUM('pendiente', 'contactado', 'confirmado', 'cancelado', 'completado'),
                allowNull: false,
                defaultValue: 'pendiente',
            },
            respuestaProveedor: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            fechaRespuesta: {
                type: Sequelize.DATE,
                allowNull: true,
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
        await queryInterface.addIndex('consultas', ['clienteId']);
        await queryInterface.addIndex('consultas', ['proveedorId']);
        await queryInterface.addIndex('consultas', ['salonId']);
        await queryInterface.addIndex('consultas', ['servicioId']);
        await queryInterface.addIndex('consultas', ['estado']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('consultas');
    }
};
