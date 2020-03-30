// @ts-nocheck
/* eslint-disable class-methods-use-this */
import locateService from './locate/locateService';
import drawableService from './draw/drawableService';
import dataService from '../services/dataService';
import layerService from '../services/layerService';
import navigationService from '../services/navigationService';
import buildingService from './buildings/buildingService';
import gpsService from './gps/gpsService';
import eventService from './event/enevtService';
import MapSdkExtension from './mapSdkExtension';

export default class MapSDK extends EventTarget {
  constructor() {
    super();
    this._map = null;
    this.sdkExtension = new MapSdkExtension();
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
    await dataService.init(option);
    await buildingService.init({ dataService, map });
    await navigationService.init({ dataService, map });
    gpsService.init({ dataService, map });
    await layerService.init({ dataService, map });
    this.sdkExtension.init({ dataService, navigationService });
    locateService.init(option);
    eventService.init(option);
    drawableService.init({
      map,
      layerService,
      navigationService,
      gpsService,
      eventService,
    });

    if (!this._map.loaded()) {
      this._map.on('load', () => {
        this.onInited();
      });
    } else {
      this.onInited();
    }
  }

  onInited() {
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
    console.log('rd: MapSDK -> locate -> option', option);
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
    console.log('rd: MapSDK -> slider -> options', options);
    locateService.slider(options);
  }

  /**
	 * 围绕一个点旋转
	 * @param {object} options 旋转功能描述选项
	 * @returns {void}
	 * @example
	 * const options = {
	 *  bearing: 45,
	 *  option: {
	 *    duration: 10,
	 *    offset: (0.5,0.5,0.5),
	 *    animate: true,
	 *    easing: function(t) {
	 *      return t;
	 *    },
	 *  },
	 * };
	 * // execute
	 * sliderAround(options)
	 */
  sliderAround(options) {
    console.log('rd: MapSDK -> sliderAround -> option', options);
    locateService.sliderAround(options);
  }

  /**
	 * 停止地图绕点旋转行为
	 * @returns {void}
	 */
  stopSliderAround() {
    console.log('rd: MapSDK -> stopSliderAround ');
    locateService.stopSliderAround();
  }

  // #endregion

  // #region Buildings

  // 加载建筑 options:暂定url
  loadBuilding(options = {}) {
    console.log('rd: MapSDK -> loadBuilding -> options', options);
    return buildingService.loadBuildingLayer(options);
  }

  // 显示
  showBuilding() {
    console.log('rd: showBuilding');
    buildingService.showBuildingLayers();
  }

  // 隐藏
  hideBuilding() {
    console.log('rd: hideBuilding');
    buildingService.hideBuildingLayers();
  }

  // 高亮
  hightLightBuildings(options) {
    console.log('rd: hightLightBuildings -> options', options);
    buildingService.hightLightBuildings(options);
  }

  // 移除高亮
  removeHightLightBuildings() {
    console.log('rd: removeHightLightBuildings');
    buildingService.removeHightLightBuildings();
  }

  // #endregion

  // #region Layers

  async initLayers() {
    console.log('rd: MapSDK -> initLayers');
    await layerService.initLayerNodes();
  }

  // 获取所有的图层 需提供相应的类来描述图层
  getAllLayers() {
    console.log('rd: MapSDK -> getAllLayers -> getAllLayers');
    const layers = layerService.getAllLayerNodes();
    return layers;
  }

  // 快速显示图层
  showLayers(layerIds) {
    console.log('rd: MapSDK -> showLayers -> layerIds', layerIds);
    layerService.showLayers(layerIds);
  }

  // 快速隐藏图层
  hideLayers(layerIds) {
    console.log('rd: MapSDK -> hideLayers -> layerIds', layerIds);
    layerService.hideLayers(layerIds);
  }

  // 设置图层最小、最大显示层
  setLayerMinMaxZoom(layerID, minZoom, maxZoom) {
    layerService.setLayerMinMaxZoom(layerID, minZoom, maxZoom);
  }

  // #endregion

  // #region Drawable

  // 绘制地图元素
  addDrawable(drawable) {
    console.log('rd: MapSDK -> addDrawable -> drawable', drawable);
    return drawableService.add(drawable);
  }

  // 更新地图元素
  updateDrawable(drawable) {
    console.log('rd: MapSDK -> updateDrawable -> drawable', drawable);
    return drawableService.update(drawable);
  }

  // 移除地图元素
  removeDrawable(drawableId) {
    console.log('rd: MapSDK -> removeDrawable -> drawableId', drawableId);
    return drawableService.remove(drawableId);
  }
  // #endregion
}
   