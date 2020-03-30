import HandlerBase from './handlerBase';
import latLngsCalculator from '../../../utils/latLngsCalculator';
import tbService from '../../../services/tbService';
import mathUtils from "../../../utils/mathUtils";
import eventAggregator from '../../pubsubRelated/mapEventAggregator';
import { THREEJS_MODEL_DRAWABLE_TYPE } from '../../drawableTypeKey';

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
    tbService.tb.loadGLTF(options, model => {
      if (this.cache.isRemove) {
        return;
      }
      this._modelTemplate = model.setCoords(this.cache.coordinate);
      this._modelTemplate.info = this;
      tbService.tb.add(this._modelTemplate);

      if (!this.cache.isShow) {
        this._modelTemplate.visible = false;
      }
      this._map.repaint = true;
      this.hasDrawed = true;
    });

    this._map.on('click', this._chooseThreeObject);
  }

  _chooseThreeObject(e) {
    const threebox = tbService.tb;
    const event = e.originalEvent;
    const selectedMeshs = threebox.queryRenderedFeatures(event);

    if (selectedMeshs.length) {
      const result = selectedMeshs.find(selectedMesh => {
        return selectedMesh.object !== null;
      });

      if (!result) {
        return;
      }

      const userData = mathUtils.getTargetObjectInfo(result.object, 'info', 'parent');

      const option = {
        dataSource: userData.drawable,
        type: THREEJS_MODEL_DRAWABLE_TYPE
      }
      const topic = eventAggregator.getAllEventTopics().MapClicked;
      eventAggregator.publish(topic, option);
    }
  }

  update() {
    const newCoordinate = this.drawable.coordinate;
    if (!this.hasDrawed) {
      this.cache.coordinate = newCoordinate;
      return;
    }
    const bearing = latLngsCalculator.calcTwoPointsBearing(
      this.cache.coordinate,
      newCoordinate
    );
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
    tbService.tb.remove(this._modelTemplate);
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
