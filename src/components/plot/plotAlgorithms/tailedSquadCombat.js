import plotUtil from '../util/plotUtil';
import { HALF_PI } from '../util/plotConstants';

const headHeightFactor = 0.18;
const headWidthFactor = 0.3;
const neckHeightFactor = 0.85;
const neckWidthFactor = 0.15;
const tailWidthFactor = 0.1;
const swallowTailFactor = 1;
const headTailFactor = 0.8;
let swallowTailPnt = null;

function getTailPoints(points) {
    const allLen = plotUtil.getBaseLength(points);
    const tailWidth = allLen * tailWidthFactor;
    const tailLeft = plotUtil.getThirdPoint(points[1], points[0], HALF_PI, tailWidth, false);
    const tailRight = plotUtil.getThirdPoint(points[1], points[0], HALF_PI, tailWidth, true);
    const len = tailWidth * swallowTailFactor;
    swallowTailPnt = plotUtil.getThirdPoint(points[1], points[0], 0, len, true);
    return [tailLeft, swallowTailPnt, tailRight];
}

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

function getArrowBodyPoints(points, neckLeft, neckRight) {
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

function generateTailedSquadCombat(option) {
    const { coordinates } = option;
    if (coordinates.length < 2) {
        return null;
    }

    const tailPnts = getTailPoints(coordinates);
    const headPnts = getArrowHeadPoints(coordinates, tailPnts[0], tailPnts[1]);
    const neckLeft = headPnts[0];
    const neckRight = headPnts[4];
    const bodyPnts = getArrowBodyPoints(coordinates, neckLeft, neckRight);
    const count = bodyPnts.length;
    let leftPnts = [tailPnts[0]].concat(bodyPnts.slice(0, count / 2));
    leftPnts.push(neckLeft);
    let rightPnts = [tailPnts[2]].concat(bodyPnts.slice(count / 2, count));
    rightPnts.push(neckRight);

    leftPnts = plotUtil.getQBSplinePoints(leftPnts);
    rightPnts = plotUtil.getQBSplinePoints(rightPnts);

    const pnts = [leftPnts.concat(headPnts, rightPnts.reverse(), [tailPnts[1], leftPnts[0]])][0];
    return pnts;
}

export default { generateTailedSquadCombat };
