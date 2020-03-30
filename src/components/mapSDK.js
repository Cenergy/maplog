// @ts-nocheck
/* eslint-disable class-methods-use-this */
import mapboxUtils from 'mapbox-gl-utils';
import locateService from './locate/locateService';
import drawableService from './draw/drawableService';
import dataService from '../services/dataService';
import layerService from '../services/layerService';
import navigationService from '../services/navigationService';
import buildingService from './buildings/buildingService';
import gpsDataService from '../services/gpsDataService';
import MapSdkExtension from './mapSdkExtension';
import zoomShowController from './zoomShowController';
import tbService from '../services/tbService';
import plotService from '../services/plotService';
import layerZIndexHelper from './layerZIndexHelper';
import drawableLayerService from '../services/drawableLayerService';
import mapEventAggregator from './pubsubRelated/mapEventAggregator';
import mapResponseHelper from './pubsubRelated/mapResponseHelper';
import MapPlotExtension from './mapPlotExtension';

export default class MapSDK extends EventTarget {
    constructor() {
        super();
        this._map = null;
        this.sdkExtension = new MapSdkExtension();
        this.mapEventAggregator = mapEventAggregator;
        this.plotExtension = new MapPlotExtension();
    }

    /**
     *
     * @param {object} option 初始化选项
     * @param {mapboxgl.Map} option.map mapboxgl-map
     * @returns {void}
     */
    init(option) {
        console.log('rd: MapSDK -> init -> option', option);
        const { map } = option;
        this._map = map;
        this.initCore(option);
    }

    async initCore(option) {
        console.info('rd: MapSDK start init...');
        const map = this._map;
        mapboxUtils.init(map);
        const mapSdk = this;
        zoomShowController.init(option);
        layerZIndexHelper.init(map);
        navigationService.init();

        await dataService.init();
        await buildingService.init({ dataService, map });
        await gpsDataService.init(option);
        await layerService.init({ dataService, mapSdk });
        await plotService.init({ mapSdk, navigationService });
        await drawableLayerService.init({ mapSdk });
        await mapResponseHelper.init({ mapSdk });
        this.plotExtension.init({ dataService, mapSdk });
        this.sdkExtension.init({ dataService, navigationService });
        locateService.init(option);
        drawableService.init({
            map,
            layerService,
            dataService,
            mapSDK: this,
        });
        this._subMapEvents();

        if (!this._map.loaded()) {
            this._map.on('load', () => {
                this.onInited();
            });
        } else {
            this.onInited();
        }
    }

    async onInited() {
        await tbService.init({ map: this._map });
        console.info('rd: MapSDK end init...');
        this.dispatchEvent(new Event('initialized'));
    }

    // #region Map Basics

    /**
     * 获取地图实例
     */
    get map() {
        return this._map;
    }

    /**
     * 定位地图：支持mapgl的4种飞行方式
     * @param {object} option 定位功能描述选项
     * @returns {void}
     * @example
     * const option = {
     *  locateType: 'flyTo|jumpTo|..',
     *  option: {
     *    center: target,
     *    zoom: 9,
     *    bearing: 0,
     *    speed: 0.2,
     *    curve: 1,
     *    easing: function(t) {
     *      return t;
     *    },
     *  },
     * };
     * // execute
     * locate(option)
     */
    locate(option) {
        // console.log('rd: MapSDK -> locate -> option', option);
        locateService.locate(option);
    }

    /**
     * 地图轮播
     * @param {object} options 轮播方式及对象
     * @returns {void}
     * @example
     * const options = {
     *  locateType: 'flyTo|jumpTo|..',
     *  features: [
     *   {
     *     name: 'point1',
     *     address: 'xx大厦1',
     *     coordinates: [113.25, 25.22],
     *   },
     *   {
     *     name: 'point2',
     *     address: 'xx大厦2',
     *     coordinates: [114.65, 22.78],
     *   }],
     * };
     * // execute
     * slider(options)
     */
    slider(options) {
        // console.log('rd: MapSDK -> slider -> options', options);
        locateService.slider(options);
    }

    /**
     * 围绕一个点旋转
     * @param {object} options 旋转功能描述选项
     * @returns {void}
     * @example
     * const options = {
     *  timestampDivides:100,  // Divide timestamp by timestampDivides to slow rotation.
     * };
     * // execute
     * sliderAround(options)
     */
    sliderAround(options) {
        // console.log('rd: MapSDK -> sliderAround -> option', options);
        locateService.sliderAround(options);
    }

    /**
     * 停止地图绕点旋转行为
     * @returns {void}
     */
    stopSliderAround() {
        // console.log('rd: MapSDK -> stopSliderAround ');
        locateService.stopSliderAround();
    }

    // #endregion

    // #region Buildings

    // 加载建筑 options:暂定url
    loadBuilding(options = {}) {
        // console.log('rd: MapSDK -> loadBuilding -> options', options);
        return buildingService.loadBuilding(options);
    }

    // 显示
    showBuilding() {
        // console.log('rd: showBuilding');
        buildingService.showBuilding();
    }

    // 隐藏
    hideBuilding() {
        // console.log('rd: hideBuilding');
        buildingService.hideBuilding();
    }

    // 高亮
    hightLightBuildings(options) {
        // console.log('rd: hightLightBuildings -> options', options);
        buildingService.hightLightBuildings(options);
    }

    // 通过范围来高亮
    hightLightBuildingByRegion(options) {
        buildingService.hightLightBuildingByRegion(options);
    }

    /**
     * // 通过Three的方式来高亮建筑
     * @param {*} options 选项
     *
     * @returns {void}
     */
    hightLightThreeBuildings(options) {
        buildingService.hightLightThreeBuildings(options);
    }

    // 移除高亮
    removeHightLightBuildings() {
        // console.log('rd: removeHightLightBuildings');
        buildingService.removeHightLightBuildings();
    }

    /**
     *
     * @param {*} options 选项  ex  {data:['1','2']}
     * @returns {void}
     */
    removeHightLightThreeBuildings(options) {
        buildingService.removeHightLightThreeBuildings(options);
    }

    // #endregion

    // #region Layers

    async initLayers() {
        console.log('rd: MapSDK -> initLayers');
        await layerService.initLayers();
    }

    // 获取所有的图层 需提供相应的类来描述图层
    getAllLayers() {
        // console.log('rd: MapSDK -> getAllLayers -> getAllLayers');
        const layers = layerService.getAllLayers();
        return layers;
    }

    // 快速显示图层
    showLayers(layerIds) {
        // console.log('rd: MapSDK -> showLayers -> layerIds', layerIds);
        layerService.showLayers(layerIds);
    }

    // 快速隐藏图层
    hideLayers(layerIds) {
        // console.log('rd: MapSDK -> hideLayers -> layerIds', layerIds);
        layerService.hideLayers(layerIds);
    }

    // #endregion

    // #region Drawable

    // 绘制地图元素
    addDrawable(drawable) {
        // console.log('rd: MapSDK -> addDrawable -> drawable', drawable);
        return drawableService.add(drawable);
    }

    // 更新地图元素
    updateDrawable(drawable) {
        // console.log('rd: MapSDK -> updateDrawable -> drawable', drawable);
        return drawableService.update(drawable);
    }

    // 移除地图元素
    removeDrawable(drawableId) {
        // console.log('rd: MapSDK -> removeDrawable -> drawableId', drawableId);
        return drawableService.remove(drawableId);
    }
    // #endregion

    // #region DrawableLayer

    /**
     * 根据geojson数据构建点位图层
     * @param {object} option 选项
     * @returns {string} layerID 图层
     * @example
     * const option = {
     *    url: 'http://10.8.9.64:3038/geoData/camera.json',
     *    imagePath: 'http://10.8.9.64:3038/images/pollution/pollution.png',
     *    typeKey: IMAGE_DRAWABLE_TYPE,
     *    minZoom: 11,
     *    maxZoom: 15
     * }
     *
     * // execute
     * const layerID = createDrawableLayer(option);
     */
    createDrawableLayer(option) {
        // console.log('rd: addDrawableLayer -> option', option);
        const layerID = drawableLayerService.createDrawableLayer(option);
        return layerID;
    }

    /**
     * 移除根据geojson数据构建的点位图层
     * @param {string} layerID layerID 图层
     * @returns {void} 无返回值
     * @example
     * const layerID = "layerID"
     *
     * // execute
     * removeDrawableLayer(layerID);
     */
    removeDrawableLayer(layerID) {
        // console.log('rd: removeDrawableLayer -> layerID', layerID);
        drawableLayerService.removeDrawableLayer(layerID);
    }

    /**
     * 控制根据geojson数据构建的点位图层的显示隐藏
     * @param {boolean} isShow 是否显示
     * @param {string}  layerID 图层ID
     * @returns {void} 无返回值
     * @example
     * const isShow = "false"
     * const layerID = "layerID"
     *
     * // execute
     * toggleShowDrawableLayer(isShow,layerID);
     */
    toggleShowDrawableLayer(isShow, layerID) {
        // console.log('rd: toggleShowDrawableLayer -> isShow,layerID', isShow, layerID);
        drawableLayerService.toggleShowDrawableLayer(isShow, layerID);
    }

    _subMapEvents() {
        const detailTopic = this.mapEventAggregator.getAllEventTopics().PointDetailShow;
        this.mapEventAggregator.subscribe(detailTopic, mapResponseHelper.showFeatureDetail.bind(mapResponseHelper));
    }

    // #endregion
}
