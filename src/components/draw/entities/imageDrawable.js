import Drawable from './drawable';
import { HasCoordinate } from '../../mixin';

/**
 * 图片型图标绘制参数
 * @param {object} option 选项
 * @example
 * const option = {
 *   name:'image',
 *   coordinate: [113.87572, 22.586208],
 *   imagePath:'http://10.8.9.78:3038/images/back.png',
 *   width:100,
 *   height:200,
 *   isShow:false,
 *   minZoom:10,
 *   maxZoom:19,
 *   offset:[0,0]  // marker的偏移量默认[0,0]
 *   length:100  //  文本的长度是图片的长度
 * };
 *
 * // execute
 * const imageDrawable = new ImageDrawable(option)
 */
class ImageDrawable extends Drawable {
    constructor(option) {
        super(option);
        Object.assign(this, new HasCoordinate(option));
        const {
            imagePath,
            width = 50,
            height = 100,
            title = '',
            popupInfo = null,
            popupClassName = 'popupClassName',
            offset = [0, 0],
            userData = {},
            length,
            element,
        } = option;
        this.element=element
        this._imagePath = imagePath;
        this.title = title;
        this._width = width;
        this._height = height;
        this.popupInfo = popupInfo;
        this.popupClassName = popupClassName;
        this.userData = userData;
        this.offset = offset;
        this.length = length;
    }
}

export default ImageDrawable;
