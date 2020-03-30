import { Threebox, THREE } from '@rdapp/threebox';
import HandlerBase from './handlerBase';
import tbService from '../../../services/tbService';

// @ts-ignore
window.Threebox = Threebox;
// @ts-ignore
window.THREE = THREE;

class SpriteTextWrapper {
  constructor(map, drawable) {
    this._map = map;
    this.drawable = drawable;
    this.cache = {
      coordinate: drawable.coordinate,
      isShow: drawable.isShow,
      isRemove: false,
      text: drawable.text,
      textcolor: drawable.textcolor,
      height: drawable.height,
      font: drawable.font,
      textWidth: drawable.textWidth,
      textHeight: drawable.textHeight,
    };
    this.hasDrawed = false;
    this.type = drawable.constructor.name;
    this._template = null;
  }

  draw() {
    const { text } = this.cache;
    const { textcolor } = this.cache;
    const { height } = this.cache;
    const { coordinate } = this.cache;
    const { font } = this.cache;
    const { textWidth, textHeight } = this.cache;

    const textMaterial = new THREE.SpriteMaterial({
      map: this.createTextTexture({
        text,
        color: textcolor,
        font,
        textWidth,
        textHeight,
      }),
      opacity: 0.8,
      transparent: true,
      // sizeAttenuation: true, THREE.SpriteMaterial: 'sizeAttenuation' is not a property of this material.
    });
    const particle = new THREE.Sprite(textMaterial);
    particle.center = new THREE.Vector2(0.5, 0.5);
    particle.scale.set(25, 8, 10);
    particle.position.y = height;

    const group = new THREE.Group();
    group.add(particle);

    this._template = tbService.tb
      .Object3D({ obj: group })
      .setCoords(coordinate)
      .rotateX(Math.PI / 2);
    tbService.tb.add(this._template);
    this.hasDrawed = true;

    particle.position.y = height;
    // function animate(timestamp) {
    //   const scale = Math.sin(timestamp / 500) / 10 + 1;
    //   const positionY = height * scale;
    //   particle.position.y = positionY;
    //   tbService.tb.map.repaint = true;
    //   requestAnimationFrame(animate);
    // }

    // animate();
  }

  createTextTexture(obj) {
    const canvas = document.createElement('canvas');
    // warning THREE.WebGLRenderer: image is not power of two (1000x300). Resized to 512x256
    canvas.width = obj.textWidth || 1024;
    canvas.height = obj.textHeight || 256;
    const ctx = canvas.getContext('2d');
    ctx.font = obj.font || 'Bold 50px Arial';
    ctx.fillStyle = obj.color || '#f00';
    ctx.textAlign = 'center'; // 设置文本的水平对齐方式
    ctx.textBaseline = 'bottom'; // 设置文本的垂直对齐方式
    ctx.fillText(obj.text, canvas.width / 2, canvas.height / 2, 4096);
    const texture = new THREE.Texture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;

    return texture;
  }

  toggleShow(isShow) {
    if (!this.hasDrawed) {
      this.cache.isShow = isShow;
      return;
    }
    this._template.visible = isShow;
    this._map.repaint = true;
  }

  update() {
    const newCoordinate = this.drawable.coordinate;
    if (!this.hasDrawed) {
      this.cache.coordinate = newCoordinate;
      return;
    }
    this._template.setCoords(newCoordinate);
    this._map.repaint = true;
    this.cache.coordinate = newCoordinate;
  }

  remove() {
    if (!this.hasDrawed) {
      this.cache.isRemove = true;
      return;
    }
    tbService.tb.remove(this._template);
    this._map.repaint = true;
  }
}

export default class SpriteTextHandler extends HandlerBase {
  _addCore(drawable) {
    const wrapper = new SpriteTextWrapper(this._map, drawable);
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

  show(drawable, e) {
    const selectedFeature = tbService.tb.queryRenderedFeatures(e.point)[0];
    if (!selectedFeature) return null;
    const selectedFeatureUserData = selectedFeature.object.parent.userData;
    if (selectedFeatureUserData.type !== drawable.constructor.name) return null;
    return selectedFeatureUserData;
  }

  async _setVisibility(drawableID, visiable) {
    const wrapper = this._drawableRelation.get(drawableID);
    if (wrapper) {
      wrapper.toggleShow(visiable);
    }
  }
}
