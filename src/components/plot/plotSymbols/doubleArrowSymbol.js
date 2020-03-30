import PlotSymbolBase from './plotSymbolBase';
import plotTypes from '../plotTypes';

class DoubleArrowSymbol extends PlotSymbolBase {
    constructor(option) {
        super(option);
        const { leftTailPoint, rigthTailPoint, leftArrowPoint, rigthArrowPoint, type } = option;
        this.leftArrowPoint = leftArrowPoint;
        this.rigthArrowPoint = rigthArrowPoint;
        this.leftTailPoint = leftTailPoint;
        this.rigthTailPoint = rigthTailPoint;
        this.type = type || plotTypes.DOUBLE_ARROW;
    }
}

export default DoubleArrowSymbol;
