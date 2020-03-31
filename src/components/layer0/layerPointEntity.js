class PositionMarker {
  constructor(baseOption) {
    const {
      id, name, typeID, lat, lng,
    } = baseOption;
    this._id = id;
    this._name = name;
    this._typeID = typeID;
    this._lat = lat;
    this._lng = lng;
  }
}

class GPSMarker extends PositionMarker {
  constructor(option) {
    super(option);
    const { plugin, pluginName, number } = option;
    this._plugin = plugin;
    this._pluginName = pluginName;
    this._phoneNumber = number;
  }
}

class PhoneMarker extends PositionMarker {
  constructor(option) {
    super(option);
    const { number } = option;
    this._number = number;
  }
}

class CameraMarker extends PositionMarker {
  constructor(option) {
    super(option);
    const { platform } = option;
    this._platform = platform;
  }
}

class FacilityMarker extends PositionMarker {
  constructor(option) {
    super(option);
    const { description, extension } = option;
    this._description = description;
    this._extention = extension;
  }
}

class MultiMediaTransferMarker extends PositionMarker {}

export default {
  PositionMarker,
  GPSMarker,
  PhoneMarker,
  CameraMarker,
  FacilityMarker,
  MultiMediaTransferMarker,
};
