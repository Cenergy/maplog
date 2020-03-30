import Drawable from './drawable';

/**
 * 场景小飞点绘制参数
 * @param {object} option 选项
 * @example
 * const option = {
 *   minZoom:10,
 *   maxZoom:19,
 *   bbox = [120.982938, 31.379083, 121.293527, 31.705539],  //左下、右上
 *   number = 50,
 *   color = '#ffffff',
 *   size = 5,
 *   height = 2000
 * };
 *
 * // execute
 * const flyParticleDrawable = new FlyParticleDrawable(option)
 */
class FlyParticleDrawable extends Drawable {
    constructor(option) {
        super(option);
        const { bbox = [120.982938, 31.379083, 121.293527, 31.705539], number = 50, color = '#ffffff', size = 5, height = 2000 } = option;
        this.bbox = bbox;
        this.number = number;
        this.color = color;
        this.size = size;
        this.height = height;
    }
}
export default FlyParticleDrawable;
