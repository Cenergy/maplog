/* eslint-disable class-methods-use-this */
import FlagDrawable from './draw/entities/flagDrawable';
import SpreadDrawable from './draw/entities/spreadDrawable';
import RouteDrawable from './draw/entities/routeDrawable';
import ImageDrawable from './draw/entities/imageDrawable';
import ThreeJsModelDrawable from './draw/entities/modelDrawable';
import ShadeDrawable from './draw/entities/shadeDrawable';
import gpsDataService from '../services/gpsDataService';
import locateService from './locate/locateService';
import buildingService from './buildings/buildingService';
import plotService, { EVENT_ROUTE_GETWAYPOINTS_FINISHED } from '../services/plotService';

class MapSdkExtension {
  init(option) {
    const {
      dataService: { baseUrl },
      navigationService,
    } = option;
    this._baseUrl = baseUrl;
    this._navigationService = navigationService;
  }

  validateOptin(option) {
    const {
      coordinate, minZoom = 8, maxZoom = 19, title, source, type,
    } = option;
    // todo
    return {
      coordinate,
      minZoom,
      maxZoom,
      title,
      source,
      type,
    };
  }

  getUrl(path) {
    return `${this._baseUrl}${path}`;
  }

  /**
   * 获取防护目标型Drawable
   * @param {object} option 选项
   * @example
   * const option = {
   * coordinates: [[113.958808, 22.559213]],
   * minZoom: 5,
   * maxZoom: 19,
   * title: '第三幼儿园',
   * }
   *
   * @returns {Promise}
   *
   * // execute
   * const drawable = getProtectTargetDrawable(option);
   */
  async getProtectTargetDrawable(option) {
    console.log('go: MapSdkExtension -> getProtectTargetDrawable -> option', option);
    const modelOption = this.validateOptin(option);

    console.log('go: MapSdkExtension -> getProtectTargetDrawable -> modelOption', modelOption);
    return new ShadeDrawable(modelOption);
  }

  /**
   * 获取危险源Drawable
   * @param {object} option 选项
   * @example
   * const option = {
   *   coordinate: [113, 26],
   *   minZoom: 8,
   *   maxZoom: 19
   *   title："1000米",
   * };
   *
   * @returns {Promise}
   *
   * // execute
   * const drawable = getDangerSourceDrawable(option);
   */
  async getDangerSourceDrawable(option) {
    console.log('rd: MapSdkExtension -> getDangerSourceDrawable -> option', option);
    const signOption = this.validateOptin(option);
    signOption.imagePath = this.getUrl('images/danger/danger.png');
    return new ImageDrawable(signOption);
  }

  /**
   * 获取医疗机构Drawable
   * @param {object} option 选项
   * @example
   * const option = {
   *   coordinate: [113, 26],
   *   minZoom: 8,
   *   maxZoom: 19
   * };
   *
   * @returns {Promise}
   *
   * // execute
   * const drawable = getMedicalOrganizationDrawable(option);
   */
  async getMedicalOrganizationDrawable(option) {
    console.log('rd: MapSdkExtension -> getMedicalOrganizationDrawable -> option', option);
    const thisOption = this.validateOptin(option);
    thisOption.imagePath = this.getUrl('images/medical/medical.png');
    return new ImageDrawable(thisOption);
  }

  /**
   * 获取告警旗帜类Drawable
   * @param {object} option 选项
   * @example
   * const option = {
   *   coordinate: [113, 26],
   *   minZoom: 8,
   *   maxZoom: 19
   *   title:"火灾预警"
   * };
   *
   * @returns {Promise}
   *
   * // execute
   * const drawable = getWarningFlagDrawable(option);
   */
  async getWarningFlagDrawable(option) {
    console.log('rd: MapSdkExtension -> getWarningFlagDrawable -> option', option);
    const flagOption = this.validateOptin(option);
    return new FlagDrawable(flagOption);
  }

  /**
   * 获取污染源类Drawable
   * @param {object} option 选项
   * @example
   * const option = {
   *   coordinate: [113, 26],
   *   minZoom: 8,
   *   maxZoom: 19
   * };
   *
   * @returns {Promise}
   *
   * // execute
   * const drawable = getPollutionSourceDrawable(option);
   */
  async getPollutionSourceDrawable(option) {
    console.log('rd: MapSdkExtension -> getPollutionSourceDrawable -> option', option);
    const thisOption = this.validateOptin(option);
    thisOption.imagePath = this.getUrl('images/pollution/pollution.png');
    return new ImageDrawable(thisOption);
  }

  /**
   * 获取避难场所类Drawable
   * @param {object} option 选项
   * @example
   * const option = {
   *   coordinate: [113, 26],
   *   minZoom: 8,
   *   maxZoom: 19
   * };
   *
   * @returns {Promise}
   *
   * // execute
   * const drawable = getRefugePlacesDrawable(option);
   */
  async getRefugePlacesDrawable(option) {
    console.log('rd: MapSdkExtension -> getRefugePlacesDrawable -> option', option);
    const thisOption = this.validateOptin(option);
    thisOption.imgPath = this.getUrl('images/refugeplace');
    thisOption.spreadRank = 0.08;
    return new SpreadDrawable(thisOption);
  }

  /**
   * 获取仓库(楼层罩)类Drawable
   * @param {object} option 选项
   * @example
   * const option = {
   *   coordinate: [113, 26],
   *   minZoom: 8,
   *   maxZoom: 19，
   *   modelAltitude: 200
   * };
   *
   * @returns {Promise}
   *
   * // execute
   * const drawable = getWarehouseDrawable(option);
   */
  async getWarehouseDrawable(option) {
    console.log('rd: MapSdkExtension -> getWarehouseDrawable -> option', option);
    const shadeOption = this.validateOptin(option);
    shadeOption.type = 'box';
    // modelOption.modelUrl = this.getUrl('models/warehouse/warehouse');
    return new ShadeDrawable(shadeOption);
  }

  /**
   * 获取车类Drawable
   * @param {object} option 选项
   * @example
   * const option = {
   *   coordinate: [113, 26],
   *   minZoom: 8,
   *   maxZoom: 19，
   *   modelAltitude: 10
   * };
   *
   * @returns {Promise}
   *
   * // execute
   * const drawable = getModelCarDrawable(option);
   */
  async getModelCarDrawable(option) {
    console.log('go: MapSdkExtension -> getModelCarDrawable -> option', option);
    const modelOption = this.validateOptin(option);
    modelOption.modelUrl = this.getUrl('models/401000100002/401000100002');
    modelOption.scale = 100;
    return new ThreeJsModelDrawable(modelOption);
  }

  /**
   * 获取事件影响的类Drawable
   * @param {object} option 选项
   * @example
   * const option = {
   *   coordinate: [113, 26],
   *   minZoom: 8,
   *   maxZoom: 19
   * };
   *
   * @returns {Promise}
   *
   * // execute
   * const drawable = getspreadAffectDrawable(option);
   */
  async getEventAffectDrawable(option) {
    console.log('rd: MapSdkExtension -> getspreadAffectDrawable -> option', option);
    const thisOption = this.validateOptin(option);
    thisOption.imgPath = this.getUrl('images/radarEffect/red');
    return new SpreadDrawable(thisOption);
  }

  /**
   * 获取事件影响的类Drawable
   * @param {object} option 选项
   * @example
   * const option = {
   *   coordinates:  [[113.958263, 22.559213],[113.87572, 22.586208]],
   *   minZoom: 14,
   *   maxZoom: 19
   * };
   *
   * @returns {Promise}
   *
   * // execute
   * const drawable = getRouteDrawable(option);
   */
  async getRouteDrawable(option) {
    console.log('rd: MapSdkExtension -> getRouteDrawable -> option', option);
    const navigationData = await this._navigationService.getNavigationData(option);
    const {
      distance,
      duration,
      geometry: { coordinates },
    } = navigationData;

    const {
      minZoom, maxZoom, centreDetail, isDynamicDraw,
    } = option;
    const routeOption = {
      distance,
      duration,
      centreDetail,
      coordinates,
      minZoom,
      maxZoom,
      isDynamicDraw,
    };
    return new RouteDrawable(routeOption);
  }

  // 获取GPS数据服务器
  getGpsDataService() {
    return gpsDataService;
  }

  /**
   * 开启/关闭显示地图基本信息
   * @param {boolean} isShow 开启/关闭
   * @example
   * const isShow = true;
   * @returns {void}:地图中心点经纬度、层级、视角等信息
   *
   * // execute
   * toggleShowMapBasicInfo(isShow);
   */
  toggleShowMapBasicInfo(isShow) {
    console.log('rd: MapSdkExtension -> toggleShowMapBasicInfo -> isShow', isShow);
    locateService.toggleShowMapBasicInfo(isShow);
  }

  /**
   * 添加点位图标
   * @param {string} imagePath 图片路径
   * @example
   * const imagePath = '/images/dangerSource.png';
   * @returns {object}
   *
   * // execute
   * addPointPlotMarker(imagePath);
   * 点击添加图标、图标可点击显示详情
   */
  addPointPlotMarker(imagePath) {
    console.log('rd: MapSdkExtension -> addPointPlotMarker -> imagePath', imagePath);
    const signOption = {
      minZoom: 13,
      maxZoom: 22,
      imagePath: this.getUrl(`images/${imagePath}/${imagePath}.png`),
    };
    return new ImageDrawable(signOption);
  }

  /**
   * 开启/关闭 获取建筑信息
   * @param {boolean} isShowYou 开启/关闭
   * @param {Event} e event
   * @example
   * const isOpen = true;
   *
   * @returns {void}
   *
   * // execute
   * toggleGetBuildingInfo(isOpen);
   * 点击点亮、显示详情
   */
  toggleGetBuildingInfo(isShowYou, e) {
    console.log('go: MapSdkExtension -> toggleGetBuildingInfo -> isShowYou1111111111', isShowYou);
    if (!isShowYou) return;
    buildingService.showBuildingInfo(isShowYou, e);
  }

  /**
   * 开启获取导航路径数据
   *
   * @returns {void}
   * // execute
   * startGetNavigationData();
   */
  startGetNavigationData() {
    plotService.startGetNavigationData();
  }

  /**
   * 结束获取导航路径数据
   *
   * @returns {void}
   * // execute
   * endGetNavigationData();
   */
  endGetNavigationData() {
    plotService.endGetNavigationData();
  }
}

export default MapSdkExtension;
