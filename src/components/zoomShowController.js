class ZoomShowController {
  init(option) {
    const { map } = option;
    this._map = map;
    this._map.on('zoomend', (data) => {
      this.zoomend(data);
    });
    this._zoomShowElements = new Map();
  }

  // eslint-disable-next-line no-unused-vars
  zoomend(data) {
    // console.log('rd: ZoomShowController -> currentZoom:', this._map.getZoom());
    this._zoomShowElements.forEach((value, key) => {
      this.refreshVisibility(key);
    });
  }

  register(zoomShowElement, callback) {
    console.log('rd: ZoomShowController -> register -> zoomShowElement', zoomShowElement);
    // eslint-disable-next-line no-param-reassign
    zoomShowElement.ChangeCallback = this.refreshVisibility.bind(this);
    this._zoomShowElements.set(zoomShowElement, callback);
  }

  unRegister(zoomShowElementId) {
    console.log('rd: ZoomShowController -> unRegister -> zoomShowElementId', zoomShowElementId);
    let zoomShowElement;
    for (let index = 0; index < this._zoomShowElements.keys.length; index += 1) {
      const element = this._zoomShowElements.keys[index];
      if (element._id === zoomShowElementId) {
        zoomShowElement = element;
      }
    }
    if (!zoomShowElement) {
      this._zoomShowElements.delete(zoomShowElement);
    }
  }

  indicateVisibility(zoomShowElement) {
    const { isShow, minZoom, maxZoom } = zoomShowElement;
    if (!isShow) {
      return false;
    }
    const mapZoom = this._map.getZoom();
    return minZoom <= mapZoom && mapZoom <= maxZoom;
  }

  refreshVisibility(element) {
    const isShow = this.indicateVisibility(element);
    const callback = this._zoomShowElements.get(element);
    // // 当你有元素显隐问题时,开启下面一段日志有助于你分析
    // console.log('rd: ZoomShowController -> refreshVisibility -> element', {
    //   id: element._id,
    //   name: element.name,
    //   caculateIsShow: isShow,
    //   element,
    // });
    callback(element._id, isShow);
  }
}

export default new ZoomShowController();
