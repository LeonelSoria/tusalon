'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('favoritos', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false
            },
            usuarioId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'usuarios',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            tipoItem: {
                type: Sequelize.ENUM('salon', 'servicio'),
                allowNull: false
            },
            itemId: {
                type: Sequelize.UUID,
                allowNull: false
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Crear índice único compuesto para evitar favoritos duplicados
        await queryInterface.addIndex('favoritos', ['usuarioId', 'tipoItem', 'itemId'], {
            unique: true,
            name: 'favoritos_unique_idx'
        });

        // Crear índices para búsquedas rápidas
        await queryInterface.addIndex('favoritos', ['usuarioId']);
        await queryInterface.addIndex('favoritos', ['tipoItem']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('favoritos');
    }
};
