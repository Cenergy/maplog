import plotService from './plot/plotService';

class MapPlotExtension {
    init(option) {
        console.log('rd: MapPlotExtension -> init -> option', option);
        plotService.init(option);
    }

    // 添加图层
    addPlotLayer(option) {
        return plotService.addPlotLayer(option);
    }

    // 移除图层
    removePlotLayer(layerID) {
        return plotService.removePlotLayer(layerID);
    }

    updatePlotLayer(plotLayer) {
        return plotService.updatePlotLayer(plotLayer);
    }

    getPlotLayerByID(layerID) {
        return plotService.getPlotLayerByID(layerID);
    }

    addPlotSymbol(layerID, plotSymbol) {
        return plotService.addPlotSymbol(layerID, plotSymbol);
    }

    removePlotSymbol(layerID, symbolID) {
        return plotService.removePlotSymbol(layerID, symbolID);
    }

    updatePlotSymbol(layerID, plotSymbol) {
        return plotService.updatePlotSymbol(layerID, plotSymbol);
    }

    getPlotSymbolTypeByKey(typeKey) {
        return plotService.getPlotSymbolTypeByKey(typeKey);
    }
}

export default MapPlotExtension;
