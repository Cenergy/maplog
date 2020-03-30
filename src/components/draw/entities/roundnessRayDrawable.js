import Drawable from './drawable';
import { HasCoordinate } from '../../mixin';
import tbService from '../../../services/tbService';

/**
 * 圆形放射点动效绘制参数
 * @param {object} option 选项
 * @example
 * const option = {
 *   coordinate: [113.87572, 22.586208], //圆心
 *   minZoom:10,
 *   maxZoom:19,
 *   color: "rgba(0,168,255,1.0)",
 *   height: 0, //飞行高度
 *  radius: 500, //半径,单位米
 *  gap: 10.0, //射线间隔
 *  length: 500, //线长
 *  strokeWidth: 100, //线宽
 *   speed: 10,  //运行速率
 *  pointnum: 500,
 * };
 *
 * // execute
 * const RoundnessRayDrawable = new BalloonDrawable(option)
 */
class RoundnessRayDrawable extends Drawable {
    constructor(option) {
        super(option);
        Object.assign(this, new HasCoordinate(option));
        const {
            color = 'rgba(0,168,255,1.0)',
            height = 0,
            radius = 500,
            gap = 10.0,
            length = 500,
            strokeWidth = 100,
            speed = 10,
            pointnum = 500,
        } = option;
        this.color = color;
        this.height = height;
        this.radius = radius;
        this.gap = gap;
        this.length = length;
        this.strokeWidth = strokeWidth;
        this.speed = speed;
        this.pointnum = pointnum;
    }
}
export default RoundnessRayDrawable;
