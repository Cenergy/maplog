import PlotSymbolBase from './plotSymbolBase';
import { HasTwoCoordinates } from '../../mixin';
import plotTypes from '../plotTypes';

class LuneSymbol extends PlotSymbolBase {
    constructor(option) {
        super(option);
        Object.assign(this, new HasTwoCoordinates(option));
        const { arcPoint, type } = option;
        this.arcPoint = arcPoint;
        this.type = type || plotTypes.LUNE;
    }
}

export default LuneSymbol;
