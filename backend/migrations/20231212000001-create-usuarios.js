'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Crear tabla de usuarios
        await queryInterface.createTable('usuarios', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            nombre: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            apellido: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            telefono: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            tipoUsuario: {
                type: Sequelize.ENUM('proveedor', 'cliente', 'admin'),
                allowNull: false,
                defaultValue: 'cliente',
            },
            verificado: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
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

        // Crear índice en email para búsquedas rápidas
        await queryInterface.addIndex('usuarios', ['email']);
        await queryInterface.addIndex('usuarios', ['tipoUsuario']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('usuarios');
    }
};
