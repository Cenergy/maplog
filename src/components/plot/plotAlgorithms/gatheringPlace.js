import plotUtil from '../util/plotUtil';
import { HALF_PI, FITTING_COUNT } from '../util/plotConstants';

function generateGatheringPlace(option) {
    const { coordinates } = option;
    console.log('rd: generateGatheringPlace -> coordinates', coordinates);
    if (coordinates.length < 2) {
        return null;
    }

    let points = null;
    if (coordinates.length === 2) {
        const mid = plotUtil.mid(coordinates[0], coordinates[1]);
        const d = plotUtil.getDistance(coordinates[0], mid) / 0.9;
        const pnt = plotUtil.getThirdPoint(coordinates[0], mid, HALF_PI, d, true);
        points = [coordinates[0], pnt, coordinates[1]];
    } else {
        points = coordinates;
    }

    const mid = plotUtil.mid(points[0], points[2]);
    points.push(mid, points[0], points[1]);

    let normals = [];
    for (let i = 0; i < points.length - 2; i += 1) {
        const pnt1 = points[i];
        const pnt2 = points[i + 1];
        const pnt3 = points[i + 2];
        const normalPoints = plotUtil.getBisectorNormals(0.4, pnt1, pnt2, pnt3);
        normals = normals.concat(normalPoints);
    }

    const count = normals.length;
    normals = [normals[count - 1]].concat(normals.slice(0, count - 1));

    const pList = [];
    for (let i = 0; i < points.length - 2; i += 1) {
        const pnt1 = points[i];
        const pnt2 = points[i + 1];
        pList.push(pnt1);
        for (let t = 0; t <= FITTING_COUNT; t += 1) {
            const pnt = plotUtil.getCubicValue(t / FITTING_COUNT, pnt1, normals[i * 2], normals[i * 2 + 1], pnt2);
            pList.push(pnt);
        }
        pList.push(pnt2);
    }
    return pList;
}

export default { generateGatheringPlace };
