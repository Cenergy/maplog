import HandlerBase from './handlerBase';

export default class SpreadHandler extends HandlerBase {
  constructor(option) {
    super(option);
    const { spreadService } = option;
    this._spreadService = spreadService;
  }

  _addCore(drawable) {
    console.log('go: SpreadHandler -> _addCore -> drawable', drawable);
    drawable.radarEffectItem.addToMap(this._map);
    drawable.radarEffectItem.tick();
    return drawable;
  }

  _updateCore(drawable) {
    const realDrawable = this._drawableRelation.get(drawable._id);
    if (!realDrawable) {
      return;
    }

    const { coordinate } = drawable;
    // 更新坐标
    if (realDrawable.radarEffectItem._coordinate !== coordinate) {
      realDrawable.radarEffectItem.updateCoordinate(drawable.radarEffectItem._distance, coordinate);
    }
  }

  _removeCore(drawableID) {
    const realDrawable = this._drawableRelation.get(drawableID);
    if (!realDrawable) {
      return;
    }
    realDrawable.remove();
  }

  _setVisibility(drawableID, visiable) {
    const realDrawable = this._drawableRelation.get(drawableID);
    if (!realDrawable) {
      return;
    }

    this._map.setLayoutProperty(drawableID, 'visibility', visiable ? 'visible' : 'none');
  }
}
