function generatePolygon(option) {
    const { startPoint, endPoint } = option;
    if (!startPoint || !endPoint) {
        return null;
    }

    const xmin = Math.min(startPoint[0], endPoint[0]);
    const xmax = Math.max(startPoint[0], endPoint[0]);
    const ymin = Math.min(startPoint[1], endPoint[1]);
    const ymax = Math.max(startPoint[1], endPoint[1]);
    const tl = [xmin, ymax];
    const tr = [xmax, ymax];
    const br = [xmax, ymin];
    const bl = [xmin, ymin];
    const pnts = [tl, tr, br, bl, tl];
    return pnts;
}

export default { generatePolygon };
