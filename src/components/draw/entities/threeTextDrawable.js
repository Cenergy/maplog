import Drawable from './drawable';
import { HasCoordinate } from '../../mixin';

/**
 * three文字绘制参数
 * @param {object} option 选项
 * @example
 * const option = {
 *   coordinates: [113.87572, 22.586208],
 *   minZoom:10,
 *   maxZoom:19
 * };
 *
 * // execute
 * const threeTextDrawable = new ThreeTextDrawable(option)
 */
class ThreeTextDrawable extends Drawable {
  constructor(option) {
    super(option);
    Object.assign(this, new HasCoordinate(option));
    const {
      text = '空',
      color = '#ff0000',
      opacity = 1,
      size = 1.5,
      height = 0.15,
      width = 0.15,
      positionX = 0,
      positionY = 0
    } = option;
    this.text = text;
    this.color = color;
    this.opacity = opacity;
    this.size = size;
    this.width = width;
    this.height = height;
    this.positionX = positionX;
    this.positionY = positionY;
  }
}
export default ThreeTextDrawable;
