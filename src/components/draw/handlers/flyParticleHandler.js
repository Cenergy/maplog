import { Threebox, THREE } from '@rdapp/threebox';
import HandlerBase from './handlerBase';
import FlyParticles from '../entities/threeEntities/flyParticles';
import tbService from '../../../services/tbService';

window.Threebox = Threebox;
window.THREE = THREE;

export default class FlylineHandler extends HandlerBase {
    constructor(option) {
        super(option);
        const { dataService } = option;
        this._dataService = dataService;
    }

    _addCore(drawable) {
        const { bbox, number, color, size, height } = drawable;
        const { tb } = tbService;

        const p2 = [];
        p2.push([bbox[0], bbox[1], 0]);
        p2.push([bbox[0], bbox[3], 0]);
        p2.push([bbox[2], bbox[3], 0]);
        p2.push([bbox[2], bbox[1], 0]);

        const rp = tb.utils.lnglatsToWorld(p2);
        const flyParticles = new FlyParticles({
            // 材质,也可以不写,缺乏渐变效果
            texture: `${this._dataService.baseUrl}commondata/mapRelated/meshline.png`,
            // 颜色以及透明度
            color,
            // 坐标[{x,y,z},{x,y,z}],形成的一个多边形
            position: rp,
            // 离子大小
            size,
            // 上升高度,单位米,从地面算起
            height,
            // 播放速度
            speed: 1.5,
            // 离子数量
            numbers: number,
            // 颜色加深倍数1-50
            alpha: 20.0,
            // 循环次数,默认无限大
            repeat: Infinity,
            // THREE对象
            THREE,
        });

        const ps = tb.Object3D({ obj: flyParticles.points });
        tb.add(ps);
        flyParticles.animation();

        return ps;
    }

    _updateCore(drawable) {
        console.log('rd: FlylineHandler -> _updateCore -> drawable', drawable);
    }

    _removeCore(drawableID) {
        const realDrawable = this._drawableRelation.get(drawableID);
        const { lineMesh, line, flyline } = realDrawable;
        tbService.tb.remove(lineMesh);
        tbService.tb.remove(line);
        flyline.remove(tbService.tb);
        this._map.repaint = true;
    }

    _setVisibility(drawableID, visiable) {
        const realDrawable = this._drawableRelation.get(drawableID);
        realDrawable.visible = visiable;
        this._map.repaint = true;
    }
}
