import ThreeJsModelDrawable from './entities/modelDrawable';
import ThreeJsModelHandler from './handlers/modelHandler';
import ImageDrawable from './entities/imageDrawable';
import ImageHandler from './handlers/imageHandler';

import SpriteImageDrawable from './entities/spriteImageDrawable';
import SpriteImageHandler from './handlers/spriteImageHandler';

const handlerMaps = new Map();
const drawables = new Map();

function init(option) {
    console.log('rd: init -> option', option);
    const tjmpm = new ThreeJsModelHandler(option);
    handlerMaps.set(ThreeJsModelDrawable.prototype, tjmpm);

    const imageHandler = new ImageHandler(option);
    const spriteImageHandler = new SpriteImageHandler(option);


    handlerMaps.set(ImageDrawable.prototype, imageHandler);
    handlerMaps.set(SpriteImageDrawable.prototype, spriteImageHandler);
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
