import axios from 'axios';
import LayerItem from './layerItem';
import GpsLayerItem from './gpsLayerItem';

class LayerProvider {
  constructor() {
    this._layerNodeItems = [];
    this._layerFeatures = {};
    this._map = null;
    this._urlBase = null;
    this._tempIcons = [
      'college',
      'park',
      'police',
      'cemetery',
      'castle',
      'charging-station',
      'museum',
      'ranger-station',
      'fuel',
      'monument',
      'marker',
      'harbor',
      'embassy',
    ];
  }

  async constructLayerNodeItems(option) {
    const { layerSources, map, server } = option;
    this._map = map;
    this._urlBase = `http://${server.ip}:${server.port}/geoData/`;
    console.log('rd: LayerProvider -> constructLayerNodeItems -> layerSources,', layerSources);
    await this._buildLayerNodes(layerSources.layers);
    await this._getParseLayerGeodatas(layerSources.dataUrls);
    this._initAllLayers();
    return this._layerNodeItems;
  }

  async _buildLayerNodes(layers) {
    layers.forEach((layer) => {
      const { name, typeID, typeGroupKey } = layer;
      console.log('rd: LayerProvider -> _buildLayerNodes -> name, typeID', name, typeID);
      let nodeItem;
      const option = {
        name,
        typeID,
        typeGroupKey,
        map: this._map,
        icomImage: this._getIcomImageByTypeID(),
      };
      if (typeGroupKey === 'GPS') {
        nodeItem = new GpsLayerItem(option);
      } else {
        nodeItem = new LayerItem(option);
      }
      this._layerNodeItems.push(nodeItem);
    });
    console.log('rd: LayerProvider -> _buildLayerNodes -> _layerNodeItems', this._layerNodeItems);
  }

  _initAllLayers() {
    console.log(
      'rd: LayerProvider -> _initAllLayers -> this._layerNodeItems',
      this._layerNodeItems,
    );

    console.log(
      'rd: LayerProvider -> _initAllLayers -> this._layerFeatures count:',
      Object.getOwnPropertyNames(this._layerFeatures).length,
    );

    for (let index = 0; index < this._layerNodeItems.length; index += 1) {
      const layerItem = this._layerNodeItems[index];
      if (Object.prototype.hasOwnProperty.call(this._layerFeatures, layerItem._typeID)) {
        const features = this._layerFeatures[layerItem._typeID];
        if (features !== null && features.length > 0) {
          layerItem.init(features);
        }
      } else {
        console.info(
          'rd: LayerProvider -> _initAllLayers -> layerItem has no features,typeID:',
          layerItem._typeID,
        );
      }
    }
  }

  _getIcomImageByTypeID() {
    const iconImage = this._tempIcons[this._tempIcons.length - 1];
    this._tempIcons.pop();
    return iconImage;
  }

  _classifyFeature(typeID, feature) {
    if (!Object.prototype.hasOwnProperty.call(this._layerFeatures, typeID)) {
      this._layerFeatures[typeID] = [feature];
    } else {
      this._layerFeatures[typeID].push(feature);
    }
  }

  _parseGeoDatas(geoDatas) {
    const typeFeatures = {};
    for (let index = 0; index < geoDatas.length; index += 1) {
      const { features } = geoDatas[index].data;
      console.log('rd: LayerProvider -> _parseGeoDatas -> features count:', features.length);

      for (let num = 0; num < features.length; num += 1) {
        const feature = features[num];
        if (Object.prototype.hasOwnProperty.call(feature.properties, 'TypeID')) {
          this._classifyFeature(feature.properties.TypeID, feature);
        } else if (Object.prototype.hasOwnProperty.call(feature.properties, 'ParentID')) {
          this._classifyFeature(feature.properties.ParentID, feature);
        } else {
          console.warn('rd: Lack of TypeID, Name:', feature.properties.name);
        }
      }
    }
    return typeFeatures;
  }

  async _getParseLayerGeodatas(urls) {
    console.log('rd: LayerProvider -> _getParseLayerGeodatas -> urls', urls);
    const promises = [];
    for (let index = 0; index < urls.length; index += 1) {
      const urlData = urls[index];
      const geoUrl = `${this._urlBase}${urlData.url}`;
      console.log('rd: LayerProvider -> _getParseLayerGeodatas -> geoUrl', geoUrl);
      promises.push(axios(geoUrl));
    }
    const results = await Promise.all(promises);
    console.log('rd: LayerProvider -> _getParseLayerGeodatas -> results', results);

    this._parseGeoDatas(results);
  }
}

export default new LayerProvider();
