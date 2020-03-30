import PlotSymbolBase from './plotSymbolBase';
import { HasCoordinates } from '../../mixin';
import plotTypes from '../plotTypes';

class AttackArrowSymbol extends PlotSymbolBase {
    constructor(option) {
        super(option);
        Object.assign(this, new HasCoordinates(option));
        const { leftPoint, rightPoint, type } = option;
        this.type = type || plotTypes.ATTACK_ARROW;
        this.leftPoint = leftPoint;
        this.rightPoint = rightPoint;
    }
}

export default AttackArrowSymbol;
