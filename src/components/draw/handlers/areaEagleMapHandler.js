import mapboxgl from 'mapbox-gl';
import PubSub from 'pubsub-js';
import axios from 'axios';
import * as turf from '@turf/turf';
import { Threebox, THREE } from '@rdapp/threebox';
import HandlerBase from './handlerBase';
import { IDName } from '../../pubsubRelated/pubSubData';
import eventTopic from '../../pubsubRelated/eventTopic';

import pubSubFactory from '../../pubsubRelated/pubSubFactory';

window.Threebox = Threebox;
window.THREE = THREE;

const blankGeojson = {
    features: [],
    type: 'FeatureCollection',
};
export default class AreaEagleMapHandler extends HandlerBase {
    _addCore(drawable) {
        const { _domId, _zoom: mapZoom, _areaData, targetField, coordinate, pitch, outlineColor, fillColor, accessToken } = drawable;
        // mapboxgl.accessToken = 'pk.eyJ1IjoiaHVvaHVsaTAwOCIsImEiOiJjanM3Z3B1eHMwNG0zNDRtajhhcXNnanQwIn0.7gLFPHv_tXytt_JYLMze4w';
        mapboxgl.accessToken = accessToken;
        const blankStyle = {
            version: 8,
            name: 'BlankMap',
            sources: {},
            glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
            layers: [],
        };
        const map = new mapboxgl.Map({
            container: _domId,
            zoom: mapZoom,
            center: coordinate,
            style: blankStyle,
            pitch,
        });
        // let tb;
        map.on('load', () => {
            const sourceId = `source_${drawable.id}`;
            map.addSource(sourceId, {
                type: 'geojson',
                data: blankGeojson,
            });
            map.addLayer({
                id: drawable.id,
                source: sourceId,
                type: 'fill',
                layout: {},
                paint: {
                    'fill-color': fillColor,
                    'fill-outline-color': outlineColor,
                    'fill-opacity': 0.8,
                },
            });
            map.addLayer({
                id: `label_${drawable.id}`,
                type: 'symbol',
                source: sourceId,
                layout: {
                    'text-field': '{name}',
                    'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                    'text-size': 12,
                },
                paint: {
                    'text-color': 'white',
                },
            });

            this._loadEagleEyeData(map, sourceId, _areaData);

            map.on('click', e => {
                const features = map.queryRenderedFeatures(e.point, {
                    layers: [drawable.id],
                });
                if (features.length > 0) {
                    const { properties } = features[0];
                    const data = pubSubFactory.createPubSubData(eventTopic.AreaEagleMap.Selected, {
                        id: properties[targetField],
                        name: properties.name,
                    });
                    PubSub.publish(eventTopic.AreaEagleMap.Selected, { data });
                    this.hightLightArea({
                        id: properties[targetField],
                        color: fillColor,
                        map,
                        layerID: drawable.id,
                        fillColor,
                        targetField,
                    });
                }
            });
            // // disable map rotation using right click + drag
            // map.dragRotate.disable();
            // map.dragPan.disable();
            // map.scrollZoom.disable();
            // // disable map rotation using touch rotation gesture
            // map.touchZoomRotate.disableRotation();
        });
        const results = drawable;
        results.map = map;
        return results;
    }

    _updateCore(drawable) {
        console.log('go: ImageHandler -> _updateCore -> drawable', drawable);
    }

    _removeCore(drawableID) {
        const realDrawable = this._drawableRelation.get(drawableID);
        console.log('go: ImageHandler -> _removeCore -> realDrawable', realDrawable);
    }

    _setVisibility(drawableID, visiable) {
        console.log('go: ImageHandler -> _setVisibility -> visiable', visiable);
        console.log('go: ImageHandler -> _setVisibility -> drawableID', drawableID);
    }

    async _loadEagleEyeData(map, source, url) {
        const { data, status } = await axios(url);
        if (status !== 200) return;
        try {
            const centroid = turf.centroid(data);
            const coordPoint = turf.getCoord(centroid);
            map.setCenter(coordPoint);
            const bbox = turf.bbox(data);
            const bboxPolygon = turf.bboxPolygon(bbox);
            const boundsPolygon = turf.getCoords(bboxPolygon);
            const boundsPoint = boundsPolygon[0];
            const bounds = boundsPoint.reduce(
                (bound, coord) => bound.extend(coord),
                new mapboxgl.LngLatBounds(boundsPoint[0], boundsPoint[0])
            );
            map.getSource(source).setData(data);
            map.fitBounds(bounds, {
                padding: 5,
            });
        } catch (error) {
            console.log('go:data is invalid');
        }
    }

    hightLightArea(option = {}) {
        const { map, id, color, layerID, fillColor, targetField } = option;
        console.log('Rd: AreaEagleMapHandler -> hightLightArea -> option', option);
        const hightLightList = [];
        hightLightList.push(id);
        hightLightList.push(color);
        map.setPaintProperty(layerID, 'fill-color', ['match', ['get', `${targetField}`], ...hightLightList, fillColor]);
    }
}
