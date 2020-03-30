import Drawable from './drawable';

/**
 * 路网特效绘制参数
 * @param {object} option 选项
 * @example
 * const option = {
 *   name:'roadLines',
 *   color: `rgba(0,167,255,1.0)`,
 *   width: 15, //线宽
 *   length: 860,  //线光流长
 *   speed: 15,    //播放速度
 *   pointsInLine: 150,  //此线条的差值点数量,越大则越密,视觉上显得越细腻。150为建议值。如此值越大则需要更大的speed才可以流动的一样快，超过200的值会导致初始运算时间长和性能影响
 *   type:'dashed',   //是否变为虚线,支持dashed和normal
 *   minZoom: 12,
 *   maxZoom: 19,
 * };
 *
 * // execute
 * const roadLinesDrawable = new RoadLinesDrawable(option)
 */
class RoadLinesDrawable extends Drawable {
    constructor(option) {
        super(option);
        const { urlKey, color, strokeWidth, length, speed, lineType } = option;
        this.urlKey = urlKey;
        this.color = color || 'rgba(0,167,255,1.0)';
        this.strokeWidth = strokeWidth || 10;
        this.length = length || 860;
        this.speed = speed || 15;
        this.lineType = lineType || 'dashed';
    }
}

export default RoadLinesDrawable;
