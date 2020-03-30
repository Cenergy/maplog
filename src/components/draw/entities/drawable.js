import ZoomShowElement from '../../zoomShowElement';

class Drawable extends ZoomShowElement {
  constructor(option) {
    super(option);
    this._option = option;
    this.topic = option.topic;
  }
}

export default Drawable;
