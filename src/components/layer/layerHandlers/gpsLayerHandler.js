import find from 'lodash/find';
import filter from 'lodash/filter';
import remove from 'lodash/remove';
import * as turf from '@turf/turf';
import LayerHandlerBase from './handlerBase';
import GpsDataService, {
  EVENT_GPSDEVICE_ADDED,
  EVENT_GPSDEVICE_REMOVED,
  EVENT_GPSDEVICE_UNDATED,
} from '../../../services/gpsDataService';
import zoomShowController from '../../zoomShowController';
import dataService from '../../../services/dataService';
import ThreeJsModelDrawable from '../../draw/entities/modelDrawable';
import SpreadDrawable from '../../draw/entities/spreadDrawable';
import calculator from '../../../utils/latLngsCalculator';
import layerZIndexHelper from '../../layerZIndexHelper';

class GpsDeviceWrapper {
  constructor({ gpsDevice, mapSdk, layer }) {
    console.log('rd: GpsDeviceWrapper -> constructor -> gpsDevice', gpsDevice);
    this._layer = layer;
    this._isShow = this._layer.isShow;
    this._coordinate = gpsDevice.coordinate;
    this._gpsDevice = gpsDevice;
    this._mapSdk = mapSdk;
    this._isAnimating = false;
    this._init();
  }

  _init() {
    const modelOption = {
      coordinate: this._gpsDevice.coordinate,
      modelAltitude: 0,
      modelUrl: `${dataService.baseUrl}models/${this._layer.typeId}/${this._layer.typeId}`,
    };
    this._modelDrawable = new ThreeJsModelDrawable(modelOption);
    this._modelDrawable.isShow = this._isShow;
    this._mapSdk.addDrawable(this._modelDrawable);

    this._gpsDevice.ChangeCallback = this._changeCallback.bind(this);
    this._gpsDevice.ShowTrackChangeCallback = this._showTrackChangeCallback.bind(this);
  }

  _showTrackChangeCallback() {
    this.toggleShowTrack(this._gpsDevice.IsShowTrack);
  }

  _changeCallback() {
    if (this._gpsDevice.IsOpenScan) {
      this.openScan();
    } else {
      this.closeScan();
    }
  }

  toggleShow(isShow) {
    // console.log('rd: toggleShow -> isShow', isShow);
    this._isShow = isShow;
    this._modelDrawable.isShow = isShow;
    if (this._scanDrawable) {
      this._scanDrawable.isShow = this._isShow;
    }

    const showTrack = isShow && this._gpsDevice.IsShowTrack;
    this.toggleShowTrack(showTrack);
  }

  openScan(option = { radius: 0.1 }) {
    if (!this._scanDrawable) {
      const { radius } = option;
      console.log('rd: openScan -> option', option);
      const scanOption = {
        coordinate: this._gpsDevice.coordinate,
        imgPath: `${dataService.baseUrl}images/gps`,
        spreadRank: radius,
      };
      this._scanDrawable = new SpreadDrawable(scanOption);
      this._scanDrawable.isShow = this._isShow;
      this._mapSdk.addDrawable(this._scanDrawable);
    }
    this._scanDrawable.isShow = this._isShow;
  }

  closeScan() {
    if (this._scanDrawable) {
      this._scanDrawable.isShow = false;
    }
  }

  updateScan(option) {
    if (this._scanDrawable) {
      const { radius, coordinate } = option;
      // this._scanDrawable._spreadRank = radius;
      this._scanDrawable.coordinate = coordinate;
      this._mapSdk.updateDrawable(this._scanDrawable);
    }
  }

  update(option) {
    console.log('rd: update -> option.coordinate', option.coordinate);
    const { coordinate, callBack } = option;
    if (this._modelDrawable.coordinate !== coordinate) {
      this._animationTo(coordinate, callBack);
    }
  }

  remove() {
    console.log('rd: remove -> remove');
    if (this._scanDrawable) {
      this._mapSdk.removeDrawable(this._scanDrawable._id);
    }

    this._mapSdk.removeDrawable(this._modelDrawable._id);
  }

  toggleShowTrack(showTrack) {
    console.log('rd: toggleShowTrack -> showTrack', showTrack);
    const drawableID = this._modelDrawable._id;
    const layer = this._mapSdk.map.getLayer(drawableID);
    if (!layer) {
      this._addRoute(drawableID, this._gpsDevice.route);
    }

    this._mapSdk.map.setLayoutProperty(
      drawableID,
      'visibility',
      this._isShow && showTrack ? 'visible' : 'none',
    );
  }

  _animationTo(newCoordinate, callBack) {
    const oldPoint = turf.point(this._coordinate);
    const newPoint = turf.point(newCoordinate);
    if (turf.booleanEqual(oldPoint, newPoint)) {
      console.log(
        "rd: GPSDevice -> animationTo -> newCoordinate is equal old, won't move.",
        newCoordinate,
      );
      return;
    }

    // 判断是否正在运行中
    if (this._isAnimating) {
      // console.log('rd: _animationTo -> this._isAnimating', this._isAnimating);
      this._newCoordinate = newCoordinate;
      return;
    }
    this._newCoordinate = null;
    this._isAnimating = true;

    const { points, steps } = calculator.cutLineToPoints(this._coordinate, newCoordinate);
    if (steps < 2) {
      console.log("rd: GPSDevice -> animationTo -> step is less than 2, won't move.", steps);
      this._isAnimating = false;
      return;
    }
    this._animate(steps, 1, points, callBack);
  }

  _animate(steps, counter, arc, callBack) {
    // 更新Drawable坐标点
    this._modelDrawable.coordinate = arc[counter];
    this._mapSdk.updateDrawable(this._modelDrawable);
    this.updateScan({ coordinate: arc[counter] });

    // 下一个点
    // eslint-disable-next-line no-param-reassign
    counter += 1;

    // 看是否到最后一个点，不是则继续滑动.
    if (counter < steps) {
      requestAnimationFrame(this._animate.bind(this, steps, counter, arc, callBack));
    } else {
      this._isAnimating = false;
      this._coordinate = this._modelDrawable.coordinate;
      // console.log('rd: _animate -> this._coordinate,counter', this._coordinate, counter);
      if (callBack) {
        callBack();
      } else if (this._newCoordinate) {
        this._animationTo(this._newCoordinate);
      }
    }
  }

  _addRoute(drawableID, coordinates) {
    const zIndexLayerID = layerZIndexHelper.getLayerZIndex('line');
    this._mapSdk.map.addSource(`${drawableID}_routeSource`, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates,
        },
      },
      lineMetrics: true,
    });

    this._mapSdk.map.addLayer(
      {
        id: drawableID,
        type: 'line',
        source: `${drawableID}_routeSource`,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': 'green',
          'line-width': 3,
          'line-gradient': [
            'interpolate',
            ['linear'],
            ['line-progress'],
            0.5,
            '#3BFF57',
            1,
            '#6EFAFF',
          ],
        },
      },
      zIndexLayerID,
    );
  }
}

export default class GpsLayerHandler extends LayerHandlerBase {
  constructor({ mapSdk, gpsLayers }) {
    super({ mapSdk });
    this._mapSdk = mapSdk;
    this._gpsLayers = gpsLayers;
    this._gpsDeviceWrappers = [];
  }

  handle() {
    console.log('rd: GpsLayerHandler -> handle -> gpsLayers', this._gpsLayers);
    GpsDataService.addEventListener(EVENT_GPSDEVICE_ADDED, e => this._onGpsDevicesAdded(e));
    GpsDataService.addEventListener(EVENT_GPSDEVICE_REMOVED, e => this._onGpsDevicesRemoved(e));
    GpsDataService.addEventListener(EVENT_GPSDEVICE_UNDATED, e => this._onGpsDevicesUpdated(e));

    this._gpsDevices = GpsDataService.getGpsDevices();
    console.log('rd: handle -> this._gpsDevices', this._gpsDevices);
    this._gpsDevices.forEach((gpsDevice) => {
      const layer = find(this._gpsLayers, l => l._typeId === gpsDevice.typeId);
      console.log('rd: handle -> layer', layer);
      const wrapper = new GpsDeviceWrapper({ gpsDevice, mapSdk: this._mapSdk, layer });
      this._gpsDeviceWrappers.push(wrapper);
    });

    this._gpsLayers.forEach((layer) => {
      zoomShowController.register(layer, this._setVisibility.bind(this));
    });
  }

  _setVisibility(drawableID, visiable) {
    // console.log('rd: _setVisibility -> drawableID, visiable', drawableID, visiable);
    const layer = find(this._gpsLayers, l => l._id === drawableID);
    const devices = filter(this._gpsDeviceWrappers, l => l._layer === layer);
    devices.forEach((device) => {
      device.toggleShow(visiable);
    });
  }

  _onGpsDevicesAdded(gpsEvent) {
    console.log('rd: _onGpsDevicesAdded -> gpsEvent', gpsEvent);
    const { gpsDevice } = gpsEvent;
    if (find(this._gpsDeviceWrappers, w => w._gpsDevice._id === gpsDevice._id)) {
      return;
    }
    const layer = find(this._gpsLayers, l => l._typeId === gpsDevice.typeId);
    const wrapper = new GpsDeviceWrapper({ gpsDevice, mapSdk: this._mapSdk, layer });
    this._gpsDeviceWrappers.push(wrapper);
  }

  _onGpsDevicesRemoved(gpsEvent) {
    console.log('rd: _onGpsDevicesRemoved -> gpsEvent', gpsEvent);
    const { gpsDevice } = gpsEvent;
    const wrappers = remove(this._gpsDeviceWrappers, o => o._gpsDevice === gpsDevice);
    wrappers.forEach((wrapper) => {
      wrapper.remove();
    });
  }

  _onGpsDevicesUpdated(gpsEvent) {
    const { gpsDevice } = gpsEvent;
    const wrapper = find(this._gpsDeviceWrappers, o => o._gpsDevice === gpsDevice);
    if (wrapper) {
      wrapper.update(gpsDevice);
    }
  }
}
