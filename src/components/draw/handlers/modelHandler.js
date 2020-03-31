import HandlerBase from './handlerBase';
import latLngsCalculator from '../../../utils/latLngsCalculator';
import modelService from '../../../services/modelService';

class DrawableWrapper {
  constructor(map, drawable) {
    this._map = map;
    this.drawable = drawable;
    this.cache = {
      coordinate: drawable.coordinate,
      isShow: drawable.isShow,
      isRemove: false,
    };
    this.hasDrawed = false;
    this._modelTemplate = null;
  }

  draw() {
    const { modelUrl } = this.drawable;
    const options = {
      obj: modelUrl,
      scale: this.drawable.scale,
    };

    console.log('go: DrawableWrapper -> draw -> modelService.tb', modelService.tb);
    modelService.tb.loadGLTF(options, (model) => {
      if (this.cache.isRemove) {
        return;
      }
      this._modelTemplate = model.setCoords(this.cache.coordinate);
      modelService.tb.add(this._modelTemplate);
      if (!this.cache.isShow) {
        this._modelTemplate.visible = false;
        this._map.repaint = true;
      }
      this.hasDrawed = true;
    });
  }

  update() {
    const newCoordinate = this.drawable.coordinate;
    if (!this.hasDrawed) {
      this.cache.coordinate = newCoordinate;
      return;
    }
    const bearing = latLngsCalculator.calcTwoPointsBearing(this.cache.coordinate, newCoordinate);
    const rotation = this._calcRelativeAngle(bearing);
    this._modelTemplate.setCoords(newCoordinate);
    this._modelTemplate.setRotation({ x: 0, y: 0, z: rotation });
    this._map.repaint = true;
    this.cache.coordinate = newCoordinate;
  }

  remove() {
    if (!this.hasDrawed) {
      this.cache.isRemove = true;
      return;
    }
    modelService.tb.remove(this._modelTemplate);
    this._map.repaint = true;
  }

  toggleShow(isShow) {
    if (!this.hasDrawed) {
      this.cache.isShow = isShow;
      return;
    }
    this._modelTemplate.visible = isShow;
    this._map.repaint = true;
  }

  _calcRelativeAngle(turfAngle) {
    if (turfAngle >= 0 && turfAngle < 180) {
      return 180 - turfAngle;
    }
    if (turfAngle > -180 && turfAngle < 0) {
      return 180 + Math.abs(turfAngle);
    }
    return 0;
  }
}

export default class ThreeJsModelHandler extends HandlerBase {
  _addCore(drawable) {
    console.log('go: ThreeJsModelHandler -> _addCore -> drawable', drawable);
    const wrapper = new DrawableWrapper(this._map, drawable);
    wrapper.draw();
    return wrapper;
  }

  async _updateCore(drawable) {
    const wrapper = this._drawableRelation.get(drawable._id);
    if (wrapper) {
      wrapper.update();
    }
  }

  _removeCore(drawableID) {
    const wrapper = this._drawableRelation.get(drawableID);
    if (wrapper) {
      wrapper.remove();
    }
  }

  async _setVisibility(drawableID, visiable) {
    const wrapper = this._drawableRelation.get(drawableID);
    if (wrapper) {
      wrapper.toggleShow(visiable);
    }
  }
}
