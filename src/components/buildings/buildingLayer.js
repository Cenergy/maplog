import mapboxgl from 'mapbox-gl';
import BuildingStore from './buildingStore';
import json2html from '../../utils/jsonToHtml';
import dataService from '../../services/dataService';

const BUILDINGLAYER_ID = 'BUILDINGLAYER_ID';
const BUILDINGLAYER_SOURCE = 'BUILDINGLAYER_SOURCE';

export default class BuildingLayer {
    constructor(option) {
        const { buildingUrl } = option;
        const BUILDING_SOURCE_URL = buildingUrl || `${dataService.baseUrl}jsondata/buildings.json`;
        this.buildingStore = new BuildingStore(BUILDING_SOURCE_URL);
        const { map } = option;
        this._map = map;
        this._buildingData = {
            features: [],
            type: 'FeatureCollection',
        };

        this.constuctMapLayer();
        this.hasLoad = false;
    }

    constuctMapLayer() {
        this._map.addSource(BUILDINGLAYER_SOURCE, {
            type: 'geojson',
            data: this._buildingData,
        });
        this._map.addLayer({
            id: BUILDINGLAYER_ID,
            source: BUILDINGLAYER_SOURCE,
            type: 'fill-extrusion',
            minzoom: 6,
            paint: {
                'fill-extrusion-color': '#aaa',
                'fill-extrusion-height': ['*', 3, ['to-number', ['get', 'HEIGHT']]],
                'fill-extrusion-opacity': 1,
            },
        });
    }

    async loadBuildingData() {
        console.log('go: BuildingLayer -> loadBuildingData -> hasLoad', this.hasLoad);
        if (this.hasLoad) {
            return;
        }
        this.hasLoad = true;
        const { data } = await this.buildingStore.get();
        console.log('go: BuildingLayer -> loadBuildingData -> data', data);
        this._map.getSource(BUILDINGLAYER_SOURCE).setData(data);
    }

    set visibility(value) {
        if (value) {
            this.loadBuildingData();
        }
        console.log('rd: BuildingLayer -> setvisibility -> value', value);
        this._map.setLayoutProperty(BUILDINGLAYER_ID, 'visibility', value ? 'visible' : 'none');
    }

    hightLightBuildings(options) {
        this.loadBuildingData();
        const { hightLightList, color = 'red' } = options;
        const list = [];
        if (hightLightList.length > 0) {
            hightLightList.forEach(buildingid => {
                list.push(['==', ['get', 'SMID'], buildingid]);
                list.push(color);
            });
            console.log('rd: BuildingLayer -> hightLightBuildings -> list', list);
            this._map.setPaintProperty(BUILDINGLAYER_ID, 'fill-extrusion-color', [
                'case',
                ...list,
                '#00214E',
            ]);
        }
    }

    removeHightLightBuildings() {
        this._map.setPaintProperty(BUILDINGLAYER_ID, 'fill-extrusion-color', '#aaa');
    }

    showBuildingBaseInfo(isShow, e) {
        if (isShow) {
            const features = this._map.queryRenderedFeatures(e.point, {
                layers: ['BUILDINGLAYER_ID'],
            });
            const res = features[0].properties;
            if (features.length > 0) {
                this.hightLightBuildings({
                    hightLightList: [features[0].properties.SMID],
                    color: '#20D2FF',
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
                    'bottom-left': [
                        linearOffset,
                        (markerHeight - markerRadius + linearOffset) * -1,
                    ],
                    'bottom-right': [
                        -linearOffset,
                        (markerHeight - markerRadius + linearOffset) * -1,
                    ],
                    left: [markerRadius, (markerHeight - markerRadius) * -1],
                    right: [-markerRadius, (markerHeight - markerRadius) * -1],
                };
                const el = document.createElement('div');
                el.style.backgroundColor = 'red';
                res.center = [
                    (Number(features[0].properties.SMSDRIW) +
                        Number(features[0].properties.SMSDRIE)) /
                        2,

                    (Number(features[0].properties.SMSDRIN) +
                        Number(features[0].properties.SMSDRIS)) /
                        2,
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
