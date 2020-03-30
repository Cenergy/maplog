import plotUtil from '../util/plotUtil';

const headHeightFactor = 0.25;
const headWidthFactor = 0.3;
const neckHeightFactor = 0.85;
const neckWidthFactor = 0.15;
let connPoint = null;
let tempPoint4 = null;

function getTempPoint4(linePnt1, linePnt2, point) {
    const midPnt = plotUtil.mid(linePnt1, linePnt2);
    const len = plotUtil.getDistance(midPnt, point);
    const angle = plotUtil.getAngleOfThreePoints(linePnt1, midPnt, point);
    let symPnt;
    let distance1;
    let distance2;
    let mid;
    if (angle < Math.PI / 2) {
        distance1 = len * Math.sin(angle);
        distance2 = len * Math.cos(angle);
        mid = plotUtil.getThirdPoint(linePnt1, midPnt, Math.PI / 2, distance1, false);
        symPnt = plotUtil.getThirdPoint(midPnt, mid, Math.PI / 2, distance2, true);
    } else if (angle >= Math.PI / 2 && angle < Math.PI) {
        distance1 = len * Math.sin(Math.PI - angle);
        distance2 = len * Math.cos(Math.PI - angle);
        mid = plotUtil.getThirdPoint(linePnt1, midPnt, Math.PI / 2, distance1, false);
        symPnt = plotUtil.getThirdPoint(midPnt, mid, Math.PI / 2, distance2, false);
    } else if (angle >= Math.PI && angle < Math.PI * 1.5) {
        distance1 = len * Math.sin(angle - Math.PI);
        distance2 = len * Math.cos(angle - Math.PI);
        mid = plotUtil.getThirdPoint(linePnt1, midPnt, Math.PI / 2, distance1, true);
        symPnt = plotUtil.getThirdPoint(midPnt, mid, Math.PI / 2, distance2, true);
    } else {
        distance1 = len * Math.sin(Math.PI * 2 - angle);
        distance2 = len * Math.cos(Math.PI * 2 - angle);
        mid = plotUtil.getThirdPoint(linePnt1, midPnt, Math.PI / 2, distance1, true);
        symPnt = plotUtil.getThirdPoint(midPnt, mid, Math.PI / 2, distance2, false);
    }
    return symPnt;
}

function getArrowBodyPoints(points, neckLeft, neckRight, tailWidthFactor) {
    const allLen = plotUtil.wholeDistance(points);
    const len = plotUtil.getBaseLength(points);
    const tailWidth = len * tailWidthFactor;
    const neckWidth = plotUtil.getDistance(neckLeft, neckRight);
    const widthDif = (tailWidth - neckWidth) / 2;
    let tempLen = 0;
    const leftBodyPnts = [];
    const rightBodyPnts = [];
    for (let i = 1; i < points.length - 1; i += 1) {
        const angle = plotUtil.getAngleOfThreePoints(points[i - 1], points[i], points[i + 1]) / 2;
        tempLen += plotUtil.getDistance(points[i - 1], points[i]);
        const w = (tailWidth / 2 - (tempLen / allLen) * widthDif) / Math.sin(angle);
        const left = plotUtil.getThirdPoint(points[i - 1], points[i], Math.PI - angle, w, true);
        const right = plotUtil.getThirdPoint(points[i - 1], points[i], angle, w, false);
        leftBodyPnts.push(left);
        rightBodyPnts.push(right);
    }
    return leftBodyPnts.concat(rightBodyPnts);
}

function getArrowHeadPoints(points) {
    const len = plotUtil.getBaseLength(points);
    const headHeight = len * headHeightFactor;
    const headPnt = points[points.length - 1];
    const headWidth = headHeight * headWidthFactor;
    const neckWidth = headHeight * neckWidthFactor;
    const neckHeight = headHeight * neckHeightFactor;
    const headEndPnt = plotUtil.getThirdPoint(points[points.length - 2], headPnt, 0, headHeight, true);
    const neckEndPnt = plotUtil.getThirdPoint(points[points.length - 2], headPnt, 0, neckHeight, true);
    const headLeft = plotUtil.getThirdPoint(headPnt, headEndPnt, Math.PI / 2, headWidth, false);
    const headRight = plotUtil.getThirdPoint(headPnt, headEndPnt, Math.PI / 2, headWidth, true);
    const neckLeft = plotUtil.getThirdPoint(headPnt, neckEndPnt, Math.PI / 2, neckWidth, false);
    const neckRight = plotUtil.getThirdPoint(headPnt, neckEndPnt, Math.PI / 2, neckWidth, true);
    return [neckLeft, headLeft, headPnt, headRight, neckRight];
}

function getArrowPoints(pnt1, pnt2, pnt3, clockWise) {
    const midPnt = plotUtil.mid(pnt1, pnt2);
    const len = plotUtil.getDistance(midPnt, pnt3);
    let midPnt1 = plotUtil.getThirdPoint(pnt3, midPnt, 0, len * 0.3, true);
    let midPnt2 = plotUtil.getThirdPoint(pnt3, midPnt, 0, len * 0.5, true);
    midPnt1 = plotUtil.getThirdPoint(midPnt, midPnt1, Math.PI / 2, len / 5, clockWise);
    midPnt2 = plotUtil.getThirdPoint(midPnt, midPnt2, Math.PI / 2, len / 4, clockWise);

    const points = [midPnt, midPnt1, midPnt2, pnt3];
    // 计算箭头部分
    const arrowPnts = getArrowHeadPoints(points, headHeightFactor, headWidthFactor, neckHeightFactor, neckWidthFactor);
    const neckLeftPoint = arrowPnts[0];
    const neckRightPoint = arrowPnts[4];
    // 计算箭身部分
    const tailWidthFactor = plotUtil.getDistance(pnt1, pnt2) / plotUtil.getBaseLength(points) / 2;
    const bodyPnts = getArrowBodyPoints(points, neckLeftPoint, neckRightPoint, tailWidthFactor);
    const n = bodyPnts.length;
    let lPoints = bodyPnts.slice(0, n / 2);
    let rPoints = bodyPnts.slice(n / 2, n);
    lPoints.push(neckLeftPoint);
    rPoints.push(neckRightPoint);
    lPoints = lPoints.reverse();
    lPoints.push(pnt2);
    rPoints = rPoints.reverse();
    rPoints.push(pnt1);
    return lPoints.reverse().concat(arrowPnts, rPoints);
}

function generateDoubleArrow(option) {
    const { leftTailPoint, rigthTailPoint, leftArrowPoint, rigthArrowPoint } = option;
    if (!leftTailPoint || !rigthTailPoint || !leftArrowPoint) {
        return null;
    }

    if (!rigthArrowPoint) {
        tempPoint4 = getTempPoint4(leftTailPoint, rigthTailPoint, leftArrowPoint);
    } else {
        tempPoint4 = rigthArrowPoint;
    }

    connPoint = plotUtil.mid(leftTailPoint, rigthTailPoint);
    if (!connPoint) {
        connPoint = rigthArrowPoint;
    }

    let leftArrowPnts;
    let rightArrowPnts;
    if (plotUtil.isClockWise(leftTailPoint, rigthTailPoint, leftArrowPoint)) {
        leftArrowPnts = getArrowPoints(leftTailPoint, connPoint, tempPoint4, false);
        rightArrowPnts = getArrowPoints(connPoint, rigthTailPoint, leftArrowPoint, true);
    } else {
        leftArrowPnts = getArrowPoints(rigthTailPoint, connPoint, leftArrowPoint, false);
        rightArrowPnts = getArrowPoints(connPoint, leftTailPoint, tempPoint4, true);
    }
    const m = leftArrowPnts.length;
    const t = (m - 5) / 2;

    const llBodyPnts = leftArrowPnts.slice(0, t);
    const lArrowPnts = leftArrowPnts.slice(t, t + 5);
    let lrBodyPnts = leftArrowPnts.slice(t + 5, m);

    let rlBodyPnts = rightArrowPnts.slice(0, t);
    const rArrowPnts = rightArrowPnts.slice(t, t + 5);
    const rrBodyPnts = rightArrowPnts.slice(t + 5, m);

    rlBodyPnts = plotUtil.getBezierPoints(rlBodyPnts);
    const bodyPnts = plotUtil.getBezierPoints(rrBodyPnts.concat(llBodyPnts.slice(1)));
    lrBodyPnts = plotUtil.getBezierPoints(lrBodyPnts);

    const pnts = rlBodyPnts.concat(rArrowPnts, bodyPnts, lArrowPnts, lrBodyPnts);
    pnts.push(pnts[0]);
    return pnts;
}

export default { generateDoubleArrow };
