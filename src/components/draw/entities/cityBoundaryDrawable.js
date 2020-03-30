import Drawable from './drawable';
import { HasCoordinates } from '../../mixin';

/**
 * 城市边界范围效果绘制参数
 * @param {object} option 选项
 * @example
 * const option = {
 *   coordinates: [[113.958263, 22.559213],[113.87572, 22.586208],[113.968263, 22.559413],[113.958263, 22.559213]],
 *   urlKeys: ['shenzhen/boundary/fistrFloor.png','shenzhen/boundary/secondFloor.png'],
 *   minZoom: 3,
 *   maxZoom: 15,
 * };
 *
 * // execute
 * const cityBoundaryDrawable = new CityBoundaryDrawable(option)
 */
class CityBoundaryDrawable extends Drawable {
    constructor(option) {
        super(option);
        Object.assign(this, new HasCoordinates(option));
        const { urlKeys } = option;
        this.urlKeys = urlKeys;
    }
}

export default CityBoundaryDrawable;
