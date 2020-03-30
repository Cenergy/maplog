import Drawable from './drawable';
import { HasCoordinate } from '../../mixin';

/**
 * 环状特效绘制参数
 * @param {object} option 选项
 * @example
 * const option = {
 *   minZoom:10,
 *   maxZoom:19,
 *   height: 30,
 *   radius: 200,
 *   color: `rgba(255,138,0,0.2)`,
 * };
 *
 * // execute
 * const glowBindDrawable = new GlowBindDrawable(option)
 */
class GlowBindDrawable extends Drawable {
    constructor(option) {
        super(option);
        Object.assign(this, new HasCoordinate(option));
        const { height, radius, color, lineNum = 3, lineColor } = option;
        this.height = height;
        this.radius = radius;
        this.color = color;
        this.lineColor = lineColor;
        this.lineNum = lineNum;
    }
}
export default GlowBindDrawable;
