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
        return this;
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

    hightLightBuildingByRegion(options) {
        if (!this._buildingLayer) {
            console.warn('please loadBuilding first.');
            return;
        }
        this._buildingLayer.hightLightBuildingByRegion(options);
    }

    hightLightThreeBuildings(options) {
        if (!this._buildingLayer) {
            console.warn('please loadBuilding first.');
            return;
        }
        this._buildingLayer.hightLightThreeBuildings(options);
    }

    removeHightLightBuildings() {
        if (!this._buildingLayer) {
            console.warn('please loadBuilding first.');
            return;
        }
        this._buildingLayer.removeHightLightBuildings();
    }

    removeHightLightThreeBuildings(options) {
        this._buildingLayer.removeHightLightThreeBuildings(options);
    }

    showBuildingInfo(isShow, e) {
        if (!this._buildingLayer) {
            console.warn('please loadBuilding first.');
            return;
        }
        if (!isShow) return;
        this._buildingLayer.showBuildingBaseInfo(isShow, e);
    }
}

export default new BuildingService();
