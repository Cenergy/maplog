import BuildingLayer from './buildingLayer';

/**
 *
 * _buildingArry所有建筑的layerID的数组集合
 * @class BuildingService
 */
class BuildingService {
  async init(option) {
    const { map } = option;
    this._map = map;
  }

  loadBuilding(options = {}) {
    const map = this._map;
    const { buildingUrl = null } = options;
    this._buildingLayer = new BuildingLayer({ map, buildingUrl });
  }

  showBuilding() {
    if (!this._buildingLayer) {
      console.warn('please loadBuilding first.');
      return;
    }
    this._buildingLayer.visibility = true;
  }

  hideBuilding() {
    if (!this._buildingLayer) {
      console.warn('please loadBuilding first.');
      return;
    }
    this._buildingLayer.visibility = false;
  }

  hightLightBuildings(options) {
    if (!this._buildingLayer) {
      console.warn('please loadBuilding first.');
      return;
    }
    this._buildingLayer.hightLightBuildings(options);
  }

  removeHightLightBuildings() {
    if (!this._buildingLayer) {
      console.warn('please loadBuilding first.');
      return;
    }
    this._buildingLayer.removeHightLightBuildings();
  }

  showBuildingInfo(isShowYou, e) {
    if (!this._buildingLayer) {
      console.warn('please loadBuilding first.');
      return;
    }
    if (!isShowYou) return;
    this._buildingLayer.showBuildingBaseInfo(isShowYou, e);
  }
}

export default new BuildingService();
