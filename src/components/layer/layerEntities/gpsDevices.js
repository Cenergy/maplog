// @ts-nocheck
import { HasCoordinate } from '../../mixin';
import IdName from '../../idName';

export default class GpsDevice extends IdName {
  constructor({
    id, name, coordinate, typeId, _route,
  }) {
    super({ id, name });
    this.route = _route;
    this.typeId = typeId;
    Object.assign(this, new HasCoordinate({ coordinate }));
  }

  _onChangeCallback() {
    if (this._changCallback) {
      this._changCallback(this);
    }
  }

  _onShowTrackChangeCallback() {
    if (this._showTrackChangeCallback) {
      this._showTrackChangeCallback(this);
    }
  }

  set ChangeCallback(value) {
    if (value && typeof value === 'function') {
      this._changCallback = value;
      this._changCallback.bind(this);
    } else {
      throw new Error('Invalid changeCallback.');
    }
  }

  set ShowTrackChangeCallback(value) {
    if (value && typeof value === 'function') {
      this._showTrackChangeCallback = value;
      this._showTrackChangeCallback.bind(this);
    } else {
      throw new Error('Invalid showTrackChangeCallback.');
    }
  }

  get IsOpenScan() {
    return this._isOpenScan;
  }

  set IsOpenScan(value) {
    if (this._isOpenScan === value) {
      return;
    }
    this._isOpenScan = value;
    this._onChangeCallback();
  }

  get IsShowTrack() {
    return this._isShowTrack;
  }

  set IsShowTrack(value) {
    if (this._isShowTrack === value) {
      return;
    }
    this._isShowTrack = value;
    this._showTrackChangeCallback();
  }
}
