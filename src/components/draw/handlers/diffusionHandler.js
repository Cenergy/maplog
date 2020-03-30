import HandlerBase from './handlerBase';
import * as diffusionFun from '../../../utils/diffusionFun';
import ColorFormat from '../../../utils/colorFormat';

const blankFeatureCollection = {
    type: 'FeatureCollection',
    features: [],
};

export default class DiffusionHandler extends HandlerBase {
    constructor(option) {
        super(option);
        const { map } = option;
        this.map = map;
    }

    _addCore(drawable) {
        const { layerId, data, color, radius } = drawable;
        const { map } = this;
        // 全部会转成rgb的字符串
        const colorConvert = new ColorFormat({ color, format: 'rgb' }).complete || `0,254,255`;
        return diffusionFun.addDiffusion({ layerId, data, map, rgb: colorConvert, length: radius });
    }

    _updateCore(drawable) {
        const { data } = drawable;
        const realDrawable = this._drawableRelation.get(drawable._id);
        const sourceName = realDrawable.source;
        if (this.map.getSource(sourceName)) {
            this.map.getSource(sourceName).setData(data);
        }
    }

    _removeCore(drawableID) {
        const realDrawable = this._drawableRelation.get(drawableID);
        if (!realDrawable) {
            return;
        }
        const sourceName = realDrawable.source;
        if (this.map.getSource(sourceName)) {
            this.map.getSource(sourceName).setData(blankFeatureCollection);
        }
    }

    _setVisibility(drawableID, visiable) {
        const realDrawable = this._drawableRelation.get(drawableID);

        if (!realDrawable) {
            return;
        }
        const layerID = realDrawable.id;

        if (this.map.getLayer(layerID)) {
            this.map.setLayoutProperty(layerID, 'visibility', visiable ? 'visible' : 'none');
        }
    }
}
