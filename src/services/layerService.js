/* eslint-disable class-methods-use-this */
import find from 'lodash/find';
import filter from 'lodash/filter';
import * as turf from '@turf/turf';
// import GpsLayer from '../components/layer/layerEntities/gpsLayer';
import PointLayer from '../components/layer/layerEntities/pointLayer';
import PointLayerHandler from '../components/layer/layerHandlers/pointLayerHandler';
import asyncGetJson from '../utils/getGeojson';
// import GpsLayerHandler from '../components/layer/layerHandlers/gpsLayerHandler';

import * as requestService from './requestService';

class LayerService {
    async init(option) {
        console.log(`RD: LayerService -> init -> option`, option);
        const { dataService, maplog } = option;
        this._dataService = dataService;
        this._maplog = maplog;
        this._init = false;
        this._layers = [];
    }

    async initLayers({ featureToDrawable }) {
        try {
            // const { layers, dataUrls } = await layerDataService.requestLayerSource();
            const layers = await requestService.layers();
            console.log(`RD: LayerService -> initLayers -> layers`, layers);

            this._layers = layers.map(l => {
                // const { typeGroupKey = null } = l;
                // if (typeGroupKey && typeGroupKey.toLowerCase() === 'gps') {
                //     const gpsLayer = new GpsLayer(l);
                //     gpsLayer.isShow = false;
                //     return gpsLayer;
                // }
                const pointLayer = new PointLayer(l);
                pointLayer.isShow = false;
                return pointLayer;
            });
            const maplog = this._maplog;

            // 构建点位图层处理器
            // const datas = await this._getPointDatas(dataUrls);
            const facilities = await requestService.facilities();
            const events = await requestService.events();
            // const cameras = await requestService.cameras();

            const facilitiesGeo = this._facilitiesToGeojson(facilities);
            const eventsGeo = this._eventsToGeojson(events);
            // const camerasGeo = this._camerasToGeojson(cameras);

            const features = turf.featureCollection([...facilitiesGeo, ...eventsGeo, ]);

            const pointLayers = filter(this._layers, o => o instanceof PointLayer);

            this._pointLayerHandler = new PointLayerHandler({ maplog, pointLayers, datas: features, featureToDrawable });

            // 构建Gps图层处理器
            // const gpsLayers = filter(this._layers, o => o instanceof GpsLayer);
            // this._gpsLayerHandler = new GpsLayerHandler({ maplog, gpsLayers });

            this._pointLayerHandler.handle();
            // this._gpsLayerHandler.handle();
        } catch (error) {
            console.log('Rdapp: LayerService -> initLayers -> error', error);
        } finally {
            this._init = true;
        }
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

    _facilitiesToGeojson(dataList) {
        return dataList
            .filter(item => item.analysisType)
            .map(item => {
                const geoPoint = turf.point([item.longitude, item.latitude]);
                geoPoint.properties = item;
                geoPoint.properties.TypeID = item.typeId;
                return geoPoint;
            });
    }

    _eventsToGeojson(dataList) {
        return dataList
            .filter(item => item.longitude && item.latitude)
            .map(item => {
                const geoPoint = turf.point([item.longitude, item.latitude]);
                geoPoint.properties = item;
                geoPoint.properties.TypeID = item.typeId;
                geoPoint.properties.analysisType = 'Event';
                return geoPoint;
            });
    }

    _camerasToGeojson(dataList) {
        return dataList.map(camera => {
            const geoPoint = turf.point([camera.lo, camera.la]);
            geoPoint.properties = camera;
            geoPoint.properties.id = camera.resourceId;
            geoPoint.properties.TypeID = '121000100000';
            geoPoint.properties.analysisType = 'Camera';
            return geoPoint;
        });
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
        return `${this._dataService.baseUrl}citydata/shenzhen/${url}`;
    }

    _changeLayersVisibility(layerIds, isShow) {
        layerIds.forEach(layerId => {
            const layer = find(this._layers, o => o._id === layerId);
            if (layer) {
                layer.isShow = isShow;
            }
        });
    }
}

export default new LayerService();
