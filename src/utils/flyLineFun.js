import { THREE } from '@rdapp/threebox';
import tbService from '../services/tbService';
import FlyLine from '../components/draw/entities/threeEntities/flyLine';

function _calcLinePoints(start, end, pointCount) {
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
export function addFlyLine(options) {
    const { _color = '#10F80B', meshline = null, _strokeWidth = 60, pointCount = 100, _isShow = true, coordStart, coordEnd } = options;

    const points = _calcLinePoints(coordStart, coordEnd, pointCount);
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
    const rp = tb.utils.lnglatsToWorld(p2);
    const flyline = new FlyLine({
        // 材质,也可以不写,缺乏渐变效果
        texture: meshline,
        // 颜色以及透明度
        color: _color,
        // 坐标[{x,y,z},{x,y,z}]
        position: rp,
        // 线宽
        width: _strokeWidth,
        // 线长度
        length: 40,
        // 播放速度
        speed: 1,
        // 循环次数,默认无限大
        repeat: Infinity,
        // 场景
        // scene: tb.scene,
        // THREE对象
        THREE,
    });

    const line = tb.Object3D({ obj: flyline.line });
    tb.add(line);
    flyline.animation();

    lineMesh.visible = _isShow;
    line.visible = _isShow;
    return { lineMesh, line, flyline };
}
export function removeFlyLine(options) {
    const { lineMesh, line, flyline } = options;
    tbService.tb.remove(lineMesh);
    tbService.tb.remove(line);
    flyline.remove(tbService.tb);
}
export function setVisibility(flyLine, visiable) {
    const { lineMesh, line } = flyLine;
    lineMesh.visible = visiable;
    line.visible = visiable;
}
