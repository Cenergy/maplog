import HandlerBase from './handlerBase';
import tbService from '../../../services/tbService';

export default class CityBoundaryHandler extends HandlerBase {
    constructor(option) {
        super(option);
        const { dataService } = option;
        this._dataService = dataService;
        this._layerIDs = new Map();
    }

    _addCore(drawable) {
        const { _id, urlKeys, coordinates } = drawable;
        this._layerIDs.set(_id, []);
        urlKeys.forEach((urlKey, index) => {
            this._addImageCore(_id, index, urlKey, coordinates);
        });
    }

    _addImageCore(id, index, urlKey, coordinates) {
        console.log('rd: CityBoundaryHandler -> _addImageCore -> id,index,urlKey', id, index, urlKey);
        const imageUrl = `${this._dataService.baseUrl}citydata/${urlKey}`;
        this._map.addSource(`${id}_${index}`, {
            type: 'image',
            url: imageUrl,
            coordinates,
        });

        this._map.addLayer({
            id: `${id}_${index}_imageLayer`,
            type: 'raster',
            source: `${id}_${index}`,
            paint: {
                'raster-fade-duration': 0,
            },
            style: {},
        });

        const layerIDs = this._layerIDs.get(id);
        layerIDs.push(`${id}_${index}_imageLayer`);
    }

    _updateCore(drawable) {
        console.log('rd: CityBoundaryHandler -> _updateCore -> drawable', drawable);
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
}
