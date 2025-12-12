const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Usuario = sequelize.define('Usuario', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        apellido: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        telefono: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        tipoUsuario: {
            type: DataTypes.ENUM('proveedor', 'cliente', 'admin'),
            allowNull: false,
            defaultValue: 'cliente',
        },
        verificado: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        activo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    }, {
        tableName: 'usuarios',
        timestamps: true,
    });

    Usuario.associate = (models) => {
        // Un proveedor puede tener múltiples salones
        Usuario.hasMany(models.Salon, {
            foreignKey: 'usuarioId',
            as: 'salones',
        });

        // Un proveedor puede ofrecer múltiples servicios
        Usuario.hasMany(models.Servicio, {
            foreignKey: 'usuarioId',
            as: 'servicios',
        });

        // Un cliente puede tener múltiples consultas
        Usuario.hasMany(models.Consulta, {
            foreignKey: 'clienteId',
            as: 'consultasRealizadas',
        });

        // Un proveedor puede recibir múltiples consultas
        Usuario.hasMany(models.Consulta, {
            foreignKey: 'proveedorId',
            as: 'consultasRecibidas',
        });
    };

    return Usuario;
};
