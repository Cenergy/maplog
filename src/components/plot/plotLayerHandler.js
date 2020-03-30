import plotMarkFactory from './plotMarkFactory';
import plotTypes from './plotTypes';
import ImageDrawable from '../draw/entities/imageDrawable';
import PlotDrawable from '../draw/entities/plotDrawable';

class PlotLayerHandler {
    constructor(baseService) {
        const { dataService, mapSdk } = baseService;
        this.dataService = dataService;
        this.mapSdk = mapSdk;
        this.drawables = new Map();
    }

    addPlotMark(option) {
        const { id } = option;
        console.log('rd: PlotLayerHandler -> addPlotMark -> id', id);
        const drawable = this._addMarkDrawable(option);
        console.log('rd: PlotLayerHandler -> addPlotMark -> drawable', drawable);
        this.mapSdk.addDrawable(drawable);
        this.drawables.set(id, drawable);
    }

    removePlotMark(markID) {
        const drawable = this.drawables.get(markID);
        if (!drawable) {
            return;
        }
        this.drawables.delete(markID);
        this.mapSdk.removeDrawable(drawable.id);
    }

    updatePlotMark(symbol) {
        console.log('rd: PlotLayerHandler -> updatePlotMark -> symbol,', symbol);
        const drawable = this.drawables.get(symbol.id);
        if (!drawable) {
            return;
        }

        const newDrawable = this._updateMarkDrawable(drawable, symbol);
        console.log('rd: PlotLayerHandler -> updatePlotMark -> newDrawable', newDrawable);
        this.mapSdk.updateDrawable(newDrawable);
    }

    _getMarkerImage(key) {
        return `${this.dataService.baseUrl}commondata/plot/point/${key}`;
    }

    _addMarkDrawable(option) {
        const { type } = option;
        let drawable = null;
        if (type === plotTypes.MARKER) {
            const { urlKey, coordinate, width, height } = option;
            if (urlKey && coordinate) {
                drawable = new ImageDrawable({
                    coordinate,
                    imagePath: this._getMarkerImage(urlKey),
                    width,
                    height,
                });
            }
        } else {
            const { points, needFill } = plotMarkFactory.generatePlotMark(option);
            drawable = new PlotDrawable({
                coordinates: points,
                strokeThickness: 3,
                minZoom: 1,
                maxZoom: 19,
                needFill,
            });
        }
        return drawable;
    }

    _updateMarkDrawable(drawable, symbol) {
        const newDrawable = drawable;
        const { type } = symbol;
        if (type === plotTypes.MARKER) {
            const { coordinate, width, height } = symbol;
            newDrawable.coordinate = coordinate;
            newDrawable.width = width;
            newDrawable.height = height;
        } else {
            const { points, needFill } = plotMarkFactory.generatePlotMark(symbol);
            newDrawable.coordinates = points;
            newDrawable.needFill = needFill;
        }
        return newDrawable;
    }

    clearPlotMarks() {
        this.drawables.forEach((value, key) => {
            console.log('rd: PlotLayerHandler -> clearPlotMarks -> key', key);
            console.log('rd: PlotLayerHandler -> clearPlotMarks -> value', value);
            this.mapSdk.removeDrawable(value.id);
        });
        this.drawables.clear();
    }

    getAllMarks() {
        return this.drawables.values;
    }

    getMarkByID(markID) {
        const mark = this.drawables.get(markID);
        if (!mark) {
            console.warn('rd: PlotLayer -> getMarkByID -> mark is null, markID:', markID);
            return null;
        }
        return mark;
    }
}

export default PlotLayerHandler;
