import { Threebox, THREE } from '@rdapp/threebox';
import mapboxgl from 'mapbox-gl';
import HandlerBase from './handlerBase';
import jsonToHtml from '../../../utils/jsonToHtml';
import tbService from '../../../services/tbService';

// @ts-ignore
window.Threebox = Threebox;
// @ts-ignore
window.THREE = THREE;

class ThreeTextWrapper {
  constructor(map, drawable) {
    this._map = map;
    this.drawable = drawable;
    this.cache = {
      coordinate: drawable.coordinate,
      isShow: drawable.isShow,
      isRemove: false,
      text: drawable.text,
      color: drawable.color,
      opacity: drawable.opacity,
      size: drawable.size,
      width: drawable.width,
      height: drawable.height,
      positionX: drawable.positionX,
      positionY: drawable.positionY,
    };
    this.hasDrawed = false;
    this.type = drawable.constructor.name;
    this.popup = null;
    this._threeTextTemplate = null;
  }

  draw() {
    const { coordinate } = this.cache;
    const { text } = this.cache;
    const { color } = this.cache;
    const { opacity } = this.cache;
    const { size } = this.cache;
    const { width } = this.cache;
    const { height } = this.cache;
    const { positionX } = this.cache;
    const { positionY } = this.cache;

    let group;
    const loader = new THREE.FontLoader();
    loader.load('http://10.8.9.64:3038/commondata/SimHei_Regular.json', (font) => {
      const geometry = new THREE.TextBufferGeometry(text, {
        font,
        size,
        height,
        width,
      });
      const textMaterial = new THREE.MeshBasicMaterial({
        blending: THREE.NormalBlending,
        color,
        transparent: true,
        opacity,
        side: THREE.DoubleSide,
        needsUpdate: true,
      });
      const textMesh = new THREE.Mesh(geometry, textMaterial);
      textMesh.position.y = positionY;
      textMesh.position.x = positionX;

      textMesh.userData = this;
      group = new THREE.Group();
      group.add(textMesh);

      this._threeTextTemplate = tbService.tb
        .Object3D({ obj: group })
        .setCoords(coordinate)
        .rotateX(Math.PI / 2)
        .rotateY(Math.PI);
      tbService.tb.add(this._threeTextTemplate);

      this.hasDrawed = true;
    });
  }

  toggleShow(isShow) {
    if (!this.hasDrawed) {
      this.cache.isShow = isShow;
      return;
    }
    if (tbService.popup) {
      if (!isShow || !tbService.showPopup) {
        tbService.popup.remove();
      } else if (tbService.popup.isOpen() === false) tbService.popup.addTo(tbService._map);
    }
    this._threeTextTemplate.visible = isShow;
    this._map.repaint = true;
  }

  update() {
    const newCoordinate = this.drawable.coordinate;
    if (!this.hasDrawed) {
      this.cache.coordinate = newCoordinate;
      return;
    }
    this._threeTextTemplate.setCoords(newCoordinate);
    this._map.repaint = true;
    this.cache.coordinate = newCoordinate;
  }

  remove() {
    if (!this.hasDrawed) {
      this.cache.isRemove = true;
      return;
    }
    tbService.tb.remove(this._threeTextTemplate);
    this._map.repaint = true;
  }
}

export default class ThreeTextHandler extends HandlerBase {
  _addCore(drawable) {
    const wrapper = new ThreeTextWrapper(this._map, drawable);
    wrapper.draw();
    return wrapper;
  }

  async _updateCore(drawable) {
    const wrapper = this._drawableRelation.get(drawable._id);
    if (wrapper) {
      wrapper.update();
    }
  }

  _removeCore(drawableID) {
    const realDrawable = this._drawableRelation.get(drawableID);
    if (!realDrawable) {
      return;
    }
    realDrawable.remove();
  }

  show(drawable, e, popUp = false) {
    const selectedFeature = tbService.tb.queryRenderedFeatures(e.point)[0];
    const self = this;
    // console.log('go: ThreeTextHandler -> show -> e.point', e);
    if (!selectedFeature) {
      tbService.showPopup = false;
      tbService.removeEventListener('TbLayerRender', self._popUpShow);
      return null;
    }
    const selectedFeatureUserData = selectedFeature.object.userData;
    if (selectedFeatureUserData.type !== drawable.constructor.name) {
      tbService.showPopup = false;
      tbService.removeEventListener('TbLayerRender', self._popUpShow);
      return null;
    }
    if (popUp) {
      tbService.showPopup = true;
      tbService.popup = new mapboxgl.Popup({
        offset: drawable.height * 7 + 55,
        anchor: 'bottom',
      })

        .setLngLat(selectedFeatureUserData.drawable.coordinate)
        .setHTML(jsonToHtml(selectedFeatureUserData.drawable))
        .addTo(tbService._map);
      tbService.addEventListener('TbLayerRender', self._popUpShow);
      return null;
    }

    return selectedFeatureUserData;
  }

  async _setVisibility(drawableID, visiable) {
    const wrapper = this._drawableRelation.get(drawableID);
    if (wrapper) {
      wrapper.toggleShow(visiable);
    }
  }

  _popUpShow() {
    if (this.popup) {
      const coffient = 2 ** (this._map.getZoom() - 16);
      this.popup.options.offset = coffient * 65;
    }
  }
}
