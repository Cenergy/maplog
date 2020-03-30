import Drawable from './drawable';

/**
 * 反光地板的参数
 * @param {object} option 选项
 * @example
 * const option = {
 *   minZoom:10,
 *   maxZoom:19,
 *   region:[[   //是个符合geojson格式中coordinates的包围形
 *   [1,2],[2,3]
 * ]],
 *   holes: [1,2],      //传入灰度图点位和半径信息,也可不传
 *   size:1,   //整体符号的大小,默认为1
 *   space:1    //整体符号间隔,默认为1,
 *   color:`rgba(0,165,255,1.0)`, //颜色和透明度,默认为'rgba(0,165,255,1.0)',
 *   type:"circle",   //图元类型,支持tringle三角,circle圆形,plane方形,默认tringle
 * };
 *
 * // execute
 * const reflectPlaneDrawable = new ReflectPlaneDrawable(option)
 */
class ReflectPlaneDrawable extends Drawable {
    constructor(option) {
        super(option);
        const {
            region,
            holes = [],
            color = `rgba(0,165,255,1.0)`,
            size = 2,
            space = 3,
            type = 'tringle',
            needAnimation = false,
            speed = 3,
        } = option;
        this.region = region;
        this.holes = holes;
        this.color = color;
        this.size = size;
        this.space = space;
        this.type = type;
        this.needAnimation = needAnimation;
        this.speed = speed;
    }
}

export default ReflectPlaneDrawable;
