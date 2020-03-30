import plotUtil from '../util/plotUtil';

function generateCircle(option) {
    const { startPoint, endPoint } = option;
    const distance = plotUtil.getDistance(startPoint, endPoint);
    let x;
    let y;
    let angle;
    const points = [];
    for (let i = 0; i <= 100; i += 1) {
        angle = (Math.PI * 2 * i) / 100;
        x = startPoint[0] + distance * Math.cos(angle);
        y = startPoint[1] + distance * Math.sin(angle);
        points.push([x, y]);
    }
    return points;
}

export default { generateCircle };
