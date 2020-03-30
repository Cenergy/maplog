import PlotSymbolBase from './plotSymbolBase';
import { HasCoordinate } from '../../mixin';
import plotTypes from '../plotTypes';

class MarkerSymbol extends PlotSymbolBase {
    constructor(option) {
        super(option);
        Object.assign(this, new HasCoordinate(option));
        const { type, urlKey, height, width } = option;
        this.type = type || plotTypes.MARKER;
        this.urlKey = urlKey;
        this.height = height || 50;
        this.width = width || 50;
    }
}

export default MarkerSymbol;
