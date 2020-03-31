/* eslint-disable class-methods-use-this */
import find from 'lodash/find';
import filter from 'lodash/filter';
import layerDataService from './layerDataService';
import GpsLayer from '../components/layer/layerEntities/gpsLayer';
import PointLayer from '../components/layer/layerEntities/pointLayer';
import PointLayerHandler from '../components/layer/layerHandlers/pointLayerHandler';
import asyncGetJson from '../utils/getGeojson';
import GpsLayerHandler from '../components/layer/layerHandlers/gpsLayerHandler';

class LayerService {
  async init(option) {
    const { dataService, mapSdk } = option;
    this._dataService = dataService;
    this._mapSdk = mapSdk;
    this._init = false;
    this._layers = [];
  }

  async initLayers() {
    const { layers, dataUrls } = await layerDataService.requestLayerSource();
    this._layers = layers.map((l) => {
      if (l.typeGroupKey === 'GPS') {
        const gpsLayer = new GpsLayer(l);
        gpsLayer.isShow = false;
        return gpsLayer;
      }
      const pointLayer = new PointLayer(l);
      pointLayer.isShow = false;
      return pointLayer;
    });
    const mapSdk = this._mapSdk;

    // 构建点位图层处理器
    const datas = await this._getPointDatas(dataUrls);
    const pointLayers = filter(this._layers, o => o instanceof PointLayer);
    console.log('rd: LayerService -> initLayers -> pointLayers', this._layers);
    console.log('rd: LayerService -> initLayers -> pointLayers', pointLayers);
    this._pointLayerHandler = new PointLayerHandler({ mapSdk, pointLayers, datas });

    // 构建Gps图层处理器
    const gpsLayers = filter(this._layers, o => o instanceof GpsLayer);
    this._gpsLayerHandler = new GpsLayerHandler({ mapSdk, gpsLayers });

    this._pointLayerHandler.handle();
    this._gpsLayerHandler.handle();

    this._init = true;
  }

  getAllLayers() {
    if (!this._init) {
      throw new Error('LayserService is not initialized.');
    }
    return this._layers;
  }

  hideLayers(layerIds) {
    if (!this._init) {
      throw new Error('LayserService is not initialized.');
    }
    this._changeLayersVisibility(layerIds, false);
  }

  showLayers(layerIds) {
    if (!this._init) {
      throw new Error('LayserService is not initialized.');
    }
    this._changeLayersVisibility(layerIds, true);
  }

  async _getPointDatas(dataUrls) {
    const datas = {
      type: 'FeatureCollection',
      name: 'allPointData',
      crs: {
        type: 'name',
        properties: {
          name: 'urn:ogc:def:crs:OGC:1.3:CRS84',
        },
      },
      features: [],
    };
    for (let index = 0; index < dataUrls.length; index += 1) {
      const { url } = dataUrls[index];
      try {
        // eslint-disable-next-line no-await-in-loop
        const { data: geoJsonData } = await asyncGetJson(this._getGeoUrl(url));
        console.log('rd: LayerService -> _getPointDatas -> url', url);
        console.log('rd: LayerService -> _getPointDatas -> geoJsonData', geoJsonData);
        const { features } = geoJsonData;
        datas.features = datas.features.concat(features);
      } catch (error) {
        console.warn('rd: LayerService -> _getPointDatas -> error', error);
      }
    }
    return datas;
  }

  _getGeoUrl(url) {
    return `${this._dataService.baseUrl}geoData/${url}`;
  }

  _changeLayersVisibility(layerIds, isShow) {
    layerIds.forEach((layerId) => {
      const layer = find(this._layers, o => o._id === layerId);
      if (layer) {
        layer.isShow = isShow;
      }
    });
  }
}

export default new LayerService();
