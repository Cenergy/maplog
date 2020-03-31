import { Threebox, THREE } from '@rdapp/threebox';
import mapboxgl from 'mapbox-gl';
import HandlerBase from './handlerBase';
import shadeService from '../../../services/shadeService';
import loadStyle from '../../../utils/loadCssStyle';

// @ts-ignore
window.Threebox = Threebox;
// @ts-ignore
window.THREE = THREE;

const VERTEXSHADER = `varying vec3 vNormal;
varying vec3 vPositionNormal;
void main()
{
  vNormal = normalize( normalMatrix * normal );
  vPositionNormal = normalize(( modelViewMatrix * vec4(position, 1.0) ).xyz);
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;
const FRAGMENTSHADER = `uniform vec3 glowColor;
uniform float b;
uniform float p;
uniform float s;
varying vec3 vNormal;
varying vec3 vPositionNormal;
void main()
{
  float a = pow( b + s * abs(dot(vNormal, vPositionNormal)), p );
  gl_FragColor = vec4( glowColor, a );
}`;

const SHADE_POPUP_CSS = '.shadePopup .mapboxgl-popup-content{background: none;padding:0;color:white;} .shadePopup .mapboxgl-popup-tip {border-top-color: green;}';
loadStyle.loadCssStyle(SHADE_POPUP_CSS);

class ShadeWapper {
  constructor(map, drawable) {
    console.log('go: ShadeWapper -> constructor -> drawable', drawable);
    this._map = map;
    this.drawable = drawable;
    this.cache = {
      coordinate: drawable.coordinate,
      isShow: drawable.isShow,
      isRemove: false,
    };
    this.hasDrawed = false;
    this._shadeTemplate = null;
    this.shade = -1.8;
    this.customMaterial = null;
    this.currentIndex = 0;
    this.popup = null;
  }

  draw() {
    if (this.cache.isRemove) {
      return;
    }
    if (this.drawable.type === 'box') {
      this._drawBox();
    }
    if (this.drawable.type === 'sphere') {
      this._drawSphere();
    }
  }

  update() {
    const newCoordinate = this.drawable.coordinate;
    if (!this.hasDrawed) {
      this.cache.coordinate = newCoordinate;
      return;
    }
    this._shadeTemplate.setCoords(newCoordinate);
    if (this.drawable.title !== '' && this.drawable.type === 'sphere') {
      this.popup.setLngLat(newCoordinate);
    }
    this._map.repaint = true;
    this.cache.coordinate = newCoordinate;
  }

  remove() {
    if (!this.hasDrawed) {
      this.cache.isRemove = true;
      return;
    }
    shadeService.tb.remove(this._shadeTemplate);
    if (this.drawable.title !== '' && this.drawable.type === 'sphere') {
      this.popup.remove();
    }
    this._map.repaint = true;
  }

  toggleShow(isShow) {
    if (!this.hasDrawed) {
      this.cache.isShow = isShow;
      return;
    }
    this._shadeTemplate.visible = isShow;
    // popup的显示与隐藏
    if (this.popup) {
      if (!isShow) {
        this.popup.remove();
      } else if (this.popup.isOpen() === false) this.popup.addTo(this._map);
    }

    this._map.repaint = true;
  }

  _drawBox() {
    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const cubeMaterial = new THREE.MeshLambertMaterial({ color: '#00CCFF' });
    const shadeObj = new THREE.Mesh(geometry, cubeMaterial);
    const group = new THREE.Group();
    group.add(shadeObj);
    this._shadeTemplate = shadeService.tb.Object3D({ obj: group }).setCoords(this.cache.coordinate);
    shadeService.tb.add(this._shadeTemplate);

    if (!this.cache.isShow) {
      this._shadeTemplate.visible = false;
    }
    const shadeLayer = this._map.getLayer('SHADE_LAYER_ID');
    shadeLayer.implementation.render = () => {
      if (shadeService.tb) {
        shadeService.tb.update();
      }
    };
    // shadeObj.position.set(0.25, 0, -0.25);
    shadeObj.rotation.z -= Math.PI * 0.25;
    shadeObj.rotation.x += Math.PI * 0.25;
    this._map.triggerRepaint();
    this.hasDrawed = true;
    const self = this;
    function _rotationAroundAxis() {
      group.rotation.z += 0.01;
      self._map.repaint = true;
      requestAnimationFrame(_rotationAroundAxis);
    }
    _rotationAroundAxis();
  }

  _drawSphere() {
    const geometry = new THREE.SphereBufferGeometry(2, 50, 50, 0, Math.PI);
    const material = this._getMaterial('green');
    const shadeObj = new THREE.Mesh(geometry, material);
    this._shadeTemplate = shadeService.tb
      .Object3D({ obj: shadeObj })
      .setCoords(this.cache.coordinate);

    shadeService.tb.add(this._shadeTemplate);
    if (!this.cache.isShow) {
      this._shadeTemplate.visible = false;
    }
    if (this.drawable.title !== '') {
      const coffient = 2 ** (this._map.getZoom() - 16);
      this.popup = new mapboxgl.Popup({
        closeOnClick: false,
        closeButton: false,
        anchor: 'bottom',
        className: 'shadePopup',
        offset: coffient * 80,
      })
        .setLngLat(this.drawable.coordinate)
        .setHTML(`<b style="font-size:14px">${this.drawable.title}</b>`)
        .addTo(this._map);
    }
    const shadeLayer = this._map.getLayer('SHADE_LAYER_ID');
    shadeLayer.implementation.render = () => {
      if (shadeService.tb) {
        shadeService.tb.update();
        if (this.drawable.title !== '') {
          const coffient = 2 ** (this._map.getZoom() - 16);
          this.popup.options.offset = coffient * 80;
        }
      }
    };
    this._animateShade();
    this._map.triggerRepaint();
    this.hasDrawed = true;
  }

  _getMaterial(color = 'green') {
    if (this.customMaterial) {
      return this.customMaterial;
    }
    this.customMaterial = new THREE.ShaderMaterial({
      uniforms: {
        s: { type: 'f', value: this.shade },
        b: { type: 'f', value: 1.0 },
        p: { type: 'f', value: 2.0 },
        glowColor: { type: 'c', value: new THREE.Color(color) },
      },
      vertexShader: VERTEXSHADER,
      fragmentShader: FRAGMENTSHADER,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      // wireframe: true,
    });
    return this.customMaterial;
  }

  _animateShade() {
    this.customMaterial.needsUpdate = true;
    if (this.currentIndex > Math.PI) {
      this.currentIndex = 0;
    }
    this.currentIndex += 0.01;
    this.shade = Math.sin(this.currentIndex) - 1.8; // 是shade在[-1.8,-0.8] 之间
    this.customMaterial.uniforms.s.value = this.shade;
    requestAnimationFrame(this._animateShade.bind(this));
  }
}

export default class ShadeHandler extends HandlerBase {
  _addCore(drawable) {
    console.log('go: ThreeJsModelHandler -> _addCore -> drawable', drawable);
    const wrapper = new ShadeWapper(this._map, drawable);
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

  async _setVisibility(drawableID, visiable) {
    const wrapper = this._drawableRelation.get(drawableID);
    if (wrapper) {
      wrapper.toggleShow(visiable);
    }
  }
}
