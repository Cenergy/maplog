import { Threebox, THREE } from '@rdapp/threebox';
import webgisvisualization from '@rdapp/webgisvisualization';
import HandlerBase from './handlerBase';
// import SphereShader from '../entities/threeEntities/sphereShader';
import tbService from '../../../services/tbService';

// @ts-ignore
window.Threebox = Threebox;
// @ts-ignore
window.THREE = THREE;

export default class SphereShaderHandler extends HandlerBase {
    constructor(option) {
        super(option);
        const { dataService } = option;
        this._dataService = dataService;
    }

    _addCore(drawable) {
        const { coordinate, color, radius, wavecolor, wavegap, speed, wavenums, needinfinite, faxx } = drawable;
        const { tb } = tbService;
        const config = {
            position: coordinate,
            Threebox: tb,
            THREE,
            // 球体颜色以及透明度
            color,
            // 球体半径,单位是米
            radius,
            // 波浪颜色以及透明度
            wavecolor,
            // 波浪运动速度
            speed,
            // 波浪宽度以及间隔
            wavegap,
            // 波浪数量，不能超过125
            wavenums,
            // 是否需要无线滚动,一旦设置无线滚动,wavenums会被默认设为125
            needinfinite,
            // 波纹抗锯齿,默认为5。越高则消耗的GPU资源越多,锯齿感越小。反之亦然。
            faxx,
        };
        const sphereShader = new webgisvisualization.SphereShader(config);
        return { sphereShader };
    }

    async _updateCore(drawable) {
        const { _id, coordinate, color, radius, wavecolor, wavegap, speed, wavenums, needinfinite, faxx } = drawable;
        const realDrawable = await this._drawableRelation.get(_id);
        if (!realDrawable) {
            console.warn(`RD: SphereShaderHandler -> _updateCore -> realDrawable is null!`);
            return;
        }
        const { sphereShader } = realDrawable;
        if (color) {
            sphereShader.setColor(color);
        }
        if (needinfinite) {
            sphereShader.setNeedinfinite(needinfinite);
        }
        if (wavenums) {
            sphereShader.setWaveNums(wavenums);
        }
        if (speed) {
            sphereShader.setSpeed(speed);
        }
        if (radius) {
            sphereShader.setRadius(radius);
        }
        if (wavegap) {
            sphereShader.setWaveGap(wavegap);
        }
        if (faxx) {
            sphereShader.setFaxx(faxx);
        }
        if (wavecolor) {
            sphereShader.setWaveColor(wavecolor);
        }
        if (coordinate) {
            sphereShader.setPosition(coordinate);
        }
    }

    async _removeCore(drawableID) {
        const realDrawable = await this._drawableRelation.get(drawableID);
        if (!realDrawable) {
            console.warn(`RD: SphereShaderHandler -> _removeCore -> realDrawable is null!`, drawableID);
            return;
        }
        const { sphereShader } = realDrawable;
        sphereShader.remove();
    }

    async _setVisibility(drawableID, visiable) {
        const realDrawable = await this._drawableRelation.get(drawableID);
        if (!realDrawable) {
            return;
        }
        const { sphereShader } = realDrawable;
        if (sphereShader) {
            sphereShader.setShow(visiable);
        }
    }
}
