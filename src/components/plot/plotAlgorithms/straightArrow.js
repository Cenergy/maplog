import plotUtil from '../util/plotUtil';

const maxArrowLength = 3000000;
const arrowLengthScale = 5;

function generateStraightArrow(option) {
    const { startPoint, endPoint } = option;
    if (!startPoint || !endPoint) {
        return null;
    }

    const distance = plotUtil.getDistance(startPoint, endPoint);
    const len = distance / arrowLengthScale;
    const lenPlus = len > maxArrowLength ? maxArrowLength : len;
    const leftPnt = plotUtil.getThirdPoint(startPoint, endPoint, Math.PI / 6, lenPlus, false);
    const rightPnt = plotUtil.getThirdPoint(startPoint, endPoint, Math.PI / 6, lenPlus, true);
    return [startPoint, endPoint, leftPnt, endPoint, rightPnt];
}

export default { generateStraightArrow };
