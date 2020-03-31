import * as turf from '@turf/turf';
import { RadarEffect, RadarEffectItem } from '../radar/radarEffect';

/**
 * 代表一个Gps设备实体
 * @class GpsDevice
 * @param {mapboxgl.Map} map 地图
 * @param {Object} gpsDeviceInfo gps信息
 * @param {String} options.id Required.
 * @param {String} options.name Required.
 * @param {String} options.type Required, 代表Gps设备类型，通过该属性来决定呈现样式，gps-person、gps-car.
 * @param {LnglatLike} options.coordinate Required，Gps初始位置.
 * @example
 * var gpsDevice = new GpsDevice(map,
 * { id: '40020000187', name: 'gpsDevice01', type: 'gps-person', coordinate: [113.23, 26.233] });
 * gpsDevice.showOnMap();
 * @return {GpsDevice} `this`
 *
 */
class GpsDevice {
  constructor(map, gpsDeviceInfo) {
    this.map = map;
    this.gpsDeviceInfo = gpsDeviceInfo;
    this.isShowOnMap = false;
    this.sourcePointName = `gps-source-${gpsDeviceInfo.id}`;
    this.layerPointName = `gps-layer-${gpsDeviceInfo.id}`;
    this.isAnimating = false;
    this.newCoordinate = null;
    this.radarEffect = new RadarEffect(map);
    this.radarEffectItem = null;
    this.affectRadius = 300;

    // 用GPS设备的数据源
    this.point = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: gpsDeviceInfo.coordinate,
          },
        },
      ],
    };
  }

  showOnMap() {
    if (this.isShowOnMap) {
      return;
    }

    this.map.addSource(this.sourcePointName, {
      type: 'geojson',
      data: this.point,
    });
    this.map.addLayer({
      id: this.layerPointName,
      source: this.sourcePointName,
      type: 'symbol',
      layout: {
        'icon-image': 'airport-15', // this.gpsDeviceInfo.type,
        'icon-rotate': ['get', 'bearing'],
        'icon-rotation-alignment': 'map',
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
        'icon-size': 1,
      },
    });
    this.isShowOnMap = true;
  }

  hideOnMap() {
    if (!this.isShowOnMap) {
      return;
    }
    this.closeScan();
  }

  // eslint-disable-next-line class-methods-use-this
  removeFromMap() {}

  animationTo(newCoordinate, callBack) {
    const oldPoint = turf.point(this.gpsDeviceInfo.coordinate);
    const newPoint = turf.point(newCoordinate);
    console.log('rd: GpsDevice -> animationTo -> old', oldPoint.geometry.coordinates);
    console.log('rd: GpsDevice -> animationTo -> newPoint', newPoint.geometry.coordinates);
    if (turf.booleanEqual(oldPoint, newPoint)) {
      console.log(
        "rd: GpsDevice -> animationTo -> newCoordinate is equal old, won't move.",
        newCoordinate,
      );
      return;
    }

    // 判断是否正在运行中
    if (this.isAnimating) {
      this.newCoordinate = newCoordinate;
      return;
    }
    this.newCoordinate = null;
    this.isAnimating = true;


    // console.log('rd: GpsDevice -> animationTo -> newCoordinate', newCoordinate);
    // 用来缓存切割的点
    const arc = [];

    const line = turf.lineString([this.gpsDeviceInfo.coordinate, newCoordinate]);
    console.log('rd: GpsDevice -> animationTo -> line', line);

    // 先计算当前点与目标点距离
    const lineDistance = turf.length(line);

    // 值越大则动画越平滑 暂定为1KM20个点
    const steps = lineDistance * 500;

    console.log('rd: GpsDevice -> animationTo -> lineDistance', lineDistance);

    const offset = lineDistance / steps;
    for (let i = 0; i < lineDistance; i += offset) {
      const segment = turf.along(line, i);
      // console.log('rd: GpsDevice -> animationTo -> segment', i, segment.geometry.coordinates);
      arc.push(segment.geometry.coordinates);
    }
    this.animate(steps, 1, arc, callBack);
  }

  animate(steps, counter, arc, callBack) {
    // console.log('rd: GpsDevice -> animate -> steps', steps, counter, arc[counter]);

    // 计算角度.
    this.point.features[0].properties.bearing = turf.bearing(
      turf.point(arc[counter - 1]),
      turf.point(arc[counter]),
    );
    // 赋值坐标点
    this.point.features[0].geometry.coordinates = arc[counter];
    this.map.getSource(this.sourcePointName).setData(this.point);
    this.updateScan(arc[counter]);

    // 下一个点
    // eslint-disable-next-line no-param-reassign
    counter += 1;

    // 看是否到最后一个点，不是则继续滑动.
    if (counter < steps) {
      requestAnimationFrame(this.animate.bind(this, steps, counter, arc, callBack));
    } else {
      console.log('rd: GpsDevice -> animate -> end:counter:', counter);
      this.isAnimating = false;
      this.gpsDeviceInfo.coordinate = this.point.features[0].geometry.coordinates;
      if (callBack) {
        callBack();
      } else if (this.newCoordinate) {
        this.animationTo(this.newCoordinate);
      }
    }
  }

  updateScan(newCoordinate) {
    if (this.radarEffectItem) {
      this.radarEffectItem.updateCoordinate(this.affectRadius / 1000, newCoordinate);
    }
  }

  openScan(radio) {
    console.log('rd: GpsDevice -> openScan -> radio', this.gpsDeviceInfo.id, radio);
    if (this.radarEffectItem) {
      return;
    }
    this.radarEffectItem = new RadarEffectItem(`gps${this.gpsDeviceInfo.id}`, {
      distance: this.affectRadius / 1000,
      coordinate: this.gpsDeviceInfo.coordinate,
      frameCount: 31,
      urlPrifix: 'http://localhost:8080/StaticData/Images/radarEffect/gps',
    });
    this.radarEffect.addRadarEffect(this.radarEffectItem);
  }

  closeScan() {
    console.log('rd: GpsDevice -> closeScan -> closeScan', this.gpsDeviceInfo.id);
    if (!this.radarEffectItem) {
      return;
    }
    this.radarEffect.removeRadarEffect(this.radarEffectItem);
    this.radarEffectItem = null;
  }
}

export default GpsDevice;
