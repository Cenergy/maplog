import PlotSymbolBase from './plotSymbolBase';
import { HasTwoCoordinates } from '../../mixin';
import plotTypes from '../plotTypes';

class RectangleSymbol extends PlotSymbolBase {
    constructor(option) {
        super(option);
        Object.assign(this, new HasTwoCoordinates(option));
        const { type } = option;
        this.type = type || plotTypes.RECTANGLE;
    }
}

export default RectangleSymbol;
