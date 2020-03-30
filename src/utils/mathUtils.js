import * as turf from '@turf/turf';

/**
 * Get a random floating point number between `min` and `max`.
 *
 * @param {number} min - min number
 * @param {number} max - max number
 * @return {number} a random floating point number
 */
function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Get a random integer between `min` and `max`.
 *
 * @param {number} min - min number
 * @param {number} max - max number
 * @return {number} a random integer
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Get a random boolean value.
 *
 * @return {boolean} a random true/false
 */
function getRandomBool() {
    return Math.random() >= 0.5;
}

function getTargetObjectInfo(obj, targetField, deepField) {
    if (!targetField || !deepField) return {};
    const keysList = Object.keys(obj);
    const targetObj = keysList.find(key => key === targetField);
    const deepObj = keysList.find(key => key === deepField);
    if (targetObj) {
        return obj[targetObj];
    }
    if (!targetObj && deepObj) {
        return getTargetObjectInfo(obj[deepObj], targetField, deepField);
    }
    return {};
}

function calcRegularPolygon(center, radius, steps = 6) {
    console.log('rd: calcRegularPolygon -> center,radius', center, radius);
    const options = { steps, units: 'kilometers', properties: { name: 'polygon' } };
    const circle = turf.circle(center, radius, options);
    return circle;
}

export default {
    getRandomFloat,
    getRandomInt,
    getRandomBool,
    getTargetObjectInfo,
    calcRegularPolygon,
};
