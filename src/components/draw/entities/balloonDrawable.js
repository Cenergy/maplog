import Drawable from './drawable';
import { HasCoordinate } from '../../mixin';
import tbService from '../../../services/tbService';

/**
 * 气球式点位图标绘制参数
 * @param {object} option 选项
 * @example
 * const option = {
 *   coordinates: [113.87572, 22.586208],
 *   minZoom:10,
 *   maxZoom:19
 * };
 *
 * // execute
 * const balloonDrawable = new BalloonDrawable(option)
 */
class BalloonDrawable extends Drawable {
  constructor(option) {
    super(option);
    Object.assign(this, new HasCoordinate(option));
    const {
      insideIcon = 'http://10.8.9.64:3038/commondata/红闸站.png',
      insideRadius = 3,
      cylinderColor = '#ff0000',
      cylinderHeight = 12,
      cylinderRadius = 0.05,
      balloonInfo = {},
      pin = false, // 大头针样式
    } = option;
    this.insideIcon = insideIcon;
    this.insideRadius = insideRadius;
    this.cylinderColor = cylinderColor;
    this.cylinderHeight = cylinderHeight;
    this.cylinderRadius = cylinderRadius;
    this.balloonInfo = balloonInfo;
    this.pin = pin;
  }

  static get tb() {
    return tbService.tb;
  }
}
export default BalloonDrawable;
