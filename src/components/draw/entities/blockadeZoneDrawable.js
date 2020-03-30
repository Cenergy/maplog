import Drawable from './drawable';
import { HasCoordinates } from '../../mixin';

/**
 * 封锁区域绘制参数
 * @param {object} option 选项
 * @example
 * const option = {
 *   name:'blockadeZone',
 *   coordinates: [[113.958263, 22.559213],[113.87572, 22.586208],[113.968263, 22.559413],[113.958263, 22.559213]],
 *   strokeWidth: 4,
 *   opacity: 0.1,
 *   minZoom: 3,
 *   maxZoom: 15,
 * };
 *
 * // execute
 * const blockadeZoneDrawable = new BlockadeZoneDrawable(option)
 */
class BlockadeZoneDrawable extends Drawable {
  constructor(option) {
    super(option);
    Object.assign(this, new HasCoordinates(option));
    const { strokeWidth, opacity, color } = option;
    this.strokeWidth = strokeWidth || 2;
    this.opacity = opacity || 0.2;
    this.color = color || '#FFCF01';
  }
}

export default BlockadeZoneDrawable;
