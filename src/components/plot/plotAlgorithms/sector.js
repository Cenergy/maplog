import plotUtil from '../util/plotUtil';

function generateSector(option) {
    const { startPoint, endPoint, arcPoint } = option;
    if (!startPoint || !endPoint || !arcPoint) {
        return null;
    }

    const radius = plotUtil.getDistance(endPoint, startPoint);
    const startAngle = plotUtil.getAzimuth(endPoint, startPoint);
    const endAngle = plotUtil.getAzimuth(arcPoint, startPoint);
    const pList = plotUtil.getArcPoints(startPoint, radius, startAngle, endAngle);
    pList.push(startPoint, pList[0]);
    return pList;
}

export default { generateSector };
