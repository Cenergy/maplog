import LayerItem from './layerItem';
import GPSDrawable from '../draw/entities/gpsDrawable';
import gpsService from '../gps0/gpsService';

class GpsLayerItem extends LayerItem {
    constructor(option) {
        super(option);
        this._gpsDrawables = [];
        this._animationCount = 1;
    }

    init(features) {
        console.log('rd: GpsLayerItem -> init -> features', features.length);
        this._features = features;
        for (let index = 0; index < features.length; index += 1) {
            const { id, TypeID } = features[index].properties;
            const gpsDrawable = new GPSDrawable({
                userID: id,
                typeID: TypeID,
                canDrawRoute: false,
                isShow: false,
                showScan: false,
                coordinate: features[index].geometry.coordinates,
                scanRadius: 500,
                minZoom: this._minZoom,
                maxZoom: this._maxZoom,
            });
            gpsService.addGPSLayer(gpsDrawable);
            this._gpsDrawables.push(gpsDrawable);
        }
    }

    getLayerSymbols() {
        return this._gpsDrawables;
    }

    dispose() {
        this._map.off('zoom', () => {
            this._zoomChangeVisibility();
        });
    }

    _toggleLayerVisibility(isShow) {
        for (let index = 0; index < this._gpsDrawables.length; index += 1) {
            const drawable = this._gpsDrawables[index];
            if (drawable._isShow !== isShow) {
                drawable._isShow = isShow;
                drawable._showScan = isShow;
                gpsService.updateGPSLayer(drawable);
            }
        }

        if (isShow) {
            this._timer = window.setInterval(() => {
                this._animations();
            }, 20000);
        } else {
            window.clearInterval(this._timer);
            this._timer = null;
        }
    }

    _animations() {
        if (this._isShow && this._gpsDrawables.length > 0) {
            this._animationCount += 1;
            for (let index = 0; index < this._gpsDrawables.length; index += 1) {
                const drawable = this._gpsDrawables[index];
                if (this._animationCount % 2 === 0) {
                    drawable.coordinate = [
                        drawable.coordinate[0] + 0.005,
                        drawable.coordinate[1] + 0.005,
                    ];
                    gpsService.updateGPSLayer(drawable);
                } else {
                    drawable.coordinate = [
                        drawable.coordinate[0] - 0.005,
                        drawable.coordinate[1] - 0.005,
                    ];
                    gpsService.updateGPSLayer(drawable);
                }
            }
        }
    }

    _zoomChangeVisibility() {
        const currentZoom = this._map.getZoom();
        const needHide = currentZoom >= this._maxZoom || currentZoom <= this._minZoom;
        if (this._features !== null && this._features.length > 0) {
            if (this._isShow && needHide) {
                this._toggleLayerVisibility(false);
            } else if (this._isShow && !needHide) {
                this._toggleLayerVisibility(true);
            }
        }
    }
}

export default GpsLayerItem;
