import PubSub from 'pubsub-js';
import eventTopic from '../pubsubRelated/eventTopic';

class PlotEventService {
    pubPlotLayerCreated(layer) {
        console.log('rd: PlotEventService -> pubPlotLayerCreated -> layer', layer);
        const { id, name } = layer;
        const pubData = { id, name };
        PubSub.publish(eventTopic.MapPlot.PlotLayerCreated, pubData);
    }

    pubPlotLayerDeleted(layerID) {
        console.log('rd: PlotEventService -> pubPlotLayerDeleted -> layerID', layerID);
        PubSub.publish(eventTopic.MapPlot.PlotLayerDeleted, layerID);
    }

    pubPlotLayerUpdated(layer) {
        console.log('rd: PlotEventService -> pubPlotLayerUpdated -> layer', layer);
        const { id, name } = layer;
        const pubData = { id, name };
        PubSub.publish(eventTopic.MapPlot.PlotLayerUpdated, pubData);
    }

    pubPlotSymbolCreated(layerID, symbol) {
        console.log('rd: PlotEventService -> pubPlotSymbolCreated -> layerID,symbol', layerID, symbol);
        const pubData = { layerID, symbol };
        PubSub.publish(eventTopic.MapPlot.PlotSymbolCreated, pubData);
    }

    pubPlotSymbolDeleted(layerID, symbolID) {
        console.log('rd: PlotEventService -> pubPlotSymbolDeleted -> layerID, symbolID', layerID, symbolID);
        const pubData = { layerID, symbolID };
        PubSub.publish(eventTopic.MapPlot.PlotSymbolDeleted, pubData);
    }

    pubPlotSymbolUpdated(layerID, symbolID) {
        console.log('rd: PlotEventService -> pubPlotSymbolUpdated -> layerID,symbolID', layerID, symbolID);
        const pubData = { layerID, symbolID };
        PubSub.publish(eventTopic.MapPlot.PlotSymbolUpdated, pubData);
    }
}

export default new PlotEventService();
