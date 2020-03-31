/* eslint-disable class-methods-use-this */
import drawableService from './draw/drawableService';
import dataService from '../services/dataService';
import layerService from '../services/layerService';
import navagationService from '../services/navagationService';

export default class MapSDK extends EventTarget {
  constructor() {
    super();
    this._map = null;
  }

  /**
	 *
	 * @param {object} option 初始化选项
	 * @param {mapboxgl.Map} option.map mapboxgl-map
	 * @returns {void}
	 */
  init(option) {
    const { map } = option;
    this._map = map;
    this.initCore(option);
  }

  async initCore(option) {
    console.info('rd: MapSDK start init');
    const { map } = option;
    await dataService.init(option);
    await layerService.init(dataService);
    await navagationService.init();
    drawableService.init({ map, layerService, navagationService });
    console.info('rd: MapSDK end init');
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
	 *  locateType: 'fly|jumpTo|..',
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
  }

  // 地图轮播
  // Jump to a series of locations
  // Play map locations as a slideshow
  slider(options) {
    console.log('rd: MapSDK -> slider -> options', options);
  }

  // #endregion

  // #region Buildings

  // 加载建筑 options:暂定url
  loadBuilding(options) {
    console.log('rd: MapSDK -> loadBuilding -> options', options);
  }

  // 显示
  showBuilding() {
    console.log('rd: MapSDK -> showBuilding -> showBuilding');
  }

  // 隐藏
  hideBuilding() {
    console.log('rd: MapSDK -> hideBuilding -> hideBuilding');
  }

  // 高亮
  hightLightBuildings(options) {
    console.log('rd: MapSDK -> hightLightBuildings -> options', options);
  }

  // 移除高亮
  removeHightLightBuildings(options) {
    console.log('rd: MapSDK -> removeHightLightBuildings -> options', options);
  }

  // #endregion

  // #region Layers

  // 初始化图层 options:需传递足够的图层信息，如图层树结构、图层点位数据url
  initLayers(options) {
    const optionsExample = {
      layers: [
        {
          name: 'phone',
          typeId: '4004',
        },
        {
          name: 'camera',
          typeId: '4004',
        },
        {
          name: 'mmt',
          typeId: '4004',
        },
        {
          name: 'event',
          typeId: '4004',
        },
        {
          name: 'gps01',
          typeId: '4004',
        },
        {
          name: 'goodType01',
          typeId: '4004',
        },
        {
          name: 'facilityType01',
          typeId: '4004',
        },
      ],
      goodUrl: '.geojson',
      phoneUrl: '.geojson',
    };
    console.log('rd: MapSDK -> initLayers -> options', options, optionsExample);
  }

  // 过去所有的图层 需提供相应的类来描述图层
  getAllLayers() {
    console.log('rd: MapSDK -> getAllLayers -> getAllLayers');
  }

  // 快速显示图层
  showLayers(layerIds) {
    console.log('rd: MapSDK -> showLayers -> layerIds', layerIds);
  }

  // 快速隐藏图层
  hideLayers(layerIds) {
    console.log('rd: MapSDK -> hideLayers -> layerIds', layerIds);
  }

  // #endregion

  // #region Navigation

  // 获取导航路径
  navigate(options) {
    console.log('rd: MapSDK -> navigate -> options', options);
  }

  // 绘制导航路径
  drawNavigate(options) {
    console.log('rd: MapSDK -> drawNavigate -> options', options);
  }

  // 移除导航路径
  removeNavigate(id) {
    console.log('rd: MapSDK -> removeNavigate -> id', id);
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
