import axios from 'axios';
import IdName from '../components/idName';
import DrawableDynamicClass from '../components/drawableTypeKey';

class DrawableLayer extends IdName {
  constructor(mapsdk, option) {
    const {
      id, name,
    } = option;
    super({ id, name });
    this._mapSdk = mapsdk;
    this._drawables = [];
    this._initDrawables(option);
  }

  addDrawable(option) {
    const drawable = new DrawableDynamicClass(this._typeKey, option);
    this._drawables.push(drawable);
    this._mapSdk.addDrawable(drawable);
  }

  removeDrawable(drawable) {
    console.log('rd: DrawableLayer -> removeDrawable -> drawable', drawable);
    const index = this._drawables.indexOf(drawable);
    if (index !== -1) {
      this._mapSdk.removeDrawable(drawable.id);
      this._drawables.splice(index, index);
    }
  }

  toggleShow(isShow) {
    console.log('rd: DrawableLayer -> toggleShow -> isShow', isShow);
    this._drawables.forEach((element) => {
      const drawable = element;
      drawable.isShow = isShow;
    });
  }


  dispose() {
    this._drawables.forEach((drawable) => {
      this._mapSdk.removeDrawable(drawable.id);
    });
    this._drawables.length = 0;
  }

  async _initDrawables(option) {
    const datas = await this._getGeoData(option);
    this._constrctDrawables(datas, option);
  }

  async _getGeoData(option) {
    const { url, geoData } = option;
    if (url) {
      try {
        const geodata = await axios.get(url);
        const { features } = geodata.data;
        return features;
      } catch (error) {
        return new Error(`getGeoData failed! url :${url}`);
      }
    } else if (geoData) {
      const { features } = geoData;
      return features;
    } else {
      throw new Error('geoData invalid!');
    }
  }

  _constrctDrawables(features, option) {
    console.log('rd: DrawableLayer -> _constrctDrawables -> option', option);
    const { typeKey } = option;
    this._typeKey = typeKey;
    console.log('rd: DrawableLayer -> _constrctDrawables -> typeKey,', this._typeKey);
    features.forEach((feature) => {
      const { coordinates } = feature.geometry;
      const optionObj = option;
      optionObj.coordinate = coordinates;
      this.addDrawable(optionObj);
    });
  }
}

class DrawableLayerService {
  init(option) {
    const { mapSdk } = option;
    this._mapSdk = mapSdk;
    this._layers = new Map();
  }

  createDrawableLayer(option) {
    console.log('rd: DrawableLayerService -> createDrawableLayer -> option', option);
    const layer = new DrawableLayer(this._mapSdk, option);
    this._layers.set(layer.id, layer);
    return layer.id;
  }

  removeDrawableLayer(layerID) {
    console.log('rd: removeDrawableLayer -> layerID', layerID);
    const layer = this._layers.get(layerID);
    if (!layer) {
      console.warn('rd: DrawableLayerService -> removeDrawableLayer -> layer not exist! layerID:', layerID);
    } else {
      this._layers.delete(layerID);
      layer.dispose();
    }
  }

  toggleShowDrawableLayer(isShow, layerID) {
    console.log('rd: removeDrawableLayer -> isShow,layerID', isShow, layerID);
    const layer = this._layers.get(layerID);
    if (!layer) {
      console.warn('rd: DrawableLayerService -> toggleShowDrawableLayer -> layer not exist!', layerID);
      return;
    }

    layer.toggleShow(isShow);
  }
}

export default new DrawableLayerService();
