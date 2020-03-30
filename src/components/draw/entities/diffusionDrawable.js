import Drawable from './drawable';

/**
 * 扩散点的参数
 * @param {object} option 选项
 * @example
 * const option = {
 *   data:geojson,   //点的geojson数据
 *   minZoom:10,
 *   maxZoom:19,
 *   radius:60   //圆的半径，默认60
 * };
 *
 * // execute
 * const diffusionDrawable = new DiffusionDrawable(option)
 */
class DiffusionDrawable extends Drawable {
    constructor(option) {
        super(option);
        const { data, color = 'cyan', radius = 60 } = option;
        this.data = data;
        this.color = color;
        this.radius = radius;
    }
}

export default DiffusionDrawable;
