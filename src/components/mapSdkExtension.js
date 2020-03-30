/* eslint-disable class-methods-use-this */
import SpreadDrawable from './draw/entities/spreadDrawable';
import RouteDrawable from './draw/entities/routeDrawable';
import ImageDrawable from './draw/entities/imageDrawable';
import ThreeJsModelDrawable from './draw/entities/modelDrawable';
import ShadeDrawable from './draw/entities/shadeDrawable';
import gpsDataService from '../services/gpsDataService';
import locateService from './locate/locateService';
import plotService from '../services/plotService';
import buildingService from './buildings/buildingService';
import mathUtils from '../utils/mathUtils';

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
        const { coordinate, minZoom = 8, maxZoom = 19, spreadRank, title, source, type, offset, length } = option;
        // todo
        return {
            coordinate,
            minZoom,
            maxZoom,
            title,
            source,
            type,
            offset,
            spreadRank,
            length,
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
        const modelOption = this.validateOptin(option);
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
        const signOption = this.validateOptin(option);
        signOption.imagePath = this.getUrl('commondata/danger/danger.png');
        signOption.width = 80;
        signOption.height = 120;
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
        thisOption.imagePath = this.getUrl('commondata/medical/medical.png');
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
        // const flagOption = this.validateOptin(option);
        // return new FlagDrawable(flagOption);
        const signOption = this.validateOptin(option);
        signOption.imagePath = this.getUrl('commondata/flag/flag.png');
        signOption.width = 135.5;
        signOption.height = 123;
        signOption.offset = [67, 1];
        return new ImageDrawable(signOption);
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
        thisOption.imagePath = this.getUrl('commondata/pollution/pollution.png');
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
        const thisOption = this.validateOptin(option);
        thisOption.imgPath = this.getUrl('commondata/refugeplace');
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
        modelOption.modelUrl = this.getUrl('commondata/policecar/policecar');
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
     *   maxZoom: 19,
     *    spreadRank:1
     * };
     *
     * @returns {Promise}
     *
     * // execute
     * const drawable = getspreadAffectDrawable(option);
     */
    async getEventAffectDrawable(option) {
        const thisOption = this.validateOptin(option);
        thisOption.imgPath = this.getUrl('commondata/spread/red');
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

        option.distance = distance;
        option.duration = duration;
        option.coordinates = coordinates;
        return new RouteDrawable(option);
    }

    // 获取GPS数据服务器
    getGpsDataService() {
        return gpsDataService;
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
            imagePath: this.getUrl(`commondata/${imagePath}/${imagePath}.png`),
        };
        return new ImageDrawable(signOption);
    }

    /**
     * 开启获取导航路径数据
     * @param {string} selector 选择器
     *
     * @returns {void}
     * // execute
     * startGetNavigationData(selector);
     */
    startGetNavigationData(selector) {
        plotService.startGetNavigationData(selector);
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
     * 开启/关闭 获取建筑信息
     * @param {boolean} isShow 开启/关闭
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
    toggleGetBuildingInfo(isShow, e) {
        console.log('Rd: MapSdkExtension -> toggleGetBuildingInfo -> isShow', isShow);
        if (!isShow) return;
        buildingService.showBuildingInfo(isShow, e);
    }

    /**
     * 指定范围进行地图自适应、调整地图视点
     * @param {object} option 范围及需呈现的地图元素坐标集合
     * @example
     * const option = {
     *      start,  //显示起始范围：可为0~12;将地图可视界面按X轴均分为12等份。
     *      end  //显示终止范围：可为0~12; start必须小于等于end值
     *      coordinates:[[113.2,22.1],[113.6,24.6]],   // 地图元素坐标点集
     *      margin: { top: 50, bottom: 50, left: 60, right: 60 } //与周边间隔
     * };
     *
     * @returns {void}
     *
     * // execute
     * fitMapView(option);
     */
    fitMapView(option) {
        console.log('rd: MapSdkExtension -> fitMapView -> option', option);
        locateService.fitMapView(option);
    }

    // 是否显示交通路况
    toggleShowMapTraffic(isShow) {
        console.log('rd: MapSdkExtension -> toggleShowMapTraffic -> isShow', isShow);
        locateService.toggleShowMapTraffic(isShow);
    }

    /**
     * 根据中心点和半径构建正多边形
     * @param {object} option 构建正多边形参数对象
     * @example
     * const option = {
     *     center: [113.995943, 22.53698],      // 中心点
     *     radius: 1,                           // 半径,单位千米
     *     steps: 6,                            // 多边形变数，默认为6
     * };
     *
     * @returns {array}
     *
     * // execute
     * calcRegularPolygon(option);
     */
    calcRegularPolygon(option) {
        const { center, radius, steps } = option;
        if (!center || !radius) {
            console.error('rd: MapSdkExtension -> calcRegularPolygon -> invalid input:center, radius!');
            return null;
        }
        const circle = mathUtils.calcRegularPolygon(center, radius, steps);
        const { geometry } = circle;
        return geometry.coordinates;
    }
}

export default MapSdkExtension;
