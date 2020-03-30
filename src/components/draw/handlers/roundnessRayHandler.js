import { Threebox, THREE } from '@rdapp/threebox';
import webgisvisualization from '@rdapp/webgisvisualization';
import HandlerBase from './handlerBase';
import tbService from '../../../services/tbService';

// @ts-ignore
window.Threebox = Threebox;
// @ts-ignore
window.THREE = THREE;

export default class RoundnessRayHandler extends HandlerBase {
    constructor(option) {
        super(option);
        const { dataService } = option;
        this._dataService = dataService;
    }

    _addCore(drawable) {
        const { color, height, strokeWidth, length, speed, radius, coordinate, pointnum, gap } = drawable;

        const { tb } = tbService;
        const origin = [113.9959, 22.537178, 100];

        const config = {
            // 材质,增加磨砂感
            texture: `${this._dataService.baseUrl}commondata/mapRelated/meshline.png`,
            // 颜色以及透明度
            color,
            // 飞行高度
            height,
            // 半径,单位米
            radius,
            // 射线间隔
            gap,
            // 圆心
            center: coordinate,
            // 线长
            length,
            // 线宽
            width: strokeWidth,
            // 运行速率
            speed,
            pointnum,
            // THREE对象
            THREE,
            // threeBox对象
            Threebox: tb,
        };
        const lines = new webgisvisualization.RoundnessRay(config);
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
            console.warn(`RD: RoadLinesHandler -> _setVisibility -> realDrawable is null!`, drawableID);
            return;
        }
        const { lines } = realDrawable;
        lines.setShow(visiable);
    }
}
