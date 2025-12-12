const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Consulta = sequelize.define('Consulta', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        clienteId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'usuarios',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        proveedorId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'usuarios',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        tipoConsulta: {
            type: DataTypes.ENUM('salon', 'servicio'),
            allowNull: false,
        },
        salonId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'salones',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        },
        servicioId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'servicios',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        },
        fechaEvento: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        numeroInvitados: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 1,
            },
        },
        mensaje: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        estado: {
            type: DataTypes.ENUM('pendiente', 'contactado', 'confirmado', 'cancelado', 'completado'),
            allowNull: false,
            defaultValue: 'pendiente',
        },
        respuestaProveedor: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        fechaRespuesta: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        tableName: 'consultas',
        timestamps: true,
    });

    Consulta.associate = (models) => {
        // Una consulta pertenece a un cliente
        Consulta.belongsTo(models.Usuario, {
            foreignKey: 'clienteId',
            as: 'cliente',
        });

        // Una consulta es recibida por un proveedor
        Consulta.belongsTo(models.Usuario, {
            foreignKey: 'proveedorId',
            as: 'proveedor',
        });

        // Una consulta puede estar relacionada con un salón
        Consulta.belongsTo(models.Salon, {
            foreignKey: 'salonId',
            as: 'salon',
        });

        // Una consulta puede estar relacionada con un servicio
        Consulta.belongsTo(models.Servicio, {
            foreignKey: 'servicioId',
            as: 'servicio',
        });
    };

    return Consulta;
};
