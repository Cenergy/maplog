class LayerZIndexHelper {
  init(map) {
    this._map = map;
    this._layerFloors = new Map();
    this._layerFloors.set('road-label', ['raster', 'background']);
    this._layerFloors.set('waterway-label', ['fill-extrusion']);
    this._layerFloors.set('poi-label', ['line']);
    this._layerFloors.set('state-label', ['fill', 'heatmap']);
    this._layerFloors.set('country-label', ['symbol', 'circle', 'hillshade']);
  }

  /**
     * 根据图层类型获取相应下一层图层的id
     * @name getLayerZIndex
     * @param {string} layerType 入参，图层类型：symbol/fill-extrusion/raster...
     * @example 入参示例：
     * const layerType = 'line';
     * @returns {string} 对应图层ID
     * @example 接口调用示例
     * // execute
     * getLayerZIndex(layerType);
     */
  getLayerZIndex(layerType) {
    let layerID = null;
    this._layerFloors.forEach((value, key) => {
      if (value.indexOf(layerType) !== -1) {
        layerID = key;
      }
    });
    console.log('rd: LayerZIndexHelper -> getLayerZIndex -> layerID', layerID);
    return layerID;
  }
}

export default new LayerZIndexHelper();
