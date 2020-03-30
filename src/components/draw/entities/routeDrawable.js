import Drawable from './drawable';
import { HasCoordinates } from '../../mixin';

/**
 * 路径绘制参数
 * @param {object} option 选项
 * @example
 * const option = {
 *   name:'route',
 *   duration: 15454,
 *   distance: 48784,
 *   coordinates: [[113.958263, 22.559213],[113.87572, 22.586208]],
 *   isDynamicDraw: true, // 动态绘制路径
 *   frequency: 3,        // 动态绘制速度，默认3，值越大，速度越快,值必须小于coordinates长度-1
 *   isShowDetail：true, // 显示详情
 *   minZoom: 10,
 *   maxZoom: 16,
 * };
 *
 * // execute
 * const routeDrawable = new RouteDrawable(option)
 */
class RouteDrawable extends Drawable {
    constructor(option) {
        super(option);
        Object.assign(this, new HasCoordinates(option));
        const { distance, duration, isShowDetail = true, needRepeat, isDynamicDraw, strokeThickness, frequency } = option;
        this.distance = distance;
        this.duration = duration;
        this.isShowDetail = isShowDetail;
        this.needRepeat = needRepeat || false;
        this.isDynamicDraw = isDynamicDraw || false;
        this.strokeThickness = strokeThickness || 10;
        this.frequency = frequency || 3;
    }
}

export default RouteDrawable;
