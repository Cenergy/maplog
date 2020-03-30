/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
import { Threebox, THREE } from '@rdapp/threebox';
import * as turf from '@turf/turf';
import HandlerBase from './handlerBase';
import tbService from '../../../services/tbService';

// @ts-ignore
window.Threebox = Threebox;
// @ts-ignore
window.THREE = THREE;

class FlyPointWrapper {
  constructor(map, drawable) {
    this._map = map;
    this.drawable = drawable;
    this.cache = {
      isShow: drawable.isShow,
      isRemove: false,

      bbox: drawable.bbox,
      number: drawable.number,
      color: drawable.color,
    };
    this.hasDrawed = false;
    this._flyPointTemplate = null;

    this.pointsGroup = [];
  }

  draw() {
    const points = turf.randomPoint(this.cache.number, {
      bbox: this.cache.bbox,
    });
    points.features.forEach((point) => {
      this.pointFly(point.geometry.coordinates);
    });
  }

  pointFly(position) {
    const sphereRadius = 0.2;
    const segment = 32;
    const cylinderHeight = 2;
    const cylinderTopRadius = 0.1;
    const cylinderBottomRadius = 0;

    const group = new THREE.Group();
    const cylinderMaterial = new THREE.MeshBasicMaterial({
      blending: THREE.NormalBlending,
      transparent: true,
      color: this.cache.color,
      opacity: 0.5,
    });
    const sphereMaterial = new THREE.MeshLambertMaterial({
      color: this.cache.color,
      transparent: true,
      opacity: 0.5,
    });
    const sphereGeometry = new THREE.SphereGeometry(sphereRadius, segment, segment);
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphereMesh.position.y = cylinderHeight + sphereRadius;

    const cylinderGeometry = new THREE.CylinderGeometry(
      cylinderTopRadius,
      cylinderBottomRadius,
      cylinderHeight,
      segment,
      segment,
    );
    const cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinderMesh.position.y = cylinderHeight / 2;

    group.add(sphereMesh);
    group.add(cylinderMesh);

    const flyPoint = tbService.tb
      .Object3D({ obj: group })
      .setCoords(position)
      .rotateX(Math.PI / 2);
    tbService.tb.add(flyPoint);

    this.pointsGroup.push(group);

    function animate() {
      if (flyPoint.position.z > 300) {
        flyPoint.position.z = 0;
      }
      const step = Math.random() * 3;
      flyPoint.position.z += step;
      tbService.tb.map.repaint = true;
      requestAnimationFrame(animate);
    }
    animate();
  }

  toggleShow(isShow) {
    if (!this.hasDrawed) {
      this.cache.isShow = isShow;
      return;
    }
    this._flyPointTemplate.visible = isShow;
    this._map.repaint = true;
  }
}

export default class FlyPointHandler extends HandlerBase {
  _addCore(drawable) {
    const wrapper = new FlyPointWrapper(this._map, drawable);
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
