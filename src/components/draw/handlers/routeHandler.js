import mapboxgl from 'mapbox-gl';
import HandlerBase from './handlerBase';
import layerZIndexHelper, { LOWEST_FLOOR, LOWER_FLOOR } from '../../layerZIndexHelper';
import latLngsCalculator from '../../../utils/latLngsCalculator';

export default class RouteHandler extends HandlerBase {
    constructor(option) {
        super(option);
        const { dataService } = option;
        this._dataService = dataService;
        this._layerIDs = new Map();
        this._hasLoadedImage = false;
        this._loadedImage();
    }

    _addCore(drawable) {
        this._addRoute(drawable);
        const endPoints = this._addEndPoints(drawable);
        const marker = this._addDetailsMarker(drawable);
        return { endPoints, marker };
    }

    _updateCore(drawable) {
        const { _id, coordinates, duration, distance } = drawable;
        this._map.getSource(`${_id}_source`).setData({
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates,
            },
        });

        const { endPoints, marker } = this._drawableRelation.get(_id);
        if (!marker || !endPoints) {
            return;
        }
        const { startFlag, endFlag } = endPoints;
        startFlag.setLngLat(coordinates[0]);
        endFlag.setLngLat(coordinates[coordinates.length - 1]);
        marker.setLngLat(coordinates[coordinates.length - 1]);
        const distanceKm = (distance / 1000).toFixed(1);
        const timeConst = this._formatSeconds(duration);
        document.getElementById('textElement').innerHTML = `<div>${timeConst}min<br>${distanceKm}km</div>`;

        this._map.getSource(`${_id}_start_source`).setData({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: coordinates[0],
            },
        });

        this._map.getSource(`${_id}_end_source`).setData({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: coordinates[coordinates.length - 1],
            },
        });
    }

    _removeCore(drawableID) {
        const layerIDs = this._layerIDs.get(drawableID);
        layerIDs.forEach(layerID => {
            this._map.removeLayer(layerID);
        });

        const { endPoints, marker } = this._drawableRelation.get(drawableID);
        if (!marker || !endPoints) {
            return;
        }
        const { startFlag, endFlag } = endPoints;
        marker.remove();
        startFlag.remove();
        endFlag.remove();
        this._layerIDs.delete(drawableID);
    }

    _setVisibility(drawableID, visiable) {
        const layerIDs = this._layerIDs.get(drawableID);
        if (!layerIDs) {
            return;
        }

        layerIDs.forEach(layerID => {
            this._map.setLayoutProperty(layerID, 'visibility', visiable ? 'visible' : 'none');
        });
        const { endPoints, marker } = this._drawableRelation.get(drawableID);
        if (!marker || !endPoints) {
            return;
        }
        const { startFlag, endFlag } = endPoints;
        marker.getElement().style.display = visiable ? 'flex' : 'none';
        startFlag.getElement().style.display = visiable ? 'flex' : 'none';
        endFlag.getElement().style.display = visiable ? 'flex' : 'none';
    }

    _addRoute(drawable) {
        const { _id, coordinates, isDynamicDraw, name, strokeThickness, frequency, needRepeat } = drawable;
        const dataSource = {
            type: 'Feature',
            properties: { name },
            geometry: {
                type: 'LineString',
                coordinates: [],
            },
        };

        if (!this._map.getLayer(_id)) {
            const zIndexLayerID = layerZIndexHelper.getLayerZIndex(LOWEST_FLOOR);
            this._map.addSource(`${_id}_source`, {
                type: 'geojson',
                data: dataSource,
                lineMetrics: true,
            });

            this._map.addLayer(
                {
                    id: _id,
                    type: 'line',
                    source: `${_id}_source`,
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round',
                    },
                    paint: {
                        'line-color': 'green',
                        'line-width': strokeThickness,
                        'line-gradient': [
                            'interpolate',
                            ['linear'],
                            ['line-progress'],
                            0,
                            '#0059FF',
                            0.1,
                            '#0080ff',
                            0.3,
                            'cyan',
                            0.5,
                            'lime',
                            0.7,
                            'yellow',
                            1,
                            'red',
                        ],
                    },
                },
                zIndexLayerID
            );

            this._map.addLayer(
                {
                    id: `${_id}_arrowLayer`,
                    type: 'symbol',
                    source: `${_id}_source`,
                    layout: {
                        'symbol-placement': 'line',
                        'symbol-spacing': 2.5,
                        'icon-image': 'arrow',
                        'icon-size': 0.16,
                    },
                },
                layerZIndexHelper.getLayerZIndex(LOWER_FLOOR)
            );
        }

        if (!isDynamicDraw) {
            dataSource.geometry.coordinates = coordinates;
            this._map.getSource(`${_id}_source`).setData(dataSource);
        } else {
            let cutedPoints = [];
            for (let index = 0; index < coordinates.length - 1; index += 1) {
                const { points } = latLngsCalculator.cutLineToPoints(coordinates[index], coordinates[index + 1]);
                cutedPoints = [...cutedPoints, ...points];
            }

            this._dynamicDrawRoute(0, _id, cutedPoints, dataSource, frequency, needRepeat);
        }

        this._layerIDs.set(_id, [_id, `${_id}_arrowLayer`]);
    }

    _dynamicDrawRoute(index, id, coordinates, dataSource, frequency, needRepeat) {
        let counter = index;
        if (needRepeat) {
            if (coordinates.length - frequency < counter) {
                counter = 0;
            }
        }
        const source = dataSource;
        source.geometry.coordinates = coordinates.slice(0, counter);
        this._map.getSource(`${id}_source`).setData(dataSource);
        const number = counter + frequency;
        this.animationID = requestAnimationFrame(this._dynamicDrawRoute.bind(this, number, id, coordinates, source, frequency, needRepeat));
    }

    _formatSeconds(value) {
        console.log('rd: _formatSeconds -> value', this._map);
        let secondTime = parseInt(value, 10);
        let minuteTime = 0;
        let hourTime = 0;
        if (secondTime > 60) {
            minuteTime = parseInt(`${secondTime / 60}`, 10);
            secondTime = parseInt(`${secondTime % 60}`, 10);

            if (minuteTime > 60) {
                hourTime = parseInt(`${minuteTime / 60}`, 10);
                minuteTime = parseInt(`${minuteTime % 60}`, 10);
            }
        }
        let result = `${parseInt(`${secondTime}`, 10)}s`;

        if (minuteTime > 0) {
            result = `${parseInt(`${minuteTime}`, 10)}`;
        }
        if (hourTime > 0) {
            result = `${parseInt(`${hourTime}`, 10)}h${result}`;
        }
        return result;
    }

    _addDetailsMarkerCore(drawable, coordinate) {
        const { distance, duration } = drawable;
        const distanceKm = (distance / 1000).toFixed(1);
        const timeConst = this._formatSeconds(duration);
        const el = document.createElement('div');
        el.style.backgroundImage = `url(${this._dataService.baseUrl}commondata/mapRelated/endPoint.png)`;
        el.style.width = '60px';
        el.style.height = '60px';
        el.style.backgroundSize = 'cover';
        el.style.display = 'flex';
        el.style.color = 'white';
        el.style.textAlign = 'center';
        el.style.alignItems = 'center';

        const textElement = document.createElement('div');
        textElement.style.textAlign = 'center';
        textElement.style.width = '60px';
        textElement.id = 'textElement';
        textElement.innerHTML = `<div>${timeConst}min<br>${distanceKm}km</div>`;
        el.appendChild(textElement);
        el.style.display = 'flex';

        const marker = new mapboxgl.Marker(el)
            .setLngLat(coordinate)
            .addTo(this._map)
            .setOffset([-15, -45]);

        return marker;
    }

    _addDetailsMarker(drawable) {
        const { centreDetail, coordinates, isShowDetail } = drawable;
        if (!isShowDetail) {
            return null;
        }
        let detailPosition = null;
        if (centreDetail) {
            const index = 0;
            detailPosition = coordinates[index];
        } else {
            detailPosition = coordinates[coordinates.length - 1];
        }
        return this._addDetailsMarkerCore(drawable, detailPosition);
    }

    _addEndPoints(drawable) {
        const { _id, coordinates, isShowDetail } = drawable;
        if (!isShowDetail) {
            return null;
        }
        if (coordinates === null || coordinates.length < 2) {
            return null;
        }

        const startPosition = coordinates[0];
        const endPosition = coordinates[coordinates.length - 1];
        this._addSource(startPosition, `${_id}_start_source`);
        this._addSource(endPosition, `${_id}_end_source`);

        this._addEndPointsCircle(_id, `${_id}_start_stroke`, `${_id}_start_source`, '#0059FF');
        this._addEndPointsCircle(_id, `${_id}_end_stroke`, `${_id}_end_source`, 'red');

        const startFlag = this._addEndPointsFlag(startPosition, this._getImgUrl('flag_start'));
        const endFlag = this._addEndPointsFlag(endPosition, this._getImgUrl('flag_end'));
        return { startFlag, endFlag };
    }

    _getImgUrl(fileName) {
        return `url(${this._dataService.baseUrl}commondata/mapRelated/${fileName}.png)`;
    }

    _loadedImage() {
        if (!this._hasLoadedImage) {
            this._hasLoadedImage = true;
            const map = this._map;
            map.loadImage(`${this._dataService.baseUrl}commondata/mapRelated/arrow.png`, (error, image) => {
                if (error) {
                    console.error(error);
                }

                if (!map.hasImage('arrow')) map.addImage('arrow', image);
            });
        }
    }

    _addSource(coordinate, name) {
        const dataSource = {
            type: 'Feature',
            properties: { name },
            geometry: {
                type: 'Point',
                coordinates: coordinate,
            },
        };

        this._map.addSource(name, {
            type: 'geojson',
            data: dataSource,
            lineMetrics: true,
        });
    }

    _addEndPointsCircle(id, name, sourceName, color) {
        if (!this._map.getLayer(name)) {
            const zIndexLayerID = layerZIndexHelper.getLayerZIndex(LOWEST_FLOOR);
            this._map.addLayer(
                {
                    id: name,
                    type: 'circle',
                    source: sourceName,
                    paint: {
                        'circle-color': '#F7F3F3',
                        'circle-radius': 10,
                        'circle-pitch-alignment': 'map',
                    },
                },
                zIndexLayerID
            );
        }

        if (!this._map.getLayer(`${name}_fill`)) {
            const zIndexLayerID = layerZIndexHelper.getLayerZIndex(LOWEST_FLOOR);
            this._map.addLayer(
                {
                    id: `${name}_fill`,
                    type: 'circle',
                    source: sourceName,
                    paint: {
                        'circle-color': color,
                        'circle-radius': 7,
                        'circle-pitch-alignment': 'map',
                    },
                },
                zIndexLayerID
            );
        }

        const layerIDs = this._layerIDs.get(id);
        layerIDs.push(name);
        layerIDs.push(`${name}_fill`);
    }

    _addEndPointsFlag(coordinate, imageUrl) {
        const el = document.createElement('div');
        el.className = `marker_${imageUrl}`;
        el.style.backgroundImage = imageUrl;
        el.style.backgroundSize = '100% 100%';
        el.style.width = `20px`;
        el.style.height = `30px`;
        const marker = new mapboxgl.Marker(el)
            .setLngLat(coordinate)
            .addTo(this._map)
            .setOffset([8, -13]);
        return marker;
    }
}
