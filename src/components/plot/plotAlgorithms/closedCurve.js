import plotUtil from '../util/plotUtil';
import { FITTING_COUNT } from '../util/plotConstants';

function generateClosedCurve(option) {
    const { coordinates } = option;
    if (coordinates.length < 2) {
        return null;
    }

    if (coordinates.length === 2) {
        return coordinates;
    }

    const pnts = coordinates;
    pnts.push(pnts[0], pnts[1]);
    let normals = [];
    for (let i = 0; i < pnts.length - 2; i += 1) {
        const normalPoints = plotUtil.getBisectorNormals(0.3, pnts[i], pnts[i + 1], pnts[i + 2]);
        normals = normals.concat(normalPoints);
    }
    const count = normals.length;
    normals = [normals[count - 1]].concat(normals.slice(0, count - 1));

    const pList = [];
    for (let i = 0; i < pnts.length - 2; i += 1) {
        const pnt1 = pnts[i];
        const pnt2 = pnts[i + 1];
        pList.push(pnt1);
        for (let t = 0; t <= FITTING_COUNT; t += 1) {
            const pnt = plotUtil.getCubicValue(t / FITTING_COUNT, pnt1, normals[i * 2], normals[i * 2 + 1], pnt2);
            pList.push(pnt);
        }
        pList.push(pnt2);
    }
    return [pList][0];
}

export default { generateClosedCurve };
