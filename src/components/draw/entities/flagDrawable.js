import Drawable from './drawable';
import { HasCoordinate } from '../../mixin';

/**
 * 图片型图标绘制参数
 * @param {object} option 选项
 * @example
 * const option = {
 *   coordinates: [113.87572, 22.586208],
 *   width:100,
 *   height:200,
 *   minZoom:10,
 *   maxZoom:19,
 *   title:"hello"
 * };
 *
 * // execute
 * const flagDrawable = new FlagDrawable(option)
 */
class FlagDrawable extends Drawable {
  constructor(option) {
    super(option);
    Object.assign(this, new HasCoordinate(option));
    const {
      width = 100, height = 160, title = '', color = '#9d0c00',
    } = option;
    this.title = title;
    this._width = width;
    this._height = height;
    this._color = color;
  }
}

export default FlagDrawable;
