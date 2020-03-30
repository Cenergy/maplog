import { Threebox, THREE } from '@rdapp/threebox';
import webgisvisualization from '@rdapp/webgisvisualization';
import HandlerBase from './handlerBase';
import tbService from '../../../services/tbService';

console.log('Rd: webgisvisualization', webgisvisualization);

// @ts-ignore
window.Threebox = Threebox;
// @ts-ignore
window.THREE = THREE;

export default class FlylineHandler extends HandlerBase {
    constructor(option) {
        super(option);
        const { dataService } = option;
        this._dataService = dataService;
    }

    _addCore(drawable) {
        const { coordinates, _color, _strokeWidth, pointCount, _isShow, speed } = drawable;
        const points = this._calcLinePoints(coordinates[0], coordinates[1], pointCount);
        const { tb } = tbService;

        // 添加飞线实线
        const option = {
            geometry: points,
            color: _color,
        };
        const lineMesh = tb.line(option);
        tb.add(lineMesh);

        // 添加飞线流动动画
        const p2 = [];
        points.forEach(point => {
            const arr = [];
            arr.push(point[0], point[1], point[2]);
            p2.push(arr);
        });

        // const rp = tb.utils.lnglatsToWorld(p2);

        const flyline = new webgisvisualization.FlyLine({
            // 材质,也可以不写,缺乏渐变效果
            texture: `${this._dataService.baseUrl}commondata/mapRelated/meshline.png`,
            // 颜色以及透明度
            color: _color,
            // 坐标[[x,y,z],[x,y,z],[x,y,z],[x,y,z]]
            position: p2,
            // 线宽
            width: _strokeWidth,
            // 线长度
            length: 40,
            // 播放速度
            speed,
            // 循环次数,默认无限大
            repeat: Infinity,
            // 场景
            // 线密度，越大则越细致
            pointnum: pointCount,

            // scene: tb.scene,
            // THREE对象
            THREE,
            Threebox: tb,
        });

        lineMesh.visible = _isShow;
        flyline.setShow(_isShow);

        return { lineMesh, flyline };
    }

    _calcLinePoints(start, end, pointCount) {
        const line = [];
        const tempElevation = Math.abs((end[0] - start[0]) * (end[1] - start[1])) ** 0.5;
        const maxElevation = tempElevation * 80000;
        const offset = [end[0] - start[0], end[1] - start[1]].map(direction => direction / pointCount);

        for (let l = 0; l <= pointCount; l += 1) {
            let waypoint = offset.map(direction => direction * l);
            waypoint = [start[0] + waypoint[0], start[1] + waypoint[1]];
            const waypointElevation = Math.sin((Math.PI * l) / pointCount) * maxElevation;
            waypoint.push(waypointElevation);
            line.push(waypoint);
        }
        return line;
    }

    _updateCore(drawable) {
        console.log('rd: FlylineHandler -> _updateCore -> drawable', drawable);
    }

    _removeCore(drawableID) {
        const realDrawable = this._drawableRelation.get(drawableID);
        const { lineMesh, flyline } = realDrawable;
        tbService.tb.remove(lineMesh);

        flyline.remove();
        this._map.repaint = true;
    }

    _setVisibility(drawableID, visiable) {
        const realDrawable = this._drawableRelation.get(drawableID);
        if (!realDrawable) {
            console.warn(`RD: FlyLineHandler -> _setVisibility -> realDrawable is null,!`, drawableID);
            return;
        }
        const { lineMesh, flyline } = realDrawable;
       // console.log('Rd: FlylineHandler -> _setVisibility -> flyline', flyline);
        lineMesh.visible = visiable;
        flyline.setShow(visiable);
        this._map.repaint = true;
    }
}
