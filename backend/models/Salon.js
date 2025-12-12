const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Salon = sequelize.define('Salon', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        usuarioId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'usuarios',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        direccion: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        ciudad: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        provincia: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        codigoPostal: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        pais: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Argentina',
        },
        latitud: {
            type: DataTypes.DECIMAL(10, 8),
            allowNull: false,
            validate: {
                min: -90,
                max: 90,
            },
        },
        longitud: {
            type: DataTypes.DECIMAL(11, 8),
            allowNull: false,
            validate: {
                min: -180,
                max: 180,
            },
        },
        capacidad: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 0,
            },
        },
        precioBase: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            validate: {
                min: 0,
            },
        },
        imagenes: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [],
        },
        serviciosIncluidos: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [],
        },
        activo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    }, {
        tableName: 'salones',
        timestamps: true,
    });

    Salon.associate = (models) => {
        // Un salón pertenece a un usuario (proveedor)
        Salon.belongsTo(models.Usuario, {
            foreignKey: 'usuarioId',
            as: 'proveedor',
        });

        // Un salón puede tener múltiples consultas
        Salon.hasMany(models.Consulta, {
            foreignKey: 'salonId',
            as: 'consultas',
        });
    };

    return Salon;
};
