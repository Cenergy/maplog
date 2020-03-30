import HandlerBase from './handlerBase';
import layerZIndexHelper, { LOWEST_FLOOR } from '../../layerZIndexHelper';

export default class BlockadeZoneHandler extends HandlerBase {
    constructor(option) {
        super(option);
        const { dataService } = option;
        this._dataService = dataService;
        this._layerIDs = new Map();
        this._hasLoadedImage = false;
    }

    _addCore(drawable) {
        this._addSource(drawable);
        this._addBlockadeLine(drawable);
        this._addBlockadePoints(drawable);
        this._addBlockadeArea(drawable);
        return drawable;
    }

    _addSource(drawable) {
        const { _id, coordinates, name } = drawable;
        const dataSource = {
            type: 'Feature',
            properties: { name },
            geometry: {
                type: 'LineString',
                coordinates,
            },
        };

        this._map.addSource(`${_id}_source`, {
            type: 'geojson',
            data: dataSource,
            lineMetrics: true,
        });

        const areaSource = {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [coordinates],
            },
        };
        this._map.addSource(`${_id}_areaSource`, {
            type: 'geojson',
            data: areaSource,
        });
    }

    _addBlockadePoints(drawable) {
        const { _id, color } = drawable;
        if (!this._map.getLayer(`${_id}_boudaryPoints`)) {
            const zIndexLayerID = layerZIndexHelper.getLayerZIndex(LOWEST_FLOOR);
            this._map.addLayer(
                {
                    id: `${_id}_boudaryPoints`,
                    type: 'circle',
                    source: `${_id}_source`,
                    paint: {
                        'circle-color': color,
                        'circle-radius': 5,
                        'circle-pitch-alignment': 'map',
                    },
                },
                zIndexLayerID
            );
        }

        const layerIDs = this._layerIDs.get(_id);
        layerIDs.push(`${_id}_boudaryPoints`);
    }

    _addBlockadeLine(drawable) {
        const { _id, strokeWidth, color } = drawable;

        if (!this._map.getLayer(`${_id}_line`)) {
            const zIndexLayerID = layerZIndexHelper.getLayerZIndex(LOWEST_FLOOR);
            this._map.addLayer(
                {
                    id: `${_id}_line`,
                    type: 'line',
                    source: `${_id}_source`,
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round',
                    },
                    paint: {
                        'line-color': color,
                        'line-width': strokeWidth,
                    },
                },
                zIndexLayerID
            );
        }

        this._layerIDs.set(_id, [`${_id}_line`]);
    }

    async _addBlockadeArea(drawable) {
        const { _id, opacity, color } = drawable;
        if (!this._hasLoadedImage) {
            this._hasLoadedImage = true;
            const map = this._map;
            // eslint-disable-next-line max-len
            map.loadImage(`${this._dataService.baseUrl}commondata/mapRelated/blockadeBack.png`, (error, image) => {
                if (error) {
                    console.error(error);
                }

                if (!map.hasImage('zoneBack')) map.addImage('zoneBack', image);
            });
        }

        if (!this._map.getLayer(`${_id}_area`)) {
            const zIndexLayerID = layerZIndexHelper.getLayerZIndex(LOWEST_FLOOR);
            this._map.addLayer(
                {
                    id: `${_id}_area`,
                    type: 'fill',
                    source: `${_id}_areaSource`,
                    layout: {},
                    paint: {
                        'fill-color': color,
                        'fill-opacity': opacity,
                    },
                },
                zIndexLayerID
            );
        }

        if (!this._map.getLayer(`${_id}_areaBack`)) {
            const zIndexLayerID = layerZIndexHelper.getLayerZIndex(LOWEST_FLOOR);
            this._map.addLayer(
                {
                    id: `${_id}_areaBack`,
                    type: 'fill',
                    source: `${_id}_areaSource`,
                    layout: {},
                    paint: {
                        'fill-pattern': 'zoneBack',
                    },
                },
                zIndexLayerID
            );
        }

        const layerIDs = this._layerIDs.get(_id);
        layerIDs.push(`${_id}_area`);
        layerIDs.push(`${_id}_areaBack`);
    }

    _updateCore(drawable) {
        const { _id, coordinates } = drawable;
        this._map.getSource(`${_id}_source`).setData({
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates,
            },
        });

        this._map.getSource(`${_id}_areaSource`).setData({
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'Polygon',
                coordinates: [coordinates],
            },
        });
    }

    _removeCore(drawableID) {
        console.log('rd: _removeCore -> drawableID', drawableID);
        const layerIDs = this._layerIDs.get(drawableID);
        layerIDs.forEach(layerID => {
            this._map.removeLayer(layerID);
        });
    }

    _setVisibility(drawableID, visiable) {
        const layerIDs = this._layerIDs.get(drawableID);
        layerIDs.forEach(layerID => {
            this._map.setLayoutProperty(layerID, 'visibility', visiable ? 'visible' : 'none');
        });
    }
}
