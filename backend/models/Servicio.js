const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Servicio = sequelize.define('Servicio', {
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
        tipo: {
            type: DataTypes.ENUM(
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
            type: DataTypes.STRING,
            allowNull: false,
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        ciudad: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        provincia: {
            type: DataTypes.STRING,
            allowNull: false,
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
        precioDesde: {
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
        contactoEmail: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isEmail: true,
            },
        },
        contactoTelefono: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        sitioWeb: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isUrl: true,
            },
        },
        activo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    }, {
        tableName: 'servicios',
        timestamps: true,
    });

    Servicio.associate = (models) => {
        // Un servicio pertenece a un usuario (proveedor)
        Servicio.belongsTo(models.Usuario, {
            foreignKey: 'usuarioId',
            as: 'proveedor',
        });

        // Un servicio puede tener múltiples consultas
        Servicio.hasMany(models.Consulta, {
            foreignKey: 'servicioId',
            as: 'consultas',
        });
    };

    return Servicio;
};
