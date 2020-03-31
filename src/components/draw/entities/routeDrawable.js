import Drawable from './drawable';
import { HasCoordinates } from '../../mixin';

/**
 * 路径绘制参数
 * @param {object} option 选项
 * @example
 * const option = {
 *   name:'route',
 *   duration: 15454,
 *   distance: 48784,
 *   coordinates: [[113.958263, 22.559213],[113.87572, 22.586208]],
 *   minZoom: 10,
 *   maxZoom: 16,
 * };
 *
 * // execute
 * const routeDrawable = new RouteDrawable(option)
 */
class RouteDrawable extends Drawable {
  constructor(option) {
    super(option);
    Object.assign(this, new HasCoordinates(option));
    const {
      distance, duration, centreDetail, isDynamicDraw,
    } = option;
    this.distance = distance;
    this.duration = duration;
    this.centreDetail = centreDetail || false;
    this.isDynamicDraw = isDynamicDraw || false;
  }
}

export default RouteDrawable;
