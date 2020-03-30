import ThreeJsModelDrawable from './entities/modelDrawable';
import ThreeJsModelHandler from './handlers/modelHandler';
import RouteDrawable from './entities/routeDrawable';
import RouteHandler from './handlers/routeHandler';
import ImageDrawable from './entities/imageDrawable';
import ImageHandler from './handlers/imageHandler';
import GPSHandler from './handlers/gpsHandler';
import GPSDrawable from './entities/gpsDrawable';
import SpreadHandler from './handlers/spreadHandler';
import SpreadDrawable from './entities/spreadDrawable';
import FlagHandler from './handlers/flagHandler';
import FlagDrawable from './entities/flagDrawable';
import FlylineHandler from './handlers/flylineHandler';
import FlylineDrawable from './entities/flylineDrawable';
import ShadeDrawable from './entities/shadeDrawable';
import ShadeHandler from './handlers/shadeHandler';
import TorusDrawable from './entities/torusDrawable';
import TorusHandler from './handlers/torusHandler';
import BalloonDrawable from './entities/balloonDrawable';
import BalloonHandler from './handlers/balloonHandler';
import FlyPointDrawable from './entities/flyPointDrawable';
import FlyPointHandler from './handlers/flyPointHandler';
import GradientLineDrawable from './entities/gradientLineDrawable';
import GradientLineHandler from './handlers/gradientLineHandler';
import ThreeTextDrawable from './entities/threeTextDrawable';
import ThreeTextHandler from './handlers/threeTextHandler';
import SpriteTextDrawable from './entities/spriteTextDrawable';
import SpriteTextHandler from './handlers/spriteTextHandler';
import AreaEagleMapHandler from './handlers/areaEagleMapHandler';
import AreaEagleMapDrawable from './entities/areaEagleMapDrawable';
import LineFlowHandler from './handlers/lineFlowHandler';
import LineFlowDrawable from './entities/lineFlowDrawable';
import BlockadeZoneDrawable from './entities/blockadeZoneDrawable';
import BlockadeZoneHandler from './handlers/blockadeZoneHandler';
import FlyParticleDrawable from './entities/flyParticleDrawable';
import FlyParticleHandler from './handlers/flyParticleHandler';
import GlowBindDrawable from './entities/glowBindDrawable';
import GlowBindHandler from './handlers/glowBindHandler';
import DiffusionDrawable from './entities/diffusionDrawable';
import DiffusionHandler from './handlers/diffusionHandler';
import LinkLinesDrawable from './entities/linkLinesDrawable';
import LinkLinesHandler from './handlers/linkLinesHandler';
import ReflectPlaneDrawable from './entities/reflectPlaneDrawable';
import ReflectPlaneHandler from './handlers/reflectPlaneHandler';
import PlotHandler from './handlers/plotHandler';
import PlotDrawable from './entities/plotDrawable';
import RoadLinesDrawable from './entities/roadLinesDrawable';
import RoadLineHandler from './handlers/roadLinesHandler';
import SphereShaderDrawable from './entities/sphereShaderDrawable';
import SphereShaderHandler from './handlers/sphereShaderHandler';
import CityBoundaryDrawable from './entities/cityBoundaryDrawable';
import CityBoundaryHandler from './handlers/cityBoundaryHandler';
import RoundnessRayDrawable from './entities/roundnessRayDrawable';
import RoundnessRayHandler from './handlers/roundnessRayHandler';

const handlerMaps = new Map();
const drawables = new Map();

function init(option) {
    // console.log('rd: init -> option', option);
    const tjmpm = new ThreeJsModelHandler(option);
    const routeHandler = new RouteHandler(option);
    const imageHandler = new ImageHandler(option);
    const gpsHandler = new GPSHandler(option);
    const spreadHandler = new SpreadHandler(option);
    const flagHandler = new FlagHandler(option);
    const flylineHandler = new FlylineHandler(option);
    const shadeHandler = new ShadeHandler(option);
    const torusHandler = new TorusHandler(option);
    const balloonHandler = new BalloonHandler(option);
    const flyPointHandler = new FlyPointHandler(option);
    const gradientLineHandler = new GradientLineHandler(option);
    const threeTextHandler = new ThreeTextHandler(option);
    const spriteTextHandler = new SpriteTextHandler(option);
    const areaEagleMapHandler = new AreaEagleMapHandler(option);
    const lineFlowHandler = new LineFlowHandler(option);
    const blockadeZoneHandler = new BlockadeZoneHandler(option);
    const flyParticleHandler = new FlyParticleHandler(option);
    const glowBindHandler = new GlowBindHandler(option);
    const diffusionHandler = new DiffusionHandler(option);
    const linkLinesHandler = new LinkLinesHandler(option);
    const reflectPlaneHandler = new ReflectPlaneHandler(option);
    const plotHandler = new PlotHandler(option);
    const roadLinesHandler = new RoadLineHandler(option);
    const sphereShaderHandler = new SphereShaderHandler(option);
    const cityBoundaryHandler = new CityBoundaryHandler(option);
    const roundnessRayHandler = new RoundnessRayHandler(option);

    handlerMaps.set(ThreeJsModelDrawable.prototype, tjmpm);
    handlerMaps.set(RouteDrawable.prototype, routeHandler);
    handlerMaps.set(ImageDrawable.prototype, imageHandler);
    handlerMaps.set(GPSDrawable.prototype, gpsHandler);
    handlerMaps.set(SpreadDrawable.prototype, spreadHandler);
    handlerMaps.set(FlagDrawable.prototype, flagHandler);
    handlerMaps.set(FlylineDrawable.prototype, flylineHandler);
    handlerMaps.set(ShadeDrawable.prototype, shadeHandler);
    handlerMaps.set(TorusDrawable.prototype, torusHandler);
    handlerMaps.set(BalloonDrawable.prototype, balloonHandler);
    handlerMaps.set(FlyPointDrawable.prototype, flyPointHandler);
    handlerMaps.set(GradientLineDrawable.prototype, gradientLineHandler);
    handlerMaps.set(ThreeTextDrawable.prototype, threeTextHandler);
    handlerMaps.set(SpriteTextDrawable.prototype, spriteTextHandler);
    handlerMaps.set(AreaEagleMapDrawable.prototype, areaEagleMapHandler);
    handlerMaps.set(LineFlowDrawable.prototype, lineFlowHandler);
    handlerMaps.set(BlockadeZoneDrawable.prototype, blockadeZoneHandler);
    handlerMaps.set(FlyParticleDrawable.prototype, flyParticleHandler);
    handlerMaps.set(GlowBindDrawable.prototype, glowBindHandler);
    handlerMaps.set(DiffusionDrawable.prototype, diffusionHandler);
    handlerMaps.set(LinkLinesDrawable.prototype, linkLinesHandler);
    handlerMaps.set(ReflectPlaneDrawable.prototype, reflectPlaneHandler);
    handlerMaps.set(PlotDrawable.prototype, plotHandler);
    handlerMaps.set(RoadLinesDrawable.prototype, roadLinesHandler);
    handlerMaps.set(SphereShaderDrawable.prototype, sphereShaderHandler);
    handlerMaps.set(CityBoundaryDrawable.prototype, cityBoundaryHandler);
    handlerMaps.set(RoundnessRayDrawable.prototype, roundnessRayHandler);
}

function validateDrawableType(drawable) {
    const prototype = Object.getPrototypeOf(drawable);
    if (!handlerMaps.has(prototype)) {
        throw new Error(`not support type:${drawable}`);
    }
    return handlerMaps.get(prototype);
}

function cacheDrawable(drawable) {
    if (drawables.has(drawable._id)) {
        throw new Error('duplicate add drawable');
    }
    drawables.set(drawable._id, drawable);
}

function getDrawableById(id) {
    if (drawables.has(id)) {
        return drawables.get(id);
    }
    return null;
}

function removeCacheDrawable(id) {
    drawables.delete(id);
}

// 绘制地图元素
function add(drawable) {
    // console.log('go: add -> drawable', drawable);
    const handler = validateDrawableType(drawable);
    cacheDrawable(drawable);
    return handler.add(drawable);
}

// 更新地图元素
function update(drawable) {
    // console.log('rd: MapSDK -> updateDrawable -> drawable', drawable);
    const handler = validateDrawableType(drawable);
    return handler.update(drawable);
}

// 显示信息
function show(drawable, e, popUp) {
    const handler = validateDrawableType(drawable);
    return handler.show && handler.show(drawable, e, popUp);
}

// 移除地图元素
function remove(drawableId) {
    // console.log('rd: remove -> drawableId', drawableId);
    const drawable = getDrawableById(drawableId);

    if (!drawable) {
        return true;
    }
    const handler = validateDrawableType(drawable);
    handler.remove(drawableId);
    removeCacheDrawable(drawableId);

    // console.log('drawables:', drawables.size);
    return true;
}

export default {
    init,
    add,
    update,
    remove,
    show,
};
