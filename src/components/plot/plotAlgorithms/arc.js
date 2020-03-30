import plotUtil from '../util/plotUtil';

function generateArc(option) {
    const { startPoint, endPoint, arcPoint } = option;
    if (!startPoint || !endPoint || !arcPoint) {
        return null;
    }

    const center = plotUtil.getCircleCenterOfThreePoints(startPoint, endPoint, arcPoint);
    const radius = plotUtil.getDistance(startPoint, center);

    const angle1 = plotUtil.getAzimuth(startPoint, center);
    const angle2 = plotUtil.getAzimuth(endPoint, center);
    let startAngle;
    let endAngle;
    if (plotUtil.isClockWise(startPoint, endPoint, arcPoint)) {
        startAngle = angle2;
        endAngle = angle1;
    } else {
        startAngle = angle1;
        endAngle = angle2;
    }
    const result = plotUtil.getArcPoints(center, radius, startAngle, endAngle);
    return result;
}

export default { generateArc };
