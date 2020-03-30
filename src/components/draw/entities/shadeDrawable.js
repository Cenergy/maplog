import Drawable from './drawable';
import { HasCoordinate } from '../../mixin';

/**
 * 保护性遮罩绘制参数
 * @param {object} option 选项
 * @example
 * const option = {
 *   coordinates: [113.87572, 22.586208],
 *   minZoom:10,
 *   maxZoom:19
 * };
 *
 * // execute
 * const imageDrawable = new ImageDrawable(option)
 */
class ShadeDrawable extends Drawable {
  constructor(option) {
    console.log('go: ShadeDrawable -> constructor -> option', option);
    super(option);
    const { type = 'sphere', title = '' } = option;
    Object.assign(this, new HasCoordinate(option));
    this.type = type;
    this.title = title;
  }
}

export default ShadeDrawable;
