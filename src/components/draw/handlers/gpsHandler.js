import HandlerBase from './handlerBase';

export default class GPSHandler extends HandlerBase {
  constructor(option) {
    super(option);
    const { gpsService } = option;
    this._gpsService = gpsService;
  }

  add(drawable) {
    console.log('rd: GPSHandler -> add -> drawable', drawable);
    return this._gpsService.addGPSLayer(drawable);
  }

  update(drawable) {
    console.log('rd: GPSHandler -> update -> drawable', drawable);
    this._gpsService.updateGPSLayer(drawable);
  }

  remove(drawableID) {
    console.log('rd: GPSHandler -> remove -> drawableID', drawableID);
    this._gpsService.removeGPSLayer(drawableID);
  }

  _setMarkersVisibility() {
    this._gpsService.setGPSVisibility(this._currentZoom);
  }
}
