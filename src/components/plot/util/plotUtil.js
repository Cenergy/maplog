/* eslint-disable prefer-destructuring */
/* eslint-disable no-restricted-properties */
import { ZERO_TOLERANCE, FITTING_COUNT } from './plotConstants';

function getDistance(pnt1, pnt2) {
    return Math.sqrt(Math.pow(pnt1[0] - pnt2[0], 2) + Math.pow(pnt1[1] - pnt2[1], 2));
}

function getIntersectPoint(pntA, pntB, pntC, pntD) {
    let e;
    let f;
    let y;
    let x;
    if (pntA[1] === pntB[1]) {
        f = (pntD[0] - pntC[0]) / (pntD[1] - pntC[1]);
        x = f * (pntA[1] - pntC[1]) + pntC[0];
        y = pntA[1];
        return [x, y];
    }
    if (pntC[1] === pntD[1]) {
        e = (pntB[0] - pntA[0]) / (pntB[1] - pntA[1]);
        x = e * (pntC[1] - pntA[1]) + pntA[0];
        y = pntC[1];
        return [x, y];
    }
    e = (pntB[0] - pntA[0]) / (pntB[1] - pntA[1]);
    f = (pntD[0] - pntC[0]) / (pntD[1] - pntC[1]);
    y = (e * pntA[1] - pntA[0] - f * pntC[1] + pntC[0]) / (e - f);
    x = e * y - e * pntA[1] + pntA[0];
    return [x, y];
}

function isClockWise(pnt1, pnt2, pnt3) {
    return (pnt3[1] - pnt1[1]) * (pnt2[0] - pnt1[0]) > (pnt2[1] - pnt1[1]) * (pnt3[0] - pnt1[0]);
}

function getCircleCenterOfThreePoints(pnt1, pnt2, pnt3) {
    const pntA = [(pnt1[0] + pnt2[0]) / 2, (pnt1[1] + pnt2[1]) / 2];
    const pntB = [pntA[0] - pnt1[1] + pnt2[1], pntA[1] + pnt1[0] - pnt2[0]];
    const pntC = [(pnt1[0] + pnt3[0]) / 2, (pnt1[1] + pnt3[1]) / 2];
    const pntD = [pntC[0] - pnt1[1] + pnt3[1], pntC[1] + pnt1[0] - pnt3[0]];
    return getIntersectPoint(pntA, pntB, pntC, pntD);
}

function getAzimuth(startPnt, endPnt) {
    let azimuth;
    const angle = Math.asin(Math.abs(endPnt[1] - startPnt[1]) / getDistance(startPnt, endPnt));
    if (endPnt[1] >= startPnt[1] && endPnt[0] >= startPnt[0]) {
        azimuth = angle + Math.PI;
    } else if (endPnt[1] >= startPnt[1] && endPnt[0] < startPnt[0]) {
        azimuth = Math.PI * 2 - angle;
    } else if (endPnt[1] < startPnt[1] && endPnt[0] < startPnt[0]) {
        azimuth = angle;
    } else if (endPnt[1] < startPnt[1] && endPnt[0] >= startPnt[0]) {
        azimuth = Math.PI - angle;
    }
    return azimuth;
}

function getArcPoints(center, radius, startAngle, endAngle) {
    let x;
    let y;
    const pnts = [];
    let angleDiff = endAngle - startAngle;
    angleDiff = angleDiff < 0 ? angleDiff + Math.PI * 2 : angleDiff;
    for (let i = 0; i <= 100; i += 1) {
        const angle = startAngle + (angleDiff * i) / 100;
        x = center[0] + radius * Math.cos(angle);
        y = center[1] + radius * Math.sin(angle);
        pnts.push([x, y]);
    }
    return pnts;
}

// 计算对称点
function mid(pnt1, pnt2) {
    return [(pnt1[0] + pnt2[0]) / 2, (pnt1[1] + pnt2[1]) / 2];
}

function getAngleOfThreePoints(pntA, pntB, pntC) {
    const angle = getAzimuth(pntB, pntA) - getAzimuth(pntB, pntC);
    return angle < 0 ? angle + Math.PI * 2 : angle;
}

function getThirdPoint(startPnt, endPnt, angle, distance, clockWise) {
    const azimuth = getAzimuth(startPnt, endPnt);
    const alpha = clockWise ? azimuth + angle : azimuth - angle;
    const dx = distance * Math.cos(alpha);
    const dy = distance * Math.sin(alpha);
    return [endPnt[0] + dx, endPnt[1] + dy];
}

function wholeDistance(points) {
    let distance = 0;
    for (let i = 0; i < points.length - 1; i += 1) {
        distance += getDistance(points[i], points[i + 1]);
    }
    return distance;
}

function getBaseLength(points) {
    return Math.pow(wholeDistance(points), 0.99);
}

function getFactorial(n) {
    if (n <= 1) return 1;
    if (n === 2) return 2;
    if (n === 3) return 6;
    if (n === 4) return 24;
    if (n === 5) return 120;
    let result = 1;
    for (let i = 1; i <= n; i += 1) result *= i;
    return result;
}

function getBinomialFactor(n, index) {
    return getFactorial(n) / (getFactorial(index) * getFactorial(n - index));
}

function getBezierPoints(points) {
    if (points.length <= 2) return points;

    const bezierPoints = [];
    const n = points.length - 1;
    for (let t = 0; t <= 1; t += 0.01) {
        let x = 0;
        let y = 0;
        for (let index = 0; index <= n; index += 1) {
            const factor = getBinomialFactor(n, index);
            const a = Math.pow(t, index);
            const b = Math.pow(1 - t, n - index);
            x += factor * a * b * points[index][0];
            y += factor * a * b * points[index][1];
        }
        bezierPoints.push([x, y]);
    }
    bezierPoints.push(points[n]);
    return bezierPoints;
}

function getNormal(pnt1, pnt2, pnt3) {
    let dX1 = pnt1[0] - pnt2[0];
    let dY1 = pnt1[1] - pnt2[1];
    const d1 = Math.sqrt(dX1 * dX1 + dY1 * dY1);
    dX1 /= d1;
    dY1 /= d1;

    let dX2 = pnt3[0] - pnt2[0];
    let dY2 = pnt3[1] - pnt2[1];
    const d2 = Math.sqrt(dX2 * dX2 + dY2 * dY2);
    dX2 /= d2;
    dY2 /= d2;

    const uX = dX1 + dX2;
    const uY = dY1 + dY2;
    return [uX, uY];
}

function getBisectorNormals(t, pnt1, pnt2, pnt3) {
    const normal = getNormal(pnt1, pnt2, pnt3);
    const dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1]);
    const uX = normal[0] / dist;
    const uY = normal[1] / dist;
    const d1 = getDistance(pnt1, pnt2);
    const d2 = getDistance(pnt2, pnt3);

    let bisectorNormalRight;
    let bisectorNormalLeft;
    let dt;
    let x;
    let y;
    if (dist > ZERO_TOLERANCE) {
        if (isClockWise(pnt1, pnt2, pnt3)) {
            dt = t * d1;
            x = pnt2[0] - dt * uY;
            y = pnt2[1] + dt * uX;
            bisectorNormalRight = [x, y];
            dt = t * d2;
            x = pnt2[0] + dt * uY;
            y = pnt2[1] - dt * uX;
            bisectorNormalLeft = [x, y];
        } else {
            dt = t * d1;
            x = pnt2[0] + dt * uY;
            y = pnt2[1] - dt * uX;
            bisectorNormalRight = [x, y];
            dt = t * d2;
            x = pnt2[0] - dt * uY;
            y = pnt2[1] + dt * uX;
            bisectorNormalLeft = [x, y];
        }
    } else {
        x = pnt2[0] + t * (pnt1[0] - pnt2[0]);
        y = pnt2[1] + t * (pnt1[1] - pnt2[1]);
        bisectorNormalRight = [x, y];
        x = pnt2[0] + t * (pnt3[0] - pnt2[0]);
        y = pnt2[1] + t * (pnt3[1] - pnt2[1]);
        bisectorNormalLeft = [x, y];
    }
    return [bisectorNormalRight, bisectorNormalLeft];
}

function getCubicValue(t, startPnt, cPnt1, cPnt2, endPnt) {
    const t0 = Math.max(Math.min(t, 1), 0);
    const tp = 1 - t0;
    const t2 = t0 * t0;
    const t3 = t2 * t0;
    const tp2 = tp * tp;
    const tp3 = tp2 * tp;
    const x = tp3 * startPnt[0] + 3 * tp2 * t0 * cPnt1[0] + 3 * tp * t2 * cPnt2[0] + t3 * endPnt[0];
    const y = tp3 * startPnt[1] + 3 * tp2 * t0 * cPnt1[1] + 3 * tp * t2 * cPnt2[1] + t3 * endPnt[1];
    return [x, y];
}

function getQuadricBSplineFactor(k, t) {
    if (k === 0) return Math.pow(t - 1, 2) / 2;
    if (k === 1) return (-2 * Math.pow(t, 2) + 2 * t + 1) / 2;
    if (k === 2) return Math.pow(t, 2) / 2;
    return 0;
}

function getQBSplinePoints(points) {
    if (points.length <= 2) return points;

    const n = 2;

    const bSplinePoints = [];
    const m = points.length - n - 1;
    bSplinePoints.push(points[0]);
    for (let i = 0; i <= m; i += 1) {
        for (let t = 0; t <= 1; t += 0.05) {
            let x = 0;
            let y = 0;
            for (let k = 0; k <= n; k += 1) {
                const factor = getQuadricBSplineFactor(k, t);
                x += factor * points[i + k][0];
                y += factor * points[i + k][1];
            }
            bSplinePoints.push([x, y]);
        }
    }
    bSplinePoints.push(points[points.length - 1]);
    return bSplinePoints;
}

function getLeftMostControlPoint(t, controlPoints) {
    const pnt1 = controlPoints[0];
    const pnt2 = controlPoints[1];
    const pnt3 = controlPoints[2];
    const pnts = getBisectorNormals(0, pnt1, pnt2, pnt3);
    const normalRight = pnts[0];
    const normal = getNormal(pnt1, pnt2, pnt3);
    const dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1]);
    let controlX;
    let controlY;
    if (dist > ZERO_TOLERANCE) {
        const midP = mid(pnt1, pnt2);
        const pX = pnt1[0] - midP[0];
        const pY = pnt1[1] - midP[1];

        const d1 = getDistance(pnt1, pnt2);
        // normal at midpoint
        const n = 2.0 / d1;
        const nX = -n * pY;
        const nY = n * pX;

        // upper triangle of symmetric transform matrix
        const a11 = nX * nX - nY * nY;
        const a12 = 2 * nX * nY;
        const a22 = nY * nY - nX * nX;

        const dX = normalRight[0] - midP[0];
        const dY = normalRight[1] - midP[1];

        // coordinates of reflected vector
        controlX = midP[0] + a11 * dX + a12 * dY;
        controlY = midP[1] + a12 * dX + a22 * dY;
    } else {
        controlX = pnt1[0] + t * (pnt2[0] - pnt1[0]);
        controlY = pnt1[1] + t * (pnt2[1] - pnt1[1]);
    }
    return [controlX, controlY];
}

function getRightMostControlPoint(t, controlPoints) {
    const count = controlPoints.length;
    const pnt1 = controlPoints[count - 3];
    const pnt2 = controlPoints[count - 2];
    const pnt3 = controlPoints[count - 1];
    const pnts = getBisectorNormals(0, pnt1, pnt2, pnt3);
    const normalLeft = pnts[1];
    const normal = getNormal(pnt1, pnt2, pnt3);
    const dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1]);
    let controlX;
    let controlY;
    if (dist > ZERO_TOLERANCE) {
        const midP = mid(pnt2, pnt3);
        const pX = pnt3[0] - midP[0];
        const pY = pnt3[1] - midP[1];

        const d1 = getDistance(pnt2, pnt3);
        // normal at midpoint
        const n = 2.0 / d1;
        const nX = -n * pY;
        const nY = n * pX;

        // upper triangle of symmetric transform matrix
        const a11 = nX * nX - nY * nY;
        const a12 = 2 * nX * nY;
        const a22 = nY * nY - nX * nX;

        const dX = normalLeft[0] - midP[0];
        const dY = normalLeft[1] - midP[1];

        // coordinates of reflected vector
        controlX = midP[0] + a11 * dX + a12 * dY;
        controlY = midP[1] + a12 * dX + a22 * dY;
    } else {
        controlX = pnt3[0] + t * (pnt2[0] - pnt3[0]);
        controlY = pnt3[1] + t * (pnt2[1] - pnt3[1]);
    }
    return [controlX, controlY];
}

function getCurvePoints(t, controlPoints) {
    const leftControl = getLeftMostControlPoint(t, controlPoints);
    let normals = [leftControl];
    for (let i = 0; i < controlPoints.length - 2; i += 1) {
        const pnt1 = controlPoints[i];
        const pnt2 = controlPoints[i + 1];
        const pnt3 = controlPoints[i + 2];
        const normalPoints = getBisectorNormals(t, pnt1, pnt2, pnt3);
        normals = normals.concat(normalPoints);
    }
    const rightControl = getRightMostControlPoint(t, controlPoints);
    normals.push(rightControl);
    const points = [];
    for (let i = 0; i < controlPoints.length - 1; i += 1) {
        const pnt1 = controlPoints[i];
        const pnt2 = controlPoints[i + 1];
        points.push(pnt1);
        for (let index = 0; index < FITTING_COUNT; index += 1) {
            const pnt = getCubicValue(index / FITTING_COUNT, pnt1, normals[i * 2], normals[i * 2 + 1], pnt2);
            points.push(pnt);
        }
        points.push(pnt2);
    }
    return points;
}

export default {
    getDistance,
    getAzimuth,
    getIntersectPoint,
    isClockWise,
    getArcPoints,
    getCircleCenterOfThreePoints,
    mid,
    getAngleOfThreePoints,
    getThirdPoint,
    getBaseLength,
    getBezierPoints,
    wholeDistance,
    getBisectorNormals,
    getCubicValue,
    getQBSplinePoints,
    getCurvePoints,
};
