import plotUtil from '../util/plotUtil';
import { HALF_PI } from '../util/plotConstants';

const headHeightFactor = 0.18;
const headWidthFactor = 0.3;
const neckHeightFactor = 0.85;
const neckWidthFactor = 0.15;
const headTailFactor = 0.8;

function getArrowHeadPoints(points, tailLeft, tailRight) {
    let len = plotUtil.getBaseLength(points);
    let headHeight = len * headHeightFactor;
    const headPnt = points[points.length - 1];
    len = plotUtil.getDistance(headPnt, points[points.length - 2]);
    const tailWidth = plotUtil.getDistance(tailLeft, tailRight);
    if (headHeight > tailWidth * headTailFactor) {
        headHeight = tailWidth * headTailFactor;
    }
    const headWidth = headHeight * headWidthFactor;
    const neckWidth = headHeight * neckWidthFactor;
    headHeight = headHeight > len ? len : headHeight;
    const neckHeight = headHeight * neckHeightFactor;
    const headEndPnt = plotUtil.getThirdPoint(points[points.length - 2], headPnt, 0, headHeight, true);
    const neckEndPnt = plotUtil.getThirdPoint(points[points.length - 2], headPnt, 0, neckHeight, true);
    const headLeft = plotUtil.getThirdPoint(headPnt, headEndPnt, HALF_PI, headWidth, false);
    const headRight = plotUtil.getThirdPoint(headPnt, headEndPnt, HALF_PI, headWidth, true);
    const neckLeft = plotUtil.getThirdPoint(headPnt, neckEndPnt, HALF_PI, neckWidth, false);
    const neckRight = plotUtil.getThirdPoint(headPnt, neckEndPnt, HALF_PI, neckWidth, true);
    return [neckLeft, headLeft, headPnt, headRight, neckRight];
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

function generateAttackArrow(option) {
    const { leftPoint, rightPoint, coordinates } = option;
    if (!leftPoint || !rightPoint || coordinates.length < 1) {
        return null;
    }

    // 计算箭尾
    let tailLeft = leftPoint;
    let tailRight = rightPoint;
    if (plotUtil.isClockWise(leftPoint, rightPoint, coordinates[0])) {
        tailLeft = rightPoint;
        tailRight = leftPoint;
    }
    const midTail = plotUtil.mid(tailLeft, tailRight);
    const bonePnts = [midTail].concat(coordinates.slice(0));

    // 计算箭头
    const headPnts = getArrowHeadPoints(bonePnts, tailLeft, tailRight);
    const neckLeft = headPnts[0];
    const neckRight = headPnts[4];
    const tailWidthFactor = plotUtil.getDistance(tailLeft, tailRight) / plotUtil.getBaseLength(bonePnts);
    // 计算箭身
    const bodyPnts = getArrowBodyPoints(bonePnts, neckLeft, neckRight, tailWidthFactor);
    // 整合
    const count = bodyPnts.length;
    let leftPnts = [tailLeft].concat(bodyPnts.slice(0, count / 2));
    leftPnts.push(neckLeft);
    let rightPnts = [tailRight].concat(bodyPnts.slice(count / 2, count));
    rightPnts.push(neckRight);

    leftPnts = plotUtil.getQBSplinePoints(leftPnts);
    rightPnts = plotUtil.getQBSplinePoints(rightPnts);

    const pnts = [leftPnts.concat(headPnts, rightPnts.reverse())][0];
    pnts.push(pnts[0]);
    return pnts;
}

export default { generateAttackArrow, getArrowBodyPoints, getArrowHeadPoints };
