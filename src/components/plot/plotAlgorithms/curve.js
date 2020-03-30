import plotUtil from '../util/plotUtil';

function generateCurve(option) {
    const { coordinates } = option;
    if (coordinates.length < 2) {
        return null;
    }

    if (coordinates.length === 2) {
        return coordinates;
    }
    const pnts = plotUtil.getCurvePoints(0.3, coordinates);
    return pnts;
}

export default { generateCurve };
