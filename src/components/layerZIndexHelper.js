// 路径类图层
export const LOWEST_FLOOR = 'lowest_floor';
// 事件影响范围、雷达扫描类图层；
export const LOWER_FLOOR = 'lower_floor';
// 建筑类图层
export const MIDDLE_FLOOR = 'middle_floor';
// 点位类(eg：模型)图层
export const HIGHER_FLOOR = 'higher_floor';
// 点位类(非常显的或重点突出的)图层
export const HIGHEST_FLOOR = 'highest_floor';

class LayerZIndexHelper {
    init(map) {
        this._map = map;
        this._layerFloors = new Map();

        this._layerFloors.set(LOWEST_FLOOR, LOWEST_FLOOR);
        this._layerFloors.set(LOWER_FLOOR, LOWER_FLOOR);
        this._layerFloors.set(MIDDLE_FLOOR, MIDDLE_FLOOR);
        this._layerFloors.set(HIGHER_FLOOR, HIGHER_FLOOR);
        this._layerFloors.set(HIGHEST_FLOOR, HIGHEST_FLOOR);
        this._isConstructedLayers = false;
    }

    constuctBaseLayer() {
        const { layers } = this._map.getStyle();
        let labelLayerId = { id: null };
        const roadLayer = this._map.getLayer('waterway-label');
        if (roadLayer) {
            labelLayerId.id = roadLayer.id;
        } else {
            labelLayerId = layers.find(layer => {
                const layoutData = layer.layout || { 'text-field': false };
                return layer.type === 'symbol' && layoutData['text-field'];
            });

            if (!labelLayerId) {
                labelLayerId = 'defaultTrafficLayer';
            }
        }
        console.log('Rd: LayerZIndexHelper -> constuctBaseLayer -> labelLayerId', labelLayerId);

        const blankData = {
            features: [],
            type: 'FeatureCollection',
        };
        this._map.addSource('BLANK_LAYER_SOURCE', {
            type: 'geojson',
            data: blankData,
        });
        const baseLayerList = [LOWEST_FLOOR, LOWER_FLOOR, MIDDLE_FLOOR, HIGHER_FLOOR, HIGHEST_FLOOR];
        baseLayerList.map(baseLayerName => {
            return this._map.addLayer(
                {
                    id: baseLayerName,
                    source: 'BLANK_LAYER_SOURCE',
                    type: 'symbol',
                    paint: {},
                },
                labelLayerId.id
            );
        });
    }

    /**
     * 根据图层类型获取相应下一层图层的名称
     * @name getLayerZIndex
     * @param {string} floor 入参，图层类型：LOWEST_FLOOR/LOWER_FLOOR...
     * @example 入参示例：
     * const floor = LOWER_FLOOR;
     * @returns {string} 对应图层名
     * @example 接口调用示例
     * // execute
     * getLayerZIndex(floor);
     */
    getLayerZIndex(floor) {
        if (!this._isConstructedLayers) {
            this.constuctBaseLayer();
            this._isConstructedLayers = true;
        }
        const layerName = this._layerFloors.get(floor);
        if (!layerName) {
            throw new Error('invalid input!');
        }

        return layerName;
    }
}

export default new LayerZIndexHelper();
