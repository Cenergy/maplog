import Drawable from './drawable';
import { HasCoordinate } from '../../mixin';

/**
 * 纹孔托绘制参数
 * @param {object} option 选项
 * @example
 * const option = {
 *   coordinates: [113.87572, 22.586208],
 *   minZoom:10,
 *   maxZoom:19
 * };
 *
 * // execute
 * const torusDrawable = new TorusDrawable(option)
 */
class TorusDrawable extends Drawable {
  constructor(option) {
    super(option);
    Object.assign(this, new HasCoordinate(option));
    const {
      size,
      rotation = 0,
      delayoffset = 30,
      initZ = 5,
      height = 50,
      offset = 5,
      color = '#00FF0F',
    } = option;
    this.delayoffset = delayoffset; // 帧动画延迟次数
    this.initZ = initZ;
    this.maxZ = height;
    this.offset = offset;
    this.size = size;
    this.rotation = rotation;
    this.color = color;
  }
}

export default TorusDrawable;
