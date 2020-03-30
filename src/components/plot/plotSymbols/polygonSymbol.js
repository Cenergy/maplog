import PlotSymbolBase from './plotSymbolBase';
import { HasCoordinates } from '../../mixin';
import plotTypes from '../plotTypes';

class PolygonSymbol extends PlotSymbolBase {
    constructor(option) {
        super(option);
        Object.assign(this, new HasCoordinates(option));
        const { type } = option;
        this.type = type || plotTypes.POLYGON;
    }
}

export default PolygonSymbol;
