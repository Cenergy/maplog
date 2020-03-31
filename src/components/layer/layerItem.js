/* eslint-disable class-methods-use-this */
import mapboxgl from 'mapbox-gl';
import detailHelper from './layerDetailHelper';

class LayerItem {
  constructor(option) {
    const {
      name, typeID, typeGroupKey, map, icomImage,
    } = option;
    this._name = name;
    this._typeID = typeID;
    this._typeGroupKey = typeGroupKey;
    this._map = map;
    this._region = null;
    this._minZoom = 8;
    this._maxZoom = 18;
    this._features = null;
    this._isShow = false;
    this._sourceName = `source_${this._typeID}`;
    this._clustersName = `clusters_${this._typeID}`;
    this._clusterCountName = `clusterCount_${this._typeID}`;
    this._unclusteredPointName = `unclusteredPoint_${this._typeID}`;
    this._iconImage = icomImage;
    this._map.on('zoom', () => {
      this._zoomChangeVisibility();
    });
  }

  init(features) {
    this._features = features;
    console.log(
      `rd: LayerItem -> init -> layerItem:${this._typeID},features count:${this._features.length}`,
    );
    console.log('rd: LayerItem -> init -> this._features[0]', this._features[0]);
    const clustersLayer = this._map.getLayer(`clusters_${this._typeID}`);
    if (!clustersLayer) {
      this._addLayerSymbols();
    } else {
      console.warn('rd: LayerItem -> init -> already initialized,typeID:', this._typeID);
    }
  }

  show() {
    this._isShow = true;
    if (this._features !== null && this._features.length > 0) {
      this._toggleLayerVisibility(true);
    }
  }

  hide() {
    this._isShow = false;
    if (this._features !== null && this._features.length > 0) {
      this._toggleLayerVisibility(false);
    }
  }

  setRegion(option) {
    console.log('rd: LayerItem -> setRegion -> option', option);
  }

  setMinMaxZoom(minZoom, maxZoom) {
    console.log(
      'rd: LayerItem -> setMinMaxZoom -> typeID,minZoom, maxZoom',
      this._typeID,
      minZoom,
      maxZoom,
    );
    this._minZoom = minZoom;
    this._maxZoom = maxZoom;
  }

  getLayerSymbols() {}

  dispose() {
    this._map.off('zoom', () => {
      this._zoomChangeVisibility();
    });
  }

  _toggleLayerVisibility(isShow) {
    this._map.setLayoutProperty(this._clustersName, 'visibility', isShow ? 'visible' : 'none');
    this._map.setLayoutProperty(this._clusterCountName, 'visibility', isShow ? 'visible' : 'none');
    this._map.setLayoutProperty(
      this._unclusteredPointName,
      'visibility',
      isShow ? 'visible' : 'none',
    );
  }

  _zoomChangeVisibility() {
    const currentZoom = this._map.getZoom();
    const needHide = currentZoom >= this._maxZoom || currentZoom <= this._minZoom;
    if (this._features !== null && this._features.length > 0) {
      if (this._isShow && needHide) {
        this._toggleLayerVisibility(false);
      } else if (this._isShow && !needHide) {
        this._toggleLayerVisibility(true);
      }
    }
  }

  _addLayerSymbols() {
    this._map.addSource(this._sourceName, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: this._features,
      },
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 250,
    });

    this._map.addLayer({
      id: this._clustersName,
      type: 'circle',
      source: this._sourceName,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 100, '#f1f075', 750, '#f28cb1'],
        'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
      },
    });

    this._map.addLayer({
      id: this._clusterCountName,
      type: 'symbol',
      source: this._sourceName,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 13,
      },
    });

    this._map.addLayer({
      id: this._unclusteredPointName,
      type: 'symbol',
      source: this._sourceName,
      filter: ['!', ['has', 'point_count']],
      layout: {
        'icon-image': `${this._iconImage}-15`,
        'icon-size': 1.2,
        'icon-anchor': 'bottom',
      },
    });

    this._map.setLayoutProperty(this._clustersName, 'visibility', 'none');
    this._map.setLayoutProperty(this._clusterCountName, 'visibility', 'none');
    this._map.setLayoutProperty(this._unclusteredPointName, 'visibility', 'none');

    this._map.on('click', this._clustersName, (e) => {
      const features = this._map.queryRenderedFeatures(e.point, {
        layers: [this._clustersName],
      });
      const clusterId = features[0].properties.cluster_id;
      this._map.getSource(this._sourceName).getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;

        this._map.easeTo({
          center: features[0].geometry.coordinates,
          zoom,
        });
      });
    });

    this._map.on('click', this._unclusteredPointName, (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      const detailInfo = detailHelper.getLayerPointDetail(this._typeGroupKey, e.features[0]);
      new mapboxgl.Popup({ offset: 36 })
        .setLngLat(coordinates)
        .setHTML(`<h1>${detailInfo}</h1>`)
        .addTo(this._map);
    });

    this._map.on('mouseenter', this._clustersName, () => {
      this._map.getCanvas().style.cursor = 'pointer';
    });
    this._map.on('mouseleave', this._clustersName, () => {
      this._map.getCanvas().style.cursor = '';
    });

    this._map.on('mouseenter', this._unclusteredPointName, () => {
      this._map.getCanvas().style.cursor = 'pointer';
    });

    this._map.on('mouseleave', this._unclusteredPointName, () => {
      this._map.getCanvas().style.cursor = '';
    });
  }
}

export default LayerItem;
