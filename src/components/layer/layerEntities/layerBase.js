import ZoomShowElement from '../../zoomShowElement';

export default class LayerBase extends ZoomShowElement {
  constructor(option) {
    super(option);
    this._typeId = option.typeID;
    this._option = option;
  }

  get typeId() {
    return this._typeId;
  }
}
