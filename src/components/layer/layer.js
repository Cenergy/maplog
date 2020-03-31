/* eslint-disable class-methods-use-this */

class Layer {
  constructor(option) {
    const { name, typeId, map } = option;
    this._name = name;
    this._typeId = typeId;
    this._map = map;
    this._region = null;
    this.minZoom = 7;
    this.maxZoom = 18;
  }

  init() {}

  show() {}

  hide() {}

  setRegion(option) {
    console.log('rd: Layer -> setRegion -> option', option);
  }

  setMinMaxZoom(minZoom, maxZoom) {
    console.log('rd: Layer -> setMinMaxZoom -> minZoom', minZoom);
    console.log('rd: Layer -> setMinMaxZoom -> maxZoom', maxZoom);
  }

  dispose() {}
}

export default Layer;
