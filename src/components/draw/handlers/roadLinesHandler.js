import { Threebox, THREE } from '@rdapp/threebox';
import webgisvisualization from '@rdapp/webgisvisualization';
import HandlerBase from './handlerBase';
import RoadLines from '../entities/threeEntities/roadLines';
import tbService from '../../../services/tbService';
import asyncGetJson from '../../../utils/getGeojson';

// @ts-ignore
window.Threebox = Threebox;
// @ts-ignore
window.THREE = THREE;

export default class RoadLinesHandler extends HandlerBase {
    constructor(option) {
        super(option);
        const { dataService } = option;
        this._dataService = dataService;
    }

    async _addCore(drawable) {
        const { urlKey, color, strokeWidth, length, speed, lineType } = drawable;
        const features = await this._getRoadLineFeatures(urlKey);
        if (!features) {
            return null;
        }

        const { tb } = tbService;
        const config = {
            // 颜色以及透明度,透明度体现在稍近距离,远距离叠加作用感觉不明显
            color,
            // 需要展示的Geojson线中的features。数量在15000时帧率会下降到45左右(G1050)
            // 如有特别大量需求请合并features
            features: features.slice(0, 5000),
            // 线宽
            width: strokeWidth,
            // 线光流长
            length,
            // 播放速度
            speed,
            // 此线条的差值点数量,越大则越密,视觉上显得越细腻。150为建议值。如此值越大则需要更大的speed才可以流动的一样快
            // 超过200的值会导致初始运算时间长和性能影响
            pointsInLine: 150,
            // 是否变为虚线,支持dashed和normal
            type: lineType,
            // THREE对象
            THREE,
            Threebox: tb,
        };
        const lines = new webgisvisualization.RoadLines(config);
        return { lines };
    }

    async _updateCore(drawable) {
        const { _id, color, strokeWidth, length, speed, lineType } = drawable;
        const realDrawable = await this._drawableRelation.get(_id);
        const { lines } = realDrawable;
        if (color) {
            lines.setColor(color);
        }
        if (strokeWidth) {
            lines.setWidth(strokeWidth);
        }
        if (length) {
            lines.setLength(length);
        }
        if (speed) {
            lines.setSpeed(speed);
        }
        if (lineType) {
            lines.setType(lineType);
        }
    }

    async _removeCore(drawableID) {
        const realDrawable = await this._drawableRelation.get(drawableID);
        const { lines } = realDrawable;
        lines.remove();
    }

    async _setVisibility(drawableID, visiable) {
        const realDrawable = await this._drawableRelation.get(drawableID);
        if (!realDrawable) {
            console.warn(`RD: RoadLinesHandler -> realDrawable is null!`, drawableID);
            return;
        }
        const { lines } = realDrawable;
        lines.setShow(visiable);
    }

    async _getRoadLineFeatures(urlKey) {
        if (!urlKey) {
            return null;
        }

        const url = `${this._dataService.baseUrl}citydata/shenzhen/road/${urlKey}`;
        const datas = await asyncGetJson(url);
        return datas.data.features;
    }
}
