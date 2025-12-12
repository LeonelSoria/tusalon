/**
 * Utilidades geográficas para cálculos de distancia y búsquedas por radio
 */

/**
 * Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine
 * @param {number} lat1 - Latitud del primer punto
 * @param {number} lon1 - Longitud del primer punto
 * @param {number} lat2 - Latitud del segundo punto
 * @param {number} lon2 - Longitud del segundo punto
 * @returns {number} Distancia en kilómetros
 */
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = R * c;

    return distancia;
}

/**
 * Convierte grados a radianes
 */
function toRad(grados) {
    return grados * Math.PI / 180;
}

/**
 * Valida coordenadas geográficas
 * @param {number} latitud - Latitud a validar
 * @param {number} longitud - Longitud a validar
 * @returns {boolean} true si las coordenadas son válidas
 */
function validarCoordenadas(latitud, longitud) {
    if (typeof latitud !== 'number' || typeof longitud !== 'number') {
        return false;
    }

    if (latitud < -90 || latitud > 90) {
        return false;
    }

    if (longitud < -180 || longitud > 180) {
        return false;
    }

    return true;
}

/**
 * Calcula un bounding box (caja delimitadora) para optimizar búsquedas por radio
 * @param {number} latitud - Latitud central
 * @param {number} longitud - Longitud central
 * @param {number} radioKm - Radio en kilómetros
 * @returns {object} Objeto con minLat, maxLat, minLon, maxLon
 */
function calcularBoundingBox(latitud, longitud, radioKm) {
    const R = 6371; // Radio de la Tierra en km

    // Calcular deltas en grados
    const latDelta = (radioKm / R) * (180 / Math.PI);
    const lonDelta = (radioKm / R) * (180 / Math.PI) / Math.cos(latitud * Math.PI / 180);

    return {
        minLat: latitud - latDelta,
        maxLat: latitud + latDelta,
        minLon: longitud - lonDelta,
        maxLon: longitud + lonDelta,
    };
}

/**
 * Crea una consulta SQL para búsqueda por radio
 * @param {number} latitud - Latitud central
 * @param {number} longitud - Longitud central
 * @param {number} radioKm - Radio en kilómetros
 * @returns {string} Fragmento de SQL para WHERE
 */
function crearConsultaRadio(latitud, longitud, radioKm) {
    const box = calcularBoundingBox(latitud, longitud, radioKm);

    return `
    latitud BETWEEN ${box.minLat} AND ${box.maxLat}
    AND longitud BETWEEN ${box.minLon} AND ${box.maxLon}
  `;
}

/**
 * Filtra resultados por distancia exacta (para usar después de la búsqueda por bounding box)
 * @param {Array} resultados - Array de objetos con latitud y longitud
 * @param {number} latitudCentral - Latitud del punto central
 * @param {number} longitudCentral - Longitud del punto central
 * @param {number} radioKm - Radio máximo en kilómetros
 * @returns {Array} Resultados filtrados con campo 'distancia' agregado
 */
function filtrarPorDistancia(resultados, latitudCentral, longitudCentral, radioKm) {
    return resultados
        .map(item => {
            const distancia = calcularDistancia(
                latitudCentral,
                longitudCentral,
                parseFloat(item.latitud),
                parseFloat(item.longitud)
            );

            return {
                ...item.toJSON ? item.toJSON() : item,
                distancia: Math.round(distancia * 100) / 100, // Redondear a 2 decimales
            };
        })
        .filter(item => item.distancia <= radioKm)
        .sort((a, b) => a.distancia - b.distancia);
}

module.exports = {
    calcularDistancia,
    validarCoordenadas,
    calcularBoundingBox,
    crearConsultaRadio,
    filtrarPorDistancia,
};
