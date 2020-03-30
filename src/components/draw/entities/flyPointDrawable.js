import Drawable from './drawable';

/**
 * 场景小飞点绘制参数
 * @param {object} option 选项
 * @example
 * const option = {
 *   minZoom:10,
 *   maxZoom:19
 * };
 *
 * // execute
 * const flyPointDrawable = new FlyPointDrawable(option)
 */
class FlyPointDrawable extends Drawable {
    constructor(option) {
        super(option);
        const { bbox = [120.982938, 31.379083, 121.293527, 31.705539], number = 50, color = '#ffffff' } = option;
        this.bbox = bbox;
        this.number = number;
        this.color = color;
    }
}
export default FlyPointDrawable;
