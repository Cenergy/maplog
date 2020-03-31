import calcSquare from '../../utils/calcSquare';

class RadarEffect {
  constructor(map) {
    this.map = map;
    this.radarEffectItems = [];
    this.timer = null;
  }

  startTimer() {
    if (this.radarEffectItems.length > 0 && this.timer == null) {
      console.info('rd: RadarEffect -> startTimer -> createTimer');
      this.timer = setInterval(() => {
        this.radarEffectItems.forEach((item) => {
          item.tick();
        });
      }, 100);
    }
  }

  stopTimer() {
    if (!this.timer) {
      console.info('rd: RadarEffect -> stopTimer -> destoryTimer');
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  addRadarEffect(radarEffectItem) {
    this.addRadarEffectCore(radarEffectItem);
  }

  addRadarEffectCore(radarEffectItem) {
    console.log('rd: RadarEffect -> addRadarEffectCore -> radarEffectItem', radarEffectItem.id);
    this.radarEffectItems.push(radarEffectItem);
    radarEffectItem.addToMap(this.map);
    this.startTimer();
  }

  removeRadarEffect(radarEffectItem) {
    this.radarEffectItems.pop(radarEffectItem);
    radarEffectItem.removeFromMap();
    if (this.radarEffectItems.length === 0) {
      this.stopTimer();
    }
  }
}

// let option = {
//  distance: 0,
//  level: 0,
//  coordinate: [0, 0],
//  frameCount: 10,
//  urlPrifix: `http://localhost:8080/StaticData/Images/radarEffect/green`,
// };
class RadarEffectItem {
  constructor(id, option) {
    this.id = id;
    this.distance = option.distance;
    this.level = option.level;
    this.coordinate = option.coordinate;
    this.frameCount = option.frameCount;
    this.currentImage = this.getRandomInt(1, option.frameCount - 1);
    this.layerSourceName = `radar_source_${id}`;
    this.layerName = `radar_layer_${id}`;
    this.urlPrifix = option.urlPrifix;
    this.map = null;
  }

  updateCoordinate(distance, coordinate) {
    this.distance = distance;
    this.coordinate = coordinate;
    const coor = calcSquare(this.distance, this.coordinate);
    // console.log(this.map.getSource(this.layerSourceName));
    this.map.getSource(this.layerSourceName).setCoordinates(coor);
  }

  // eslint-disable-next-line class-methods-use-this
  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getPath(index) {
    const path = `${this.urlPrifix}/${index}.png`;
    return path;
  }

  addToMap(map) {
    this.map = map;
    const coor = calcSquare(this.distance, this.coordinate);
    console.log('rd: RadarEffectItem -> addToMap -> coor', coor);
    map.addSource(this.layerSourceName, {
      type: 'image',
      url: this.getPath(this.currentImage),
      coordinates: coor,
    });
    map.addLayer({
      id: this.layerName,
      type: 'raster',
      source: this.layerSourceName,
      paint: {
        'raster-fade-duration': 0,
      },
    });
  }

  removeFromMap() {
    this.map.removeLayer(this.layerName);
    this.map.removeSource(this.layerSourceName);
  }

  tick() {
    // console.log('rd: RadarEffectItem -> tick -> id', this.id);
    this.currentImage = (this.currentImage % this.frameCount) + 1;
    this.map.getSource(this.layerSourceName).updateImage({ url: this.getPath(this.currentImage) });
  }
}

export { RadarEffect, RadarEffectItem };
