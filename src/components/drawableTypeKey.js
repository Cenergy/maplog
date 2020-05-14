
import ImageDrawable from './draw/entities/imageDrawable';
import ThreeJsModelDrawable from './draw/entities/modelDrawable';


/**
 * 图片型图标绘制参数
 * @param {object} option 选项
 * @example
 * const option = {
 *   url: 'http://10.8.9.64:3038/geoData/camera.json',
 *   geoData:{
 *    "type": "FeatureCollection",
 *    "features": [
 *        {
 *            "type": "Feature",
 *            "properties": {
 *                "名称": "凤凰路"
 *            },
 *            "geometry": {
 *                "type": "Point",
 *                "coordinates": [
 *                    113.9526774,
 *                    22.551219045
 *                ]
 *            }
 *        },{}...
 *    ]
 * }
 *   typeKey: FLAG_DRAWABLE_TYPE,
 *   width:100,
 *   height:200,
 *   minZoom:10,
 *   maxZoom:19,
 *   title:"火灾告警"
 * };
 *
 */
export const FLAG_DRAWABLE_TYPE = 'FlagDrawable';


/**
 * 图片型图标绘制参数
 * @param {object} option 选项
 * @example
 * const option = {
 *   url: 'http://10.8.9.64:3038/geoData/camera.json',
 *   geoData:{
 *    "type": "FeatureCollection",
 *    "features": [
 *        {
 *            "type": "Feature",
 *            "properties": {
 *                "名称": "凤凰路"
 *            },
 *            "geometry": {
 *                "type": "Point",
 *                "coordinates": [
 *                    113.9526774,
 *                    22.551219045
 *                ]
 *            }
 *        },{}...
 *    ]
 * }
 *   typeKey: IMAGE_DRAWABLE_TYPE,
 *   imagePath: 'http://10.8.9.64:3038/images/pollution/pollution.png',
 *   minZoom:10,
 *   maxZoom:19
 * };
 *
 */
export const IMAGE_DRAWABLE_TYPE = 'ImageDrawable';

/**
 * 构造模型
 * @param {object} option 选项
 * @example
 * const option = {
 *   url: 'http://10.8.9.64:3038/geoData/camera.json',
 *   geoData:{
 *    "type": "FeatureCollection",
 *    "features": [
 *        {
 *            "type": "Feature",
 *            "properties": {
 *                "名称": "凤凰路"
 *            },
 *            "geometry": {
 *                "type": "Point",
 *                "coordinates": [
 *                    113.9526774,
 *                    22.551219045
 *                ]
 *            }
 *        },{}...
 *    ]
 * }
 *   typeKey: THREEJS_MODEL_DRAWABLE_TYPE,
 *   modelUrl: 'http://xxxx/models/file/file.gltf',
 *   minZoom:10,
 *   maxZoom:19
 * };
 *
 */
export const THREEJS_MODEL_DRAWABLE_TYPE = 'ThreeJsModelDrawable';

/**
 * 保护性遮罩绘制参数
 * @param {object} option 选项
 * @example
 * const option = {
 *   url: 'http://10.8.9.64:3038/geoData/camera.json',
 *   geoData:{
 *    "type": "FeatureCollection",
 *    "features": [
 *        {
 *            "type": "Feature",
 *            "properties": {
 *                "名称": "凤凰路"
 *            },
 *            "geometry": {
 *                "type": "Point",
 *                "coordinates": [
 *                    113.9526774,
 *                    22.551219045
 *                ]
 *            }
 *        },{}...
 *    ]
 * }
 *   typeKey: SHADE_DRAWABLE_TYPE,
 *   minZoom:10,
 *   maxZoom:19
 * };
 *
 */
export const SHADE_DRAWABLE_TYPE = 'ShadeDrawable';

/**
 * 扩散型绘制参数
 * @param {object} option 选项
 * @example
 * const option = {
 *   url: 'http://10.8.9.64:3038/geoData/camera.json',
 *   geoData:{
 *    "type": "FeatureCollection",
 *    "features": [
 *        {
 *            "type": "Feature",
 *            "properties": {
 *                "名称": "凤凰路"
 *            },
 *            "geometry": {
 *                "type": "Point",
 *                "coordinates": [
 *                    113.9526774,
 *                    22.551219045
 *                ]
 *            }
 *        },{}...
 *    ]
 * }
 *   typeKey: SPREAD_DRAWABLE_TYPE,
 *   minZoom: 10,
 *   maxZoom: 16,
 *   imgPath = 'http://10.8.9.64:3038/images/refugeplace';
 *   spreadRank = 0.08;
 * };
 *
 */
export const SPREAD_DRAWABLE_TYPE = 'SpreadDrawable';

/**
 * 纹孔托绘制参数
 * @param {object} option 选项
 * @example
 * const option = {
    *   url: 'http://10.8.9.64:3038/geoData/camera.json',
    *   geoData:{
    *    "type": "FeatureCollection",
    *    "features": [
    *        {
    *            "type": "Feature",
    *            "properties": {
    *                "名称": "凤凰路"
    *            },
    *            "geometry": {
    *                "type": "Point",
    *                "coordinates": [
    *                    113.9526774,
    *                    22.551219045
    *                ]
    *            }
    *        },{}...
    *    ]
    * }
    *   typeKey: TORUS_DRAWABLE_TYPE,
    *   minZoom:10,
    *   maxZoom:19
    * };
    *
    */
export const TORUS_DRAWABLE_TYPE = 'TorusDrawable';

/**
 * 纹孔托绘制参数
 * @param {object} option 选项
 * @example
 * const option = {
    *   url: 'http://10.8.9.64:3038/geoData/camera.json',
    *   geoData:{
    *    "type": "FeatureCollection",
    *    "features": [
    *        {
    *            "type": "Feature",
    *            "properties": {
    *                "名称": "凤凰路"
    *            },
    *            "geometry": {
    *                "type": "Point",
    *                "coordinates": [
    *                    113.9526774,
    *                    22.551219045
    *                ]
    *            }
    *        },{}...
    *    ]
    * }
    *   typeKey: TORUS_DRAWABLE_TYPE,
    *   minZoom:10,
    *   maxZoom:19
    * };
    *
    */
export const BALLOON_DRAWABLE_TYPE = 'BalloonDrawable';

export const POINT_FEATURES_LAYER_TYPE = 'PointFeaturesLayer';

const classes = {
  ImageDrawable,
  ThreeJsModelDrawable,
};

class DrawableDynamicClass {
  constructor(className, option) {
    return new classes[className](option);
  }
}

export default DrawableDynamicClass;
