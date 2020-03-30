import PlotLayer from './plotLayer';
import plotTypes from './plotTypes';
import CircleSymbol from './plotSymbols/circleSymbol';
import DoubleArrowSymbol from './plotSymbols/doubleArrowSymbol';
import ArcSymbol from './plotSymbols/arcSymbol';
import AssaultDirectionSymbol from './plotSymbols/assaultDirectionSymbol';
import FineArrowSymbol from './plotSymbols/fineArrowSymbol';
import LuneSymbol from './plotSymbols/luneSymbol';
import RectangleSymbol from './plotSymbols/rectangleSymbol';
import SectorSymbol from './plotSymbols/sectorSymbol';
import StraightArrowSymbol from './plotSymbols/straightArrowSymbol';
import GatheringPlaceSymbol from './plotSymbols/gatheringPlaceSymbol';
import EllipseSymbol from './plotSymbols/ellipseSymbol';
import AttackArrowSymbol from './plotSymbols/attackArrowSymbol';
import TailedAttackArrowSymbol from './plotSymbols/tailedAttackArrowSymbol';
import SquadCombatSymbol from './plotSymbols/squadCombatSymbol';
import TailedSquadCombatSymbol from './plotSymbols/tailedSquadCombatSymbol';
import PolylineSymbol from './plotSymbols/polylineSymbol';
import PolygonSymbol from './plotSymbols/polygonSymbol';
import CurveSymbol from './plotSymbols/curveSymbol';
import CloseCurveSymbol from './plotSymbols/closedCurveSymbol';
import FreehandLineSymbol from './plotSymbols/freehandLineSymbol';
import FreehandPolygonSymbol from './plotSymbols/freehandPolygonSymbol';
import MarkerSymbol from './plotSymbols/markerSymbol';
import eventService from './plotEventService';

class PlotService {
    init(baseService) {
        this.baseService = baseService;
        this.plotLayers = new Map();
        this._initSymbolTypes();
    }

    addPlotLayer(plotLayer) {
        const layer = new PlotLayer(this.baseService, plotLayer);
        this.plotLayers.set(layer.id, layer);
        eventService.pubPlotLayerCreated(layer);
        return layer;
    }

    removePlotLayer(layerID) {
        const layer = this.plotLayers.get(layerID);
        if (!layer) {
            console.warn('rd: PlotLayerManager -> removePlotLayer -> layer is null, layerID', layerID);
            return;
        }

        layer.remove();
        this.plotLayers.delete(layerID);
        eventService.pubPlotLayerDeleted(layerID);
    }

    updatePlotLayer(plotLayer) {
        const { id } = plotLayer;
        const layer = this.plotLayers.get(id);
        if (!layer) {
            console.warn('rd: PlotLayerManager -> updatePlotLayer -> layer is null, layerID', id);
            return;
        }

        layer.update(plotLayer);
        eventService.pubPlotLayerUpdated(layer);
    }

    getPlotLayerByID(layerID) {
        const layer = this.plotLayers.get(layerID);
        if (!layer) {
            console.warn('rd: PlotLayerManager -> getPlotLayerByID -> layer is null, layerID', layerID);
            return null;
        }

        return layer;
    }

    addPlotSymbol(layerID, symbol) {
        const layer = this.plotLayers.get(layerID);
        if (!layer) {
            console.warn('rd: PlotLayerManager -> addPlotSymbol -> layer is null, layerID', layerID);
            return;
        }

        layer.addPlotMark(symbol);
        eventService.pubPlotSymbolCreated(layerID, symbol);
    }

    removePlotSymbol(layerID, symbolID) {
        const layer = this.plotLayers.get(layerID);
        if (!layer) {
            console.warn(
                'rd: PlotLayerManager -> removePlotSymbol -> layer is null, layerID,symbolID',
                layerID,
                symbolID
            );
            return;
        }

        layer.removePlotMark(symbolID);
        eventService.pubPlotSymbolDeleted(layerID, symbolID);
    }

    updatePlotSymbol(layerID, symbol) {
        const layer = this.plotLayers.get(layerID);
        if (!layer) {
            console.warn('rd: PlotLayerManager -> updatePlotSymbol -> layer is null, layerID', layerID);
            return;
        }

        layer.updatePlotMark(symbol);
        eventService.pubPlotSymbolUpdated(layerID, symbol);
    }

    getPlotSymbolTypeByKey(typeKey) {
        console.log('rd: PlotService -> getPlotSymbolTypeByKey -> typeKey', typeKey);
        const symbol = this.typesMap.get(typeKey);
        if (!symbol) {
            console.warn('rd: PlotService -> getPlotSymbolTypeByKey ->type is null, typeKey', typeKey);
            return null;
        }
        return symbol;
    }

    _initSymbolTypes() {
        const typesMap = new Map();
        typesMap.set(plotTypes.CIRCLE, CircleSymbol);
        typesMap.set(plotTypes.DOUBLE_ARROW, DoubleArrowSymbol);
        typesMap.set(plotTypes.ARC, ArcSymbol);
        typesMap.set(plotTypes.ASSAULT_DIRECTION, AssaultDirectionSymbol);
        typesMap.set(plotTypes.FINE_ARROW, FineArrowSymbol);
        typesMap.set(plotTypes.LUNE, LuneSymbol);
        typesMap.set(plotTypes.RECTANGLE, RectangleSymbol);
        typesMap.set(plotTypes.SECTOR, SectorSymbol);
        typesMap.set(plotTypes.STRAIGHT_ARROW, StraightArrowSymbol);
        typesMap.set(plotTypes.GATHERING_PLACE, GatheringPlaceSymbol);
        typesMap.set(plotTypes.ELLIPSE, EllipseSymbol);
        typesMap.set(plotTypes.ATTACK_ARROW, AttackArrowSymbol);
        typesMap.set(plotTypes.TAILED_ATTACK_ARROW, TailedAttackArrowSymbol);
        typesMap.set(plotTypes.SQUAD_COMBAT, SquadCombatSymbol);
        typesMap.set(plotTypes.TAILED_SQUAD_COMBAT, TailedSquadCombatSymbol);
        typesMap.set(plotTypes.POLYLINE, PolylineSymbol);
        typesMap.set(plotTypes.POLYGON, PolygonSymbol);
        typesMap.set(plotTypes.CURVE, CurveSymbol);
        typesMap.set(plotTypes.CLOSED_CURVE, CloseCurveSymbol);
        typesMap.set(plotTypes.FREEHAND_LINE, FreehandLineSymbol);
        typesMap.set(plotTypes.FREEHAND_POLYGON, FreehandPolygonSymbol);
        typesMap.set(plotTypes.MARKER, MarkerSymbol);
        this.typesMap = typesMap;
    }
}

export default new PlotService();
