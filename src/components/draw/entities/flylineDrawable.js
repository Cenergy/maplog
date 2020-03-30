import Drawable from './drawable';
import { HasCoordinates } from '../../mixin';

/**
 * 飞线绘制参数
 * @param {object} option 选项
 * @example
 * const option = {
 *   name:'flyline',
 *   color: '#4BF80B',
 *   strokeWidth:40,
 *   coordinates: [[113.958263, 22.559213],[113.87572, 22.586208]],
 *   minZoom: 12,
 *   maxZoom: 19,
 * };
 *
 * // execute
 * const flylineDrawable = new FlyLineDrawable(option)
 */
class FlylineDrawable extends Drawable {
    constructor(option) {
        super(option);
        Object.assign(this, new HasCoordinates(option));
        const { color, strokeWidth, pointCount, speed = 1 } = option;
        this._color = color || '#2DF802';
        this._strokeWidth = strokeWidth || 60;
        this.pointCount = pointCount || 150;
        this.speed = speed;
    }
}

export default FlylineDrawable;
