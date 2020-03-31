import IdName from './idName';

const MAXZOOM = 22;
const MINZOOM = 1;
const DEFAULT_MINZOOM = 8;
const DEFAULT_MAXZOOM = 22;

export default class ZoomShowElement extends IdName {
  constructor(option) {
    super(option);
    const { isShow, minZoom, maxZoom } = option;
    this._isShow = isShow || true;
    this._minZoom = minZoom || DEFAULT_MINZOOM;
    this._maxZoom = maxZoom || DEFAULT_MAXZOOM;
    this._changCallback = null;
  }

  _onChangeCallback() {
    if (this._changCallback) {
      this._changCallback(this);
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

  get isShow() {
    return this._isShow;
  }

  set isShow(value) {
    if (typeof value === 'boolean' && this._isShow !== value) {
      this._isShow = value;
      this._onChangeCallback();
    }
  }

  get minZoom() {
    return this._minZoom;
  }

  set minZoom(value) {
    if (typeof value === 'number' && this._minZoom !== value) {
      if (value >= this.maxZoom) {
        throw new Error('minZoom is less than maxZoom');
      }
      if (value < MINZOOM) {
        throw new Error(`minZoom must greater than ${MINZOOM}`);
      }
      this._minZoom = value;
      this._onChangeCallback();
    }
  }

  get maxZoom() {
    return this._maxZoom;
  }

  set maxZoom(value) {
    if (typeof value === 'number' && this._maxZoom !== value) {
      if (value <= this.minZoom) {
        throw new Error('maxZoom must greater than minZoom');
      }
      if (value > MAXZOOM) {
        throw new Error(`maxZoom must less than ${MAXZOOM}`);
      }
      this._maxZoom = value;
      this._onChangeCallback();
    }
  }
}
