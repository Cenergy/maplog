import Drawable from './drawable';
import { HasCoordinate } from '../../mixin';

/**
 * 球形动态纹理绘制参数
 * @param {object} option 选项
 * @example
 * const option = {
 *   name:'roadLines',
 *   color: `rgba(0,167,255,1.0)`, // 球体颜色以及透明度
 *   radius: 100, // 球体半径,单位是米
 *   wavecolor: `rgba(255,138,0,1.0)`,  // 波浪颜色以及透明度
 *   speed: 0.3,    // 波浪运动速度
 *   wavegap: 1.2,  // 波浪宽度以及间隔
 *   wavenums: 5,   // 波浪数量，不能超过125
 *   needinfinite: true, // 是否需要无线滚动,一旦设置无线滚动,wavenums会被默认设为125
 *   faxx: 5  // 波纹抗锯齿,默认为5。越高则消耗的GPU资源越多,锯齿感越小。反之亦然。
 *   minZoom: 12,
 *   maxZoom: 19,
 * };
 *
 * // execute
 * const sphereShaderDrawable = new SphereShaderDrawable(option)
 */
class SphereShaderDrawable extends Drawable {
    constructor(option) {
        super(option);
        Object.assign(this, new HasCoordinate(option));
        const { color, radius, wavecolor, wavegap, speed, wavenums, needinfinite, faxx } = option;
        this.color = color || 'rgba(0,167,255,1.0)';
        this.wavecolor = wavecolor || `rgba(255,138,0,1.0)`;
        this.radius = radius || 100;
        this.wavegap = wavegap || 1.2;
        this.speed = speed || 0.3;
        this.wavenums = wavenums || 5;
        this.needinfinite = needinfinite || true;
        this.faxx = faxx || 5;
    }
}

export default SphereShaderDrawable;
