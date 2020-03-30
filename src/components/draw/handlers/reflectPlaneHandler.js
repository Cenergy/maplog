import { THREE } from '@rdapp/threebox';
import webgisvisualization from '@rdapp/webgisvisualization';
import HandlerBase from './handlerBase';
import tbService from '../../../services/tbService';

export default class ReflectPlaneHandler extends HandlerBase {
    constructor(option) {
        super(option);
        const { map } = option;
        this.map = map;
    }

    _addCore(drawable) {
        console.log('rd: ReflectPlaneHandler -> _addCore -> drawable', drawable);
        const { region: position, holes, size, space, color, type, needAnimation, speed } = drawable;
        const { tb } = tbService;
        const config = { THREE, threebox: tb, position, holes, size, space, color, type };
        const reflectPlanes = new webgisvisualization.ReflectPlanes(config);
        if (needAnimation) {
            reflectPlanes.animation(speed);
        }
        return reflectPlanes;
    }

    _updateCore(drawable) {
        const { holes, size, space, color, type } = drawable;
        const wrapper = this._drawableRelation.get(drawable._id);
        if (color) wrapper.setColor(color);
        if (type) wrapper.setType(type);
        if (space) wrapper.setSpace(space);
        if (size) wrapper.setSize(size);
        if (holes) wrapper.addHole(holes);
    }

    _removeCore(drawableID) {
        const wrapper = this._drawableRelation.get(drawableID);
        console.log('Rd: ReflectPlaneHandler -> _removeCore -> wrapper', wrapper);
        if (wrapper) wrapper.remove();
    }

    _setVisibility(drawableID, visiable) {
        const wrapper = this._drawableRelation.get(drawableID);
        console.log('Rd: ReflectPlaneHandler -> _setVisibility -> wrapper', wrapper);
        if (!wrapper) return;
        wrapper.setShow(visiable);
    }
}
