import PlotSymbolBase from './plotSymbolBase';
import { HasTwoCoordinates } from '../../mixin';
import plotTypes from '../plotTypes';

class ArcSymbol extends PlotSymbolBase {
    constructor(option) {
        super(option);
        Object.assign(this, new HasTwoCoordinates(option));
        const { arcPoint, type } = option;
        this.type = type || plotTypes.ARC;
        this.arcPoint = arcPoint;
    }
}

export default ArcSymbol;
