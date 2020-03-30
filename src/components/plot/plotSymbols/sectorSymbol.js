import PlotSymbolBase from './plotSymbolBase';
import { HasTwoCoordinates } from '../../mixin';
import plotTypes from '../plotTypes';

class SectorSymbol extends PlotSymbolBase {
    constructor(option) {
        super(option);
        Object.assign(this, new HasTwoCoordinates(option));
        const { arcPoint, type } = option;
        this.type = type || plotTypes.SECTOR;
        this.arcPoint = arcPoint;
    }
}

export default SectorSymbol;
