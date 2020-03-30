import HandlerBase from './handlerBase';
import layerZIndexHelper, { HIGHEST_FLOOR } from '../../layerZIndexHelper';

export default class PlotHandler extends HandlerBase {
    constructor(option) {
        super(option);
        const { dataService } = option;
        this._dataService = dataService;
        this._layerIDs = new Map();
    }

    _addCore(drawable) {
        this._addRoute(drawable);
        this._addArea(drawable);
        return null;
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
        const layerIDs = this._layerIDs.get(drawableID);
        layerIDs.forEach(layerID => {
            this._map.removeLayer(layerID);
        });
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
    }

    _addRoute(drawable) {
        const { _id, coordinates, color, strokeThickness, name } = drawable;
        const dataSource = {
            type: 'Feature',
            properties: { name },
            geometry: {
                type: 'LineString',
                coordinates: [],
            },
        };

        if (!this._map.getLayer(_id)) {
            const zIndexLayerID = layerZIndexHelper.getLayerZIndex(HIGHEST_FLOOR);
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
                        'line-color': color,
                        'line-width': strokeThickness,
                    },
                },
                zIndexLayerID
            );
        }

        dataSource.geometry.coordinates = coordinates;
        this._map.getSource(`${_id}_source`).setData(dataSource);
        this._layerIDs.set(_id, [_id]);
    }

    _addArea(drawable) {
        const { _id, color, needFill, coordinates } = drawable;
        console.log('rd: _addArea -> needFill', needFill);
        if (!needFill) {
            return;
        }

        const dataSource = {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [coordinates],
            },
        };
        if (!this._map.getLayer(`${_id}_area`)) {
            const zIndexLayerID = layerZIndexHelper.getLayerZIndex(HIGHEST_FLOOR);
            this._map.addSource(`${_id}_areaSource`, {
                type: 'geojson',
                data: dataSource,
            });
            this._map.addLayer(
                {
                    id: `${_id}_area`,
                    type: 'fill',
                    source: `${_id}_areaSource`,
                    layout: {},
                    paint: {
                        'fill-color': color,
                        'fill-opacity': 0.3,
                    },
                },
                zIndexLayerID
            );
        }

        const layerIDs = this._layerIDs.get(_id);
        layerIDs.push(`${_id}_area`);
    }
}
