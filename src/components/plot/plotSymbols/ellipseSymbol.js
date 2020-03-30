import PlotSymbolBase from './plotSymbolBase';
import { HasTwoCoordinates } from '../../mixin';
import plotTypes from '../plotTypes';

class EllipseSymbol extends PlotSymbolBase {
    constructor(option) {
        super(option);
        Object.assign(this, new HasTwoCoordinates(option));
        const { type } = option;
        this.type = type || plotTypes.ELLIPSE;
    }
}

export default EllipseSymbol;
