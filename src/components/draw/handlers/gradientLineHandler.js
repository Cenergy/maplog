import HandlerBase from './handlerBase';

class GradientLineWrapper {
  constructor(map, drawable) {
    this._map = map;
    this.drawable = drawable;
    this.cache = {
      isShow: drawable.isShow,
      isRemove: false,
      ID: drawable.ID,
      lineData: drawable.lineData,
      lineWidth: drawable.lineWidth,
      gradient: drawable.gradient,
    };
    this.hasDrawed = false;
    this._gradientLineTemplate = null;
  }

  draw() {
    this._map.addSource(this.cache.ID, {
      type: 'geojson',
      lineMetrics: true,
      data: this.cache.lineData,
    });

    const gradientParameter = ['interpolate', ['linear'], ['line-progress']];
    const gradient = gradientParameter.concat(this.cache.gradient);

    this._map.addLayer({
      type: 'line',
      source: this.cache.ID,
      id: `${this.cache.ID}Layer`,
      paint: {
        'line-color': '#ffffff',
        'line-width': this.cache.lineWidth,
        'line-gradient': gradient,
      },
    });
  }

  toggleShow(isShow) {
    if (!this.hasDrawed) {
      this.cache.isShow = isShow;
      return;
    }
    this._gradientLineTemplate.visible = isShow;
    this._map.repaint = true;
  }
}

export default class GradientLineHandler extends HandlerBase {
  _addCore(drawable) {
    const wrapper = new GradientLineWrapper(this._map, drawable);
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
    const realDrawable = this._drawableRelation.get(drawableID);
    if (!realDrawable) {
      return;
    }
    realDrawable.remove();
  }

  async _setVisibility(drawableID, visiable) {
    const wrapper = this._drawableRelation.get(drawableID);
    if (wrapper) {
      wrapper.toggleShow(visiable);
    }
  }
}
