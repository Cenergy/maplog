/* eslint-disable max-len */
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';
import { THREE } from '@rdapp/threebox';
import BuildingStore from './buildingStore';
import json2html from '../../utils/jsonToHtml';
import layerZIndexHelper, { MIDDLE_FLOOR } from '../layerZIndexHelper';
import dataService from '../../services/dataService';
import tbService from '../../services/tbService';

import { HighLightBuilding } from './highLightBuilding';

const lodshArray = require('lodash/array');

const BUILDINGLAYER_ID = 'BUILDINGLAYER_ID';
const BUILDINGLAYER_SOURCE = 'BUILDINGLAYER_SOURCE';

export default class BuildingLayer {
    constructor(option) {
        const { buildingUrl } = option;
        const BUILDING_SOURCE_URL = buildingUrl || `${dataService.baseUrl}citydata/shenzhen/buildings.json`;
        this.buildingStore = new BuildingStore(BUILDING_SOURCE_URL);
        const { map } = option;
        this._map = map;
        this._buildingData = {
            features: [],
            type: 'FeatureCollection',
        };

        this.hightLightList = [];
        this.hightThreeList = [];
        this.hightLightID = [];
        this.hightLightThreeID = [];
        this.threeObjectList = [];

        this.constuctMapLayer();
        this.hasLoad = false;
    }

    constuctMapLayer() {
        const zIndexLayerID = layerZIndexHelper.getLayerZIndex(MIDDLE_FLOOR);
        this._map.addSource(BUILDINGLAYER_SOURCE, {
            type: 'geojson',
            data: this._buildingData,
        });
        this._map.addLayer(
            {
                id: BUILDINGLAYER_ID,
                source: BUILDINGLAYER_SOURCE,
                type: 'fill-extrusion',
                minzoom: 6,
                paint: {
                    'fill-extrusion-color': '#00214E',
                    'fill-extrusion-height': ['*', 3, ['to-number', ['get', 'HEIGHT']]],
                    'fill-extrusion-opacity': 1,
                },
            },
            zIndexLayerID
        );
    }

    async loadBuildingData() {
        // console.log('go: BuildingLayer -> loadBuildingData -> hasLoad', this.hasLoad);
        if (this.hasLoad) {
            return;
        }
        const { data } = await this.buildingStore.get();
        this._buildingData = data;
        this.hasLoad = true;

        this._map.getSource(BUILDINGLAYER_SOURCE).setData(data);
    }

    set visibility(value) {
        if (value) {
            this.loadBuildingData();
        }
        this._map.setLayoutProperty(BUILDINGLAYER_ID, 'visibility', value ? 'visible' : 'none');
    }

    hightLightBuildings(options = {}) {
        const { data = [], mode = 'add' } = options;
        if (mode === 'cover') this.hightLightList = [];

        this.loadBuildingData();

        if (data && data.length) {
            data.forEach(item => {
                const commVal = lodshArray.intersection(this.hightLightID, item.value);
                const realData = lodshArray.pullAll(item.value, commVal);
                if (!realData.length) return;
                this.hightLightID.push(...realData);
                this.hightLightList.push(realData);
                this.hightLightList.push(item.color);
            });
        } else {
            this.hightLightList = ['-1', '#00214E'];
        }
        this._map.setPaintProperty(BUILDINGLAYER_ID, 'fill-extrusion-color', ['match', ['get', 'SMID'], ...this.hightLightList, '#00214E']);
    }

    // const  { data, center, radius }=options
    hightLightBuildingByRegion(options = {}) {
        const { center, radius, color } = options;
        const getGeojsonTimer = setInterval(() => {
            if (this.hasLoad) {
                clearInterval(getGeojsonTimer);
                const regionData = this._filterDataByRegion({
                    data: this._buildingData,
                    center,
                    radius,
                });
                this.hightLightBuildings({
                    data: [{ value: regionData, color }],
                    mode: 'cover',
                });
            }
        }, 1000);
    }

    /**
     *
     * @param {*} options 选项 {data:Array必选项 ,color:String可选,outcolor:String可选}
     *
     * @returns {void}
     * execute
     * hightLightThreeBuildings({
     *       data: ['1','2'],
     *      color: `rgba(255,138,0,0.8)`,
     *       outercolor: `rgba(0,138,255,0.2)`,
     *   })
     */
    hightLightThreeBuildings(options = {}) {
        const { data = [], color = `rgba(255,138,0,0.8)`, outercolor = `rgba(0,138,255,0.2)` } = options;
        if (data && data.length) {
            // this.hightLightThreeID

            data.forEach(item => {
                const commVal = lodshArray.intersection(this.hightLightThreeID, item);
                const realData = lodshArray.pullAll(item, commVal);
                if (!realData) return;
                this.hightLightThreeID.push(realData);
                this.hightThreeList.push(realData);
                this.hightThreeList.push(0);
            });
        } else {
            this.hightThreeList = ['-1', 0];
        }

        this._map.setPaintProperty(BUILDINGLAYER_ID, 'fill-extrusion-height', [
            'match',
            ['get', 'SMID'],
            ...this.hightThreeList,
            ['*', 3, ['to-number', ['get', 'HEIGHT']]],
        ]);

        const getGeojsonTimer = setInterval(() => {
            if (this.hasLoad) {
                clearInterval(getGeojsonTimer);

                const filterThreeData = this._buildingData.features.filter(item => {
                    return data.includes(item.properties.SMID);
                    // console.log('Rd: BuildingTest -> _runCore -> item', );
                });
                // eslint-disable-next-line no-unused-expressions
                filterThreeData.length &&
                    filterThreeData.forEach(item => {
                        const coor = item.geometry.coordinates[0];
                        const height = Number(item.properties.HEIGHT) * 3;
                        const building = new HighLightBuilding({
                            // 原始geojson polygon坐标
                            position: coor,
                            // 建筑本体高，单位米
                            height,
                            // 建筑本体颜色,透明度
                            color,
                            // 是否需要生成包围盒,会极大影响性能
                            needbbox: true,
                            // 外围包围盒高，单位米
                            outerheight: height + 10,
                            // 外围盒颜色,透明度
                            outercolor,
                            // 是否需要蒙皮,会极大影响性能
                            needskin: false,
                            // 建筑皮肤蒙层颜色，建议与建筑同色，透明度设置低一些
                            skincolor: `rgba(255,138,0,0.2)`,
                            // 建筑蒙层厚度,单位是米
                            skinheight: 1,
                            // 包围盒缓冲区距离,单位公里
                            distance: 0.01,
                            // THREE对象
                            THREE,
                            // turf对象
                            turf,
                            // threebox对象
                            threebox: tbService.tb,
                        });
                        console.log('Rd: BuildingLayer -> getGeojsonTimer -> building', building);
                        building.container.forEach(items => {
                            const ps = tbService.tb.Object3D({ obj: items });
                            ps.buildingID = item.properties.SMID;
                            this.threeObjectList.push(ps);
                            tbService.tb.add(ps);
                        });
                    });
            }
        }, 1000);
        setTimeout(() => {
            clearInterval(getGeojsonTimer);
        }, 10000);
    }

    removeHightLightThreeBuildings() {
        const threeObjTimer = setInterval(() => {
            if (this.threeObjectList.length) {
                clearInterval(threeObjTimer);
                this.threeObjectList.forEach(item => {
                    tbService.tb.remove(item);
                });
                // this._map.setPaintProperty(BUILDINGLAYER_ID, 'fill-extrusion-color', '#00214E');
                this._map.setPaintProperty(BUILDINGLAYER_ID, 'fill-extrusion-height', ['*', 3, ['to-number', ['get', 'HEIGHT']]]);
                this.hightThreeList = [];
                this.hightLightThreeID = [];
                this.threeObjectList = [];
            }
        }, 1000);
        setTimeout(() => {
            clearInterval(threeObjTimer);
        }, 10000);
    }

    removeHightLightBuildings() {
        this._map.setPaintProperty(BUILDINGLAYER_ID, 'fill-extrusion-color', '#00214E');
        this.hightLightList = [];
        this.hightLightID = [];
    }

    _filterDataByRegion(options = {}) {
        const { data, center, radius } = options;
        const regionOption = {
            steps: 128,
            units: 'kilometers',
            properties: { info: 'option' },
        };
        const circle = turf.circle(center, radius, regionOption);
        return data.features
            .filter(item => {
                const rect = turf.polygon(item.geometry.coordinates[0]);
                return turf.booleanWithin(rect, circle);
            })
            .map(item => {
                return item.properties.SMID;
            });
    }

    showBuildingBaseInfo(isShow, e) {
        if (isShow) {
            const features = this._map.queryRenderedFeatures(e.point, {
                layers: ['BUILDINGLAYER_ID'],
            });
            if (features.length > 0) {
                const res = features[0].properties;
                this.hightLightBuildings({
                    data: [
                        {
                            value: [features[0].properties.SMID],
                            color: '#20D2FF',
                        },
                    ],
                    mode: 'cover',
                });
                // popup
                const markerHeight = 2;
                const markerRadius = 1;
                const linearOffset = 1;
                const coffient = 2 ** (this._map.getZoom() - 16);
                const popupOffsets = {
                    top: [0, 0],
                    'top-left': [0, 0],
                    'top-right': [0, 0],
                    bottom: [0, -Number(features[0].properties.HEIGHT) * 3 * coffient],
                    'bottom-left': [linearOffset, (markerHeight - markerRadius + linearOffset) * -1],
                    'bottom-right': [-linearOffset, (markerHeight - markerRadius + linearOffset) * -1],
                    left: [markerRadius, (markerHeight - markerRadius) * -1],
                    right: [-markerRadius, (markerHeight - markerRadius) * -1],
                };
                const el = document.createElement('div');
                el.style.backgroundColor = 'red';
                res.center = [
                    (Number(features[0].properties.SMSDRIW) + Number(features[0].properties.SMSDRIE)) / 2,

                    (Number(features[0].properties.SMSDRIN) + Number(features[0].properties.SMSDRIS)) / 2,
                ];
                new mapboxgl.Popup({
                    offset: popupOffsets,
                    anchor: 'bottom',
                })

                    .setLngLat(res.center)
                    .setHTML(json2html(features[0].properties))
                    .addTo(this._map);
            }
        }
    }
}
