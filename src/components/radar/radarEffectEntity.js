import calculator from '../../utils/latLngsCalculator';

export default class RadarEffectEntity {
    constructor(id, option) {
        const { distance, level, coordinate, frameCount, urlPrifix } = option;
        this._id = id;
        this._distance = distance;
        this._level = level;
        this._coordinate = coordinate;
        this._frameCount = frameCount;
        this._currentImage = this._getRandomInt(1, option.frameCount - 1);
        this._layerSourceName = id;
        this._layerName = id;
        this._urlPrifix = urlPrifix;
        this._map = null;
        this._imagesMap = new Map();
    }

    updateCoordinate(distance, coordinate) {
        this._distance = distance;
        this._coordinate = coordinate;
        const coor = calculator.calcSquarePoints(this._distance, this._coordinate);
        this._map.getSource(this._layerSourceName).setCoordinates(coor);
    }

    addToMap(map) {
        this._map = map;
        const coor = calculator.calcSquarePoints(this._distance, this._coordinate);
        const imageUrl = this._getPath(this._urlPrifix, this._currentImage);
        map.addSource(this._layerSourceName, {
            type: 'image',
            url: imageUrl,
            coordinates: coor,
        });
        map.addLayer({
            id: this._id,
            type: 'raster',
            source: this._layerSourceName,
            paint: {
                'raster-fade-duration': 0,
            },
        });
    }

    removeFromMap() {
        this._map.removeLayer(this._layerName);
        this._map.removeSource(this._layerSourceName);
    }

    tick() {
        let index = 1;
        const radarEffect = () => {
            if (index % 4 !== 0) {
                index += 1;
            } else {
                index = 1;
                const source = this._map.getSource(this._layerSourceName);
                this._currentImage = (this._currentImage + 1) % this._frameCount;
                if (!this._imagesMap.has(this._currentImage)) {
                    source.updateImage({ url: this._getPath(this._prefix, this._currentImage) });
                    if (source.image) {
                        this._imagesMap.set(this._currentImage, source.image);
                    }
                } else {
                    source.texture = null;
                    source.image = this._imagesMap.get(this._currentImage);
                    source._finishLoading.call(source);
                }
            }
            window.requestAnimationFrame(radarEffect);
        };
        window.requestAnimationFrame(radarEffect);
    }

    // eslint-disable-next-line class-methods-use-this
    _getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    _getPath() {
        return `${this._urlPrifix}/${this._currentImage}.png`;
    }

    static _getScanRadius(spreadRank) {
        if ((typeof spreadRank !== 'number' && spreadRank < 0) || spreadRank > 11) return 100;
        return spreadRank;
    }
}
