import plotUtil from '../util/plotUtil';
import { HALF_PI } from '../util/plotConstants';

function generateLune(option) {
    const { startPoint, endPoint, arcPoint } = option;
    if (!startPoint || !endPoint) {
        return null;
    }

    let thirdPoint = arcPoint;
    if (!thirdPoint) {
        const mid = plotUtil.mid(startPoint, endPoint);
        const d = plotUtil.getDistance(startPoint, mid);
        thirdPoint = plotUtil.getThirdPoint(startPoint, mid, HALF_PI, d);
    }

    const center = plotUtil.getCircleCenterOfThreePoints(startPoint, endPoint, thirdPoint);
    const radius = plotUtil.getDistance(startPoint, center);

    const angle1 = plotUtil.getAzimuth(startPoint, center);
    const angle2 = plotUtil.getAzimuth(endPoint, center);
    let startAngle;
    let endAngle;
    if (plotUtil.isClockWise(startPoint, endPoint, thirdPoint)) {
        startAngle = angle2;
        endAngle = angle1;
    } else {
        startAngle = angle1;
        endAngle = angle2;
    }
    const pnts = plotUtil.getArcPoints(center, radius, startAngle, endAngle);
    pnts.push(pnts[0]);
    return pnts;
}

export default { generateLune };
