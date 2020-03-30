import { Threebox, THREE } from '@rdapp/threebox';
import webgisvisualization from '@rdapp/webgisvisualization';
import HandlerBase from './handlerBase';
import tbService from '../../../services/tbService';
import ColorFormat from '../../../utils/colorFormat';

window.Threebox = Threebox;
window.THREE = THREE;

// 返回了一个在指定值之间的随机数。这个值不小于 min（有可能等于），并且小于（不等于）max。
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

export default class GlowBindHandler extends HandlerBase {
    constructor(option) {
        super(option);
        const { dataService } = option;
        this._dataService = dataService;
        this._lineContainer = [];
    }

    _addCore(drawable) {
        const { height, radius, color, coordinate, lineNum, lineColor = color } = drawable;
        const { tb } = tbService;
        const glowBind = new webgisvisualization.GlowBind({
            height,
            center: coordinate,
            radius,
            // 颜色以及透明度
            color,
            THREE,
            Threebox: tb,
        });
        // const position = [coordinate[0], coordinate[1], 0];
        // this._ps = tb.Object3D({ obj: glowBind.plane }).setCoords(position);
        const rgbLine = new ColorFormat({ color: lineColor, format: 'rgb' }).complete || `0,254,255`;

        for (let i = 0; i < lineNum; i += 1) {
            const line = new webgisvisualization.RoundnessLine({
                center: coordinate,
                // 飞行线半径,单位米
                radius,
                // 飞行线离地高度
                height: 50,
                // 飞行线材质,可不填
                texture: `${this._dataService.baseUrl}commondata/mapRelated/meshline.png`,
                // 飞行线颜色
                color: `rgba(${rgbLine},0.2)`,
                // 飞行线速度
                speed: getRandomArbitrary(1, 5),
                // 飞行线线身长度
                length: 300,
                // 飞行线宽度
                width: 200,
                // THREE对象
                THREE,
                // threeBox对象
                Threebox: tb,
            });
            this._lineContainer.push(line);
        }

        return { ps: glowBind, lines: this._lineContainer };
    }

    _updateCore(drawable) {
        const { coordinate } = drawable;
        this._ps.setCoords(coordinate);
    }

    _removeCore(drawableID) {
        const realDrawable = this._drawableRelation.get(drawableID);
        const { ps, lines = [] } = realDrawable;
        if (ps) ps.remove();
        if (lines.length) lines.map(line => line.remove());
        this._map.repaint = true;
    }

    _setVisibility(drawableID, visiable) {
        const realDrawable = this._drawableRelation.get(drawableID);
        console.log('Rd: GlowBindHandler -> _setVisibility -> realDrawable', realDrawable);
        const { ps, lines = [] } = realDrawable;
        if (ps) ps.setShow(visiable);
        if (lines.length) lines.map(line => line.setShow(visiable));
        this._map.repaint = true;
    }
}
