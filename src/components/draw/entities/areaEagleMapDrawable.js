import Drawable from './drawable';
import { HasCoordinate } from '../../mixin';

/**
 * 图片型图标绘制参数
 * @param {object} option 选项
 * @example
 * const option = {
 *   name:'AreaEagleMapDrawable',
 *   coordinates: [113.87572, 22.586208],
 *   zoom:18,
 *   domId:'areaEagleMapId',
 *   areaData:data
 * };
 *
 * // execute
 * const imageDrawable = new ImageDrawable(option)
 */
class AreaEagleMapDrawable extends Drawable {
    constructor(option) {
        super(option);
        Object.assign(this, new HasCoordinate(option));
        const {
            domId,
            zoom,
            areaData,
            targetField = 'OBJECTID',
            fillColor = '#088',
            outlineColor = 'yellow',
            pitch = 60,
            accessToken,
        } = option;
        this._domId = domId;
        this._zoom = zoom;
        this._areaData = areaData;
        this.targetField = targetField;
        this.fillColor = fillColor;
        this.outlineColor = outlineColor;
        this.pitch = pitch;
        this.accessToken = accessToken;
    }
}

export default AreaEagleMapDrawable;
