import Drawable from './drawable';
import { HasCoordinate } from '../../mixin';
/**
 * sprite 动画效果
 * @param {object} option 选项
 * @example
 * const option = {
 *   coordinates: [113.87572, 22.586208],
 *   minZoom:10,
 *   maxZoom:19
 * };
 *
 * // execute
 * const spriteImageDrawable = new SpriteImageDrawable(option)
 */
class SpriteImageDrawable extends Drawable {
    constructor(option) {
        super(option);
        Object.assign(this, new HasCoordinate(option));
        const { img, size, row, col, data = null } = option;
        this.img = img;
        this.size = size;
        this.row = row;
        this.col = col;
        this.data = data;
    }
}

export default SpriteImageDrawable;
