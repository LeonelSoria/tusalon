const { Op } = require('sequelize');
const { calcularBoundingBox, filtrarPorDistancia } = require('./geoUtils');

/**
 * Buscar salones o servicios dentro de un radio
 * @param {Model} Model - Modelo de Sequelize (Salon o Servicio)
 * @param {number} latitud - Latitud central
 * @param {number} longitud - Longitud central
 * @param {number} radioKm - Radio en kilómetros
 * @param {object} filtrosAdicionales - Filtros adicionales opcionales
 * @returns {Promise<Array>} Array de resultados con distancia
 */
async function buscarPorRadio(Model, latitud, longitud, radioKm, filtrosAdicionales = {}) {
    const box = calcularBoundingBox(latitud, longitud, radioKm);

    const where = {
        latitud: {
            [Op.between]: [box.minLat, box.maxLat],
        },
        longitud: {
            [Op.between]: [box.minLon, box.maxLon],
        },
        activo: true,
        ...filtrosAdicionales,
    };

    const resultados = await Model.findAll({ where });

    // Filtrar por distancia exacta y agregar campo de distancia
    return filtrarPorDistancia(resultados, latitud, longitud, radioKm);
}

/**
 * Buscar salones con filtros combinados
 * @param {Model} SalonModel - Modelo Salon
 * @param {object} filtros - Objeto con filtros: latitud, longitud, radioKm, capacidadMin, precioMax, ciudad
 * @returns {Promise<Array>} Array de salones filtrados
 */
async function buscarSalones(SalonModel, filtros) {
    const { latitud, longitud, radioKm, capacidadMin, precioMax, ciudad } = filtros;

    const filtrosAdicionales = {};

    if (capacidadMin) {
        filtrosAdicionales.capacidad = {
            [Op.gte]: capacidadMin,
        };
    }

    if (precioMax) {
        filtrosAdicionales.precioBase = {
            [Op.lte]: precioMax,
        };
    }

    if (ciudad) {
        filtrosAdicionales.ciudad = {
            [Op.iLike]: `%${ciudad}%`,
        };
    }

    if (latitud && longitud && radioKm) {
        return await buscarPorRadio(SalonModel, latitud, longitud, radioKm, filtrosAdicionales);
    } else {
        // Si no hay búsqueda por radio, buscar con filtros normales
        return await SalonModel.findAll({
            where: {
                activo: true,
                ...filtrosAdicionales,
            },
        });
    }
}

/**
 * Buscar servicios con filtros combinados
 * @param {Model} ServicioModel - Modelo Servicio
 * @param {object} filtros - Objeto con filtros: latitud, longitud, radioKm, tipo, precioMax, ciudad
 * @returns {Promise<Array>} Array de servicios filtrados
 */
async function buscarServicios(ServicioModel, filtros) {
    const { latitud, longitud, radioKm, tipo, precioMax, ciudad } = filtros;

    const filtrosAdicionales = {};

    if (tipo) {
        filtrosAdicionales.tipo = tipo;
    }

    if (precioMax) {
        filtrosAdicionales.precioDesde = {
            [Op.lte]: precioMax,
        };
    }

    if (ciudad) {
        filtrosAdicionales.ciudad = {
            [Op.iLike]: `%${ciudad}%`,
        };
    }

    if (latitud && longitud && radioKm) {
        return await buscarPorRadio(ServicioModel, latitud, longitud, radioKm, filtrosAdicionales);
    } else {
        return await ServicioModel.findAll({
            where: {
                activo: true,
                ...filtrosAdicionales,
            },
        });
    }
}

module.exports = {
    buscarPorRadio,
    buscarSalones,
    buscarServicios,
};
