import Drawable from './drawable';
import { HasCoordinates } from '../../mixin';

/**
 * 飞线绘制参数
 * @param {object} option 选项
 * @example
 * const option = {
 *   name:'flyline',
 *   color: [255, 0, 255],
 *   strokeWidth:4,
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
    const { color, strokeWidth } = option;
    this._color = color || 'red';
    this._strokeWidth = strokeWidth || 2;
  }
}

export default FlylineDrawable;
