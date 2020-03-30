import Drawable from './drawable';
import { HasCoordinate } from '../../mixin';
/**
 * three小精灵风格文字绘制参数
 * @param {object} option 选项
 * @example
 * const option = {
 *   coordinates: [113.87572, 22.586208],
 *   minZoom:10,
 *   maxZoom:19
 * };
 *
 * // execute
 * const spriteTextDrawable = new SpriteTextDrawable(option)
 */
class SpriteTextDrawable extends Drawable {
  constructor(option) {
    super(option);
    Object.assign(this, new HasCoordinate(option));
    const {
      text = '空',
      textcolor = '#ff0000',
      height = 18,
      font = 'Bold 50px Arial',
      textWidth = null,
      textHeight = null,
    } = option;
    this.text = text;
    this.textcolor = textcolor;
    this.height = height;
    this.font = font;
    this.textWidth = textWidth;
    this.textHeight = textHeight;
  }
}

export default SpriteTextDrawable;
