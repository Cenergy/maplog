import plotUtil from '../util/plotUtil';
import { FITTING_COUNT } from '../util/plotConstants';

function generateEllipse(option) {
    const { startPoint, endPoint } = option;
    if (!startPoint || !endPoint) {
        return null;
    }

    const center = plotUtil.mid(startPoint, endPoint);
    const majorRadius = Math.abs((startPoint[0] - endPoint[0]) / 2);
    const minorRadius = Math.abs((startPoint[1] - endPoint[1]) / 2);

    let x;
    let y;
    let angle;
    const points = [];
    for (let i = 0; i <= FITTING_COUNT; i += 1) {
        angle = (Math.PI * 2 * i) / FITTING_COUNT;
        x = center[0] + majorRadius * Math.cos(angle);
        y = center[1] + minorRadius * Math.sin(angle);
        points.push([x, y]);
    }
    return points;
}

export default { generateEllipse };
