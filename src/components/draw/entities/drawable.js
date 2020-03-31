import uuidv1 from 'uuid/v1';

class drawable {
  constructor({ name, minZoom, maxZoom }) {
    this._id = uuidv1();
    console.log('rd: drawable -> constructor -> _id', this._id);
    this._name = name;
    this._minZoom = minZoom;
    this._maxZoom = maxZoom;
  }
}

export default drawable;
