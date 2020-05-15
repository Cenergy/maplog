/* eslint-disable max-len */
// eslint-disable-next-line max-classes-per-file
import find from 'lodash/find';
import isEqual from 'lodash/isEqual';
import filter from 'lodash/filter';
import LayerHandlerBase from './handlerBase';
import zoomShowController from '../../zoomShowController';
import dataService from '../../../services/dataService';
import loadStyle from '../../../utils/loadCssStyle';
import eventAggregator from '../../pubsubRelated/mapEventAggregator';
import { POINT_FEATURES_LAYER_TYPE } from '../../drawableTypeKey';

const SOURCE_NAME_POINT_DATASOURCE = 'sourceNamePointDataSource';
const CLUSTER_NAME_POINT_DATASOURCE = 'clusterNamePointDataSource';
const CLUSTER_COUNT_NAME_POINT_DATASOURCE = 'clusterCountNamePointDataSource';
const POINT_NAME_POINT_DATASOURCE = 'pointNamePointDataSource';
const LAYER_POINT_CSS =
    '.pointLayer .mapboxgl-popup-content{background: rgba(0,0,0,0.5);} .pointLayer .mapboxgl-popup-tip{border-top-color: rgba(0,0,0,0.5);} .pointLayer .mapboxgl-popup-close-button{color:white}';
loadStyle.loadCssStyle(LAYER_POINT_CSS);

class CachedItem {
    constructor(options) {
        const { maplog, ftd } = options;
        this.maplog = maplog;
        this.drawable = null;
        this.ftd = ftd;
    }

    show(fe) {
        if (this.drawable) {
            this.drawable.isShow = true;
        } else {
            const d = this.ftd(fe);
            this.maplog.addDrawable(d);
            this.drawable = d;
        }
    }

    hide() {
        if (this.drawable) {
            this.drawable.isShow = false;
        }
    }
}

export default class PointLayerHandler extends LayerHandlerBase {
    constructor({ maplog, pointLayers, datas, featureToDrawable }) {
        super({ maplog });
        this._pointLayers = pointLayers;
        this._datas = datas;
        this._showLayerIds = null;
        this._cacheLayerVisibilities = new Map();
        this._isBusy = false;
        this.scattersId = [];
        this.drawables = [];
        this.featureToDrawable = featureToDrawable;
        this._cacheItems = new Map();
    }

    handle() {
        this._pointLayers.forEach(layer => {
        console.log(`RD: handle -> layer`, layer);
            if (!layer) return;
            this._cacheLayerVisibilities.set(layer.typeId, layer.isShow);
        });
        this._constructLayers();
        this._construtInteration();

        this._pointLayers.forEach(layer => {
            zoomShowController.register(layer, this._setVisibility.bind(this));
        });
        // this._loadLayerIcons();
    }

    _setVisibility(drawableID, visiable) {
        const layer = find(this._pointLayers, l => l._id === drawableID);
        this._cacheLayerVisibilities.set(layer.typeId, visiable);
        if (this._isBusy) {
            return;
        }
        this._isBusy = true;
        // 避免zoom变更时大量图层隐藏显示造成无意义的数据源更新
        // 也为了在大数据时增强效率
        setTimeout(() => {
            const newData = this._getDatas();
            // eslint-disable-next-line max-len
            if (newData) {
                this._maplog.map.getSource(SOURCE_NAME_POINT_DATASOURCE).setData(newData);
            }
            this._isBusy = false;
        }, 500);
    }

    _getDatas() {
        const showLayerIds = [];
        this._cacheLayerVisibilities.forEach((value, key) => {
            if (value) {
                showLayerIds.push(key);
            }
        });
        if (isEqual(this._showLayerIds, showLayerIds)) {
            return null;
        }
        this._showLayerIds = showLayerIds;

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
        const { features } = this._datas;
        datas.features = filter(features, f => {
            const { TypeID } = f.properties;
            return showLayerIds.includes(TypeID);
        });
        return datas;
    }

    _construtInteration() {
        this._maplog.map.on('click', CLUSTER_NAME_POINT_DATASOURCE, e => {
            const features = this._maplog.map.queryRenderedFeatures(e.point, {
                layers: [CLUSTER_NAME_POINT_DATASOURCE],
            });
            const clusterId = features[0].properties.cluster_id;
            this._maplog.map.getSource(SOURCE_NAME_POINT_DATASOURCE).getClusterExpansionZoom(clusterId, (err, zoom) => {
                if (err) return;
                this._maplog.map.easeTo({
                    center: features[0].geometry.coordinates,
                    zoom,
                });
            });
        });

        this._maplog.map.on('click', POINT_NAME_POINT_DATASOURCE, e => {
            const coordinates = e.features[0].geometry.coordinates.slice();
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            const option = {
                dataSource: e.features[0],
                type: POINT_FEATURES_LAYER_TYPE,
            };
            const topic = eventAggregator.getAllEventTopics().MapClicked;
            eventAggregator.publish(topic, option);
        });

        this._maplog.map.on('mouseenter', CLUSTER_NAME_POINT_DATASOURCE, () => {
            this._maplog.map.getCanvas().style.cursor = 'pointer';
        });
        this._maplog.map.on('mouseleave', CLUSTER_NAME_POINT_DATASOURCE, () => {
            this._maplog.map.getCanvas().style.cursor = '';
        });
        this._maplog.map.on('mouseenter', POINT_NAME_POINT_DATASOURCE, () => {
            this._maplog.map.getCanvas().style.cursor = 'pointer';
        });
        this._maplog.map.on('mouseleave', POINT_NAME_POINT_DATASOURCE, () => {
            this._maplog.map.getCanvas().style.cursor = '';
        });

        // 初始化的查询
        this._initFeatureHandle()
        // moveend后执行的
        this._maplog.map.on('moveend', () => {
            this._featuresHandle();
        });
        // 数据源变化的处理...
    }

    async _featuresHandle() {
        const results = this._queryFeatures();
        this._constructDrawable(results);
    }

    _initFeatureHandle() {
        // 每500ms查询有值的话立即取消，没有查询到值的话10s后取消timer
        // 地图移动立即取消
        const initTimer = setInterval(() => {
            const results = this._queryFeatures();
            if (results.length) {
                this._constructDrawable(results);
                clearInterval(initTimer);
            }
        }, 500);
        setTimeout(() => {
            if (initTimer) clearInterval(initTimer);
        }, 100000);
    }

    async _loadLayerIcons() {
        const { map } = this._maplog;
        const promises = [];

        this._pointLayers.forEach(layer => {
            const imagePath = `${dataService.baseUrl}commondata/icons/${layer.typeId}.png`;
            promises.push(
                new Promise((res, rej) => {
                    map.loadImage(imagePath, (error, image) => {
                        if (error) {
                            console.error(error);
                            rej();
                        }
                        map.addImage(layer.typeId, image);
                        res();
                    });
                })
            );
        });
        await Promise.all(promises);
        this._maplog.map.setLayoutProperty(POINT_NAME_POINT_DATASOURCE, 'icon-image', ['get', 'TypeID' || 'ParentID']);
    }

    _constructDrawable(queryResults) {
        // hide the feature
        this._cacheItems.forEach((value, key) => {
            const fe = queryResults.find(o => o.properties.id === key);
            if (!fe) {
                value.hide();
            }
        });

        // show add feature
        queryResults.forEach(re => {
            const featureId = re.properties.id;
            const hasCacheItem = this._cacheItems.has(featureId);
            let cacheItem;
            if (!hasCacheItem) {
                cacheItem = new CachedItem({ maplog: this._maplog, ftd: this.featureToDrawable });
                this._cacheItems.set(re.properties.id, cacheItem);
            } else {
                cacheItem = this._cacheItems.get(re.properties.id);
            }
            cacheItem.show(re);
        });
    }

    _constructLayers() {
        this._maplog.map.addSource(SOURCE_NAME_POINT_DATASOURCE, {
            type: 'geojson',
            data: this._getDatas(),
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 60,
        });
        this._maplog.map.addLayer({
            id: CLUSTER_NAME_POINT_DATASOURCE,
            type: 'circle',
            source: SOURCE_NAME_POINT_DATASOURCE,
            filter: ['has', 'point_count'],
            paint: {
                'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 100, '#f1f075', 750, '#f28cb1'],
                'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
            },
        });
        this._maplog.map.addLayer({
            id: CLUSTER_COUNT_NAME_POINT_DATASOURCE,
            type: 'symbol',
            source: SOURCE_NAME_POINT_DATASOURCE,
            filter: ['has', 'point_count'],
            layout: {
                'text-field': '{point_count_abbreviated}',
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 13,
            },
        });
    }

    _queryFeatures() {
        const { map } = this._maplog;
        const scatterFeatures = map.querySourceFeatures(SOURCE_NAME_POINT_DATASOURCE, {
            filter: ['!', ['has', 'point_count']],
        });
        return scatterFeatures;
    }
}
