import plotTypes from './plotTypes';
import doubleArrow from './plotAlgorithms/doubleArrow';
import fineArrow from './plotAlgorithms/fineArrow';
import assaultDirection from './plotAlgorithms/assaultDirection';
import lune from './plotAlgorithms/lune';
import circle from './plotAlgorithms/circle';
import arc from './plotAlgorithms/arc';
import rectangle from './plotAlgorithms/rectangle';
import sector from './plotAlgorithms/sector';
import straightArrow from './plotAlgorithms/straightArrow';
import gatheringPlace from './plotAlgorithms/gatheringPlace';
import ellipse from './plotAlgorithms/ellipse';
import attackArrow from './plotAlgorithms/attackArrow';
import tailedAttackArrow from './plotAlgorithms/tailedAttackArrow';
import squadCombat from './plotAlgorithms/squadCombat';
import tailedSquadCombat from './plotAlgorithms/tailedSquadCombat';
import curve from './plotAlgorithms/curve';
import closedCurve from './plotAlgorithms/closedCurve';

function parseLineCoordinates(option) {
    const { coordinates } = option;
    if (coordinates.length < 2) {
        return null;
    }
    return coordinates;
}

function parseAreaCoordinates(option) {
    const { coordinates } = option;
    if (coordinates.length < 2) {
        return null;
    }

    const pnts = coordinates;
    pnts.push(pnts[0]);
    return pnts;
}

function generatePlotMark(option) {
    const { type } = option;
    console.log('rd: createPlot -> type, option', type, option);
    let points = null;
    let needFill = true;
    switch (type) {
        case plotTypes.DOUBLE_ARROW:
            points = doubleArrow.generateDoubleArrow(option);
            break;
        case plotTypes.CIRCLE:
            points = circle.generateCircle(option);
            break;
        case plotTypes.ARC:
            points = arc.generateArc(option);
            needFill = false;
            break;
        case plotTypes.ASSAULT_DIRECTION:
            points = assaultDirection.generateAssaultDirection(option);
            break;
        case plotTypes.FINE_ARROW:
            points = fineArrow.generateFineArrow(option);
            break;
        case plotTypes.LUNE:
            points = lune.generateLune(option);
            break;
        case plotTypes.RECTANGLE:
            points = rectangle.generateRectangle(option);
            break;
        case plotTypes.SECTOR:
            points = sector.generateSector(option);
            break;
        case plotTypes.STRAIGHT_ARROW:
            points = straightArrow.generateStraightArrow(option);
            needFill = false;
            break;
        case plotTypes.GATHERING_PLACE:
            points = gatheringPlace.generateGatheringPlace(option);
            break;
        case plotTypes.ELLIPSE:
            points = ellipse.generateEllipse(option);
            break;
        case plotTypes.ATTACK_ARROW:
            points = attackArrow.generateAttackArrow(option);
            break;
        case plotTypes.TAILED_ATTACK_ARROW:
            points = tailedAttackArrow.generateTailedAttackArrow(option);
            break;
        case plotTypes.SQUAD_COMBAT:
            points = squadCombat.generateSquadCombat(option);
            break;
        case plotTypes.TAILED_SQUAD_COMBAT:
            points = tailedSquadCombat.generateTailedSquadCombat(option);
            break;
        case plotTypes.POLYLINE:
            points = parseLineCoordinates(option);
            needFill = false;
            break;
        case plotTypes.POLYGON:
            points = parseAreaCoordinates(option);
            break;
        case plotTypes.CURVE:
            points = curve.generateCurve(option);
            needFill = false;
            break;
        case plotTypes.CLOSED_CURVE:
            points = closedCurve.generateClosedCurve(option);
            break;
        case plotTypes.FREEHAND_LINE:
            points = parseLineCoordinates(option);
            needFill = false;
            break;
        case plotTypes.FREEHAND_POLYGON:
            points = parseAreaCoordinates(option);
            break;
        default:
            break;
    }

    return { points, needFill };
}

export default { generatePlotMark };
