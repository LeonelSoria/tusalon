'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Favorito extends Model {
        static associate(models) {
            // Relación con Usuario
            Favorito.belongsTo(models.Usuario, {
                foreignKey: 'usuarioId',
                as: 'usuario'
            });

            // Relación polimórfica con Salon
            Favorito.belongsTo(models.Salon, {
                foreignKey: 'itemId',
                constraints: false,
                as: 'salon'
            });

            // Relación polimórfica con Servicio
            Favorito.belongsTo(models.Servicio, {
                foreignKey: 'itemId',
                constraints: false,
                as: 'servicio'
            });
        }

        // Método helper para obtener el item favorito (salon o servicio)
        async getItem() {
            if (this.tipoItem === 'salon') {
                return await this.getSalon();
            } else if (this.tipoItem === 'servicio') {
                return await this.getServicio();
            }
            return null;
        }
    }

    Favorito.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        usuarioId: {
            type: DataTypes.UUID,
            allowNull: false,
            validate: {
                notNull: { msg: 'Usuario ID es requerido' },
                notEmpty: { msg: 'Usuario ID no puede estar vacío' }
            }
        },
        tipoItem: {
            type: DataTypes.ENUM('salon', 'servicio'),
            allowNull: false,
            validate: {
                notNull: { msg: 'Tipo de item es requerido' },
                isIn: {
                    args: [['salon', 'servicio']],
                    msg: 'Tipo de item debe ser "salon" o "servicio"'
                }
            }
        },
        itemId: {
            type: DataTypes.UUID,
            allowNull: false,
            validate: {
                notNull: { msg: 'Item ID es requerido' },
                notEmpty: { msg: 'Item ID no puede estar vacío' }
            }
        }
    }, {
        sequelize,
        modelName: 'Favorito',
        tableName: 'favoritos',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['usuarioId', 'tipoItem', 'itemId'],
                name: 'favoritos_unique_idx'
            }
        ]
    });

    return Favorito;
};
