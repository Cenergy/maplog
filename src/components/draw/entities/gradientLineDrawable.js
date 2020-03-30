import Drawable from './drawable';
import { HasCoordinates } from '../../mixin';
/**
 * 渐变线绘制参数
 * @param {object} option 选项
 * @example
 * const option = {
 *   name:'gradientLine',
 *   minZoom: 10,
 *   maxZoom: 16,
 * };
 *
 * // execute
 * const gradientLineDrawable = new GradientLineDrawable(option)
 */
class GradientLineDrawable extends Drawable {
  constructor(option) {
    super(option);
    Object.assign(this, new HasCoordinates(option));
    const {
      ID = 'gradientLine',
      lineData = 'http://10.8.9.203:8080/geoserver/TaiCang/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=TaiCang%3ATCLine_GS&maxFeatures=50&outputFormat=application%2Fjson',
      lineWidth = 4,
      gradient = [
        0,
        'blue',
        0.1,
        'royalblue',
        0.3,
        'cyan',
        0.5,
        'lime',
        1,
        'red',
      ]
    } = option;
    this.ID = ID;
    this.lineData = lineData;
    this.lineWidth = lineWidth;
    this.gradient = gradient;
  }
}

export default GradientLineDrawable;
