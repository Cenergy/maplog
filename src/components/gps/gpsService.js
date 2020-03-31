import GPSDevice from './gpsDevice';

class GPSService {
  async init(option) {
    const { dataService, map } = option;
    this._dataServer = dataService.dataServer;
    this._map = map;
    this._relations = [];
    this._timer = null;
  }

  async addGPSLayer(drawable) {
    console.log('rd: GPSService -> addGPSLayer -> drawable', drawable);
    const {
      _id,
      _userID,
      _typeID,
      _isShow,
      _showScan,
      _scanRadius,
      _canDrawRoute,
      coordinate,
    } = drawable;

    const gps = new GPSDevice(this._map, {
      id: _id,
      userID: _userID,
      coordinate,
      typeID: _typeID,
      isShow: _isShow,
      showScan: _showScan,
      scanRadius: _scanRadius,
      canDrawRoute: _canDrawRoute,
      scanUrl: `http://${this._dataServer.ip}:${this._dataServer.port}/images/radarEffect/gps`,
    });

    const realtion = {
      id: _id,
      drawableItem: drawable,
      gpsDevice: gps,
    };

    this._relations.push(realtion);
    this._runScanAnimation();
    return drawable._id;
  }

  updateGPSLayer(drawable) {
    const relation = this._relations.find(item => item.id === drawable._id);
    if (relation) {
      const gps = relation.gpsDevice.updateOnMap(drawable);
      relation.gpsDevice = gps;
      relation.drawableItem = drawable;
    }
  }

  removeGPSLayer(drawableID) {
    console.log('rd: GPSService -> removeGPSLayer -> drawableID', drawableID);
    if (this._relations.length < 1) {
      return;
    }

    const relation = this._relations.find(item => item.id === drawableID);
    if (relation === null) {
      return;
    }

    relation.gpsDevice.removeFromMap();
    const index = this._relations.indexOf(relation);
    if (index > -1) {
      this._relations.splice(index, 1);
      if (this._relations.length < 1) {
        cancelAnimationFrame(this._timer);
      }
    }
  }

  setGPSVisibility(currentZoom) {
    this._relations.forEach((relation) => {
      const { drawableItem, gpsDevice } = relation;
      const {
        _id, _isShow, _minZoom, _maxZoom,
      } = drawableItem;
      if (!_isShow) {
        gpsDevice.setVisibility('none');
      } else {
        const visiable = this._map.getLayoutProperty(_id, 'visibility');
        if (currentZoom >= _maxZoom || currentZoom <= _minZoom) {
          if (visiable === 'visible') {
            gpsDevice.setVisibility('none');
          }
        } else if (visiable === 'none') {
          gpsDevice.setVisibility('visible');
        }
      }
    });
  }

  _runScanAnimation() {
    this._relations.forEach((relation) => {
      const { radarEffectItem } = relation.gpsDevice;
      radarEffectItem.tick();
    });
  }
}

export default new GPSService();
