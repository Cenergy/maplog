import Drawable from './drawable';
import { HasCoordinate } from '../../mixin';
import RadarEffectEntity from '../../radar/radarEffectEntity';

/**
 * 扩散型绘制参数
 * @param {object} option 选项
 * @example
 * const option = {
 *   imgPath:''
 *   coordinate: [113.958263, 22.559213],
 *   minZoom: 10,
 *   maxZoom: 16,
 *   spreadRank:2
 * };
 *
 * // execute
 * const spreadDrawable = new SpreadDrawable(option)
 */
class SpreadDrawable extends Drawable {
  constructor(option) {
    super(option);
    Object.assign(this, new HasCoordinate(option));
    const {
      imgPath, spreadRank = 0.2, coordinate, sourceOption,
    } = option;
    console.log('go: SpreadDrawable -> constructor -> _id');
    this._sourceOption = sourceOption;
    this._imgPath = imgPath;
    this._spreadRank = spreadRank;
    this.radarEffectItem = new RadarEffectEntity(this._id, {
      distance: RadarEffectEntity._getScanRadius(spreadRank),
      coordinate,
      frameCount: 41,
      urlPrifix: imgPath,
    });
  }
}

export default SpreadDrawable;
