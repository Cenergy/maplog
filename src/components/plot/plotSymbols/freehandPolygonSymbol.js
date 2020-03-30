import PlotSymbolBase from './plotSymbolBase';
import { HasCoordinates } from '../../mixin';
import plotTypes from '../plotTypes';

class FreehandPolygonSymbol extends PlotSymbolBase {
    constructor(option) {
        super(option);
        Object.assign(this, new HasCoordinates(option));
        const { type } = option;
        this.type = type || plotTypes.FREEHAND_POLYGON;
    }
}

export default FreehandPolygonSymbol;
