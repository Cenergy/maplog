import Drawable from './drawable';

/**
 * 扩散点的参数
 * @param {object} option 选项
 * @example
 * const option = {
 *   minZoom:10,
 *   maxZoom:19
 * };
 *
 * // execute
 * const linkLinesDrawable = new LinkLinesDrawable(option)
 */
class LinkLinesDrawable extends Drawable {
    constructor(option) {
        super(option);
        const { minZoom, maxZoom, users = [], mode = 'calling' } = option;
        this.minZoom = minZoom;
        this.maxZoom = maxZoom;
        this.users = users;
        this.mode = mode;
    }
}

export default LinkLinesDrawable;
