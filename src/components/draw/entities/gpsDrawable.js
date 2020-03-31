import Drawable from './drawable';
import { HasCoordinate } from '../../mixin';

/**
 * GPS图标绘制参数
 * @param {object} option 选项
 * @example
 * const option = {
 *   name:'dispatcher',
 *   userID: '40020000187',
 *   typeID:'GPS-User'||'{2150A447-0620-4B9D-BA04-00F91EA0744F}' //GPS插件类型ID
 *   coordinate: [113.958263, 22.559213],
 *   minZoom: 10,
 *   maxZoom: 16,
 *   showScan: true,
 *   scanRadius: 500,
 * };
 *
 * // execute
 * const gpsDrawable = new GPSDrawable(option)
 */
class GPSDrawable extends Drawable {
  constructor(option) {
    super(option);
    Object.assign(this, new HasCoordinate(option));
    const {
      userID, typeID, showScan, scanRadius, canDrawRoute,
    } = option;
    this._userID = userID;
    this._typeID = typeID;
    this._showScan = showScan;
    this._scanRadius = scanRadius;
    this._canDrawRoute = canDrawRoute;
    this._blobArray = [];
  }
}

export default GPSDrawable;
