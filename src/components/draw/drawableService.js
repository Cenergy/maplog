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

const handlerMaps = new Map();
const drawables = new Map();

function init(option) {
  console.log('rd: init -> option', option);
  const tjmpm = new ThreeJsModelHandler(option);
  const routeHandler = new RouteHandler(option);
  const imageHandler = new ImageHandler(option);
  const gpsHandler = new GPSHandler(option);
  const spreadHandler = new SpreadHandler(option);
  const flagHandler = new FlagHandler(option);
  const flylineHandler = new FlylineHandler(option);
  const shadeHandler = new ShadeHandler(option);

  handlerMaps.set(ThreeJsModelDrawable.prototype, tjmpm);
  handlerMaps.set(RouteDrawable.prototype, routeHandler);
  handlerMaps.set(ImageDrawable.prototype, imageHandler);
  handlerMaps.set(GPSDrawable.prototype, gpsHandler);
  handlerMaps.set(SpreadDrawable.prototype, spreadHandler);
  handlerMaps.set(FlagDrawable.prototype, flagHandler);
  handlerMaps.set(FlylineDrawable.prototype, flylineHandler);
  handlerMaps.set(ShadeDrawable.prototype, shadeHandler);
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
  console.log('rd: add -> drawable', drawable);
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

// 移除地图元素
function remove(drawableId) {
  console.log('rd: remove -> drawableId', drawableId);
  const drawable = getDrawableById(drawableId);

  if (!drawable) {
    return true;
  }
  const handler = validateDrawableType(drawable);
  handler.remove(drawableId);
  removeCacheDrawable(drawableId);

  console.log('drawables:', drawables.size);
  return true;
}

export default {
  init,
  add,
  update,
  remove,
};
