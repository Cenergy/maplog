import Drawable from './drawable';
import { HasCoordinates } from '../../mixin';

/**
 * 路径绘制参数
 * @param {object} option 选项
 * @example
 * const option = {
 *   name:'plot',
 *   coordinates: [[113.958263, 22.559213],[113.87572, 22.586208]],
 *   minZoom: 10,
 *   maxZoom: 16,
 *   needFill: false,
 * };
 *
 * // execute
 * const plotDrawable = new PlotDrawable(option)
 */
class PlotDrawable extends Drawable {
    constructor(option) {
        super(option);
        Object.assign(this, new HasCoordinates(option));
        const { color, strokeThickness, needFill } = option;
        this.needFill = needFill || false;
        this.color = color || 'red';
        this.strokeThickness = strokeThickness || 5;
    }
}

export default PlotDrawable;
