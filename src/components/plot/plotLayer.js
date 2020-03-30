import idName from '../idName';
import PlotLayerHandler from './plotLayerHandler';

class PlotLayer extends idName {
    constructor(baseService, option) {
        super(option);
        this.handler = new PlotLayerHandler(baseService);
        this.plotMarks = new Map();
    }

    addPlotMark(option) {
        const { id } = option;
        console.log('rd: PlotLayer -> addPlotMark -> id', id);
        this.plotMarks.set(id, option);
        this.handler.addPlotMark(option);
    }

    removePlotMark(markID) {
        const mark = this.plotMarks.get(markID);
        if (!mark) {
            return;
        }
        this.handler.removePlotMark(markID);
        this.plotMarks.delete(markID);
    }

    updatePlotMark(symbol) {
        const mark = this.plotMarks.get(symbol.id);
        if (!mark) {
            console.warn('rd: PlotLayer -> updatePlotMark -> mark is null,symbolID:', symbol.id);
            return;
        }
        this.handler.updatePlotMark(symbol);
    }

    getAllMarks() {
        const marks = [];
        this.plotMarks.forEach(value => {
            marks.push(value);
        });

        return marks;
    }

    getMarkByID(markID) {
        const mark = this.plotMarks.get(markID);
        if (!mark) {
            console.warn('rd: PlotLayer -> getMarkByID -> mark is null, markID:', markID);
            return null;
        }
        return mark;
    }

    remove() {
        this.plotMarks.clear();
        this.handler.clearPlotMarks();
    }

    update(plotLayer) {
        console.log('rd: PlotLayer -> update -> plotLayer', plotLayer);
    }
}

export default PlotLayer;
