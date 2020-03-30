import { Threebox, THREE } from '@rdapp/threebox';
import mapboxgl from 'mapbox-gl';
import HandlerBase from './handlerBase';
import jsonToHtml from '../../../utils/jsonToHtml';
import tbService from '../../../services/tbService';
import mathUtils from "../../../utils/mathUtils";
import eventAggregator from '../../pubsubRelated/mapEventAggregator';
import { BALLOON_DRAWABLE_TYPE } from '../../drawableTypeKey';
import eventTopics from '../../pubsubRelated/eventTopic';

// @ts-ignore
window.Threebox = Threebox;
// @ts-ignore
window.THREE = THREE;

class BalloonWrapper {
  constructor(map, drawable) {
    this._map = map;
    this.drawable = drawable;
    this.cache = {
      coordinate: drawable.coordinate,
      isShow: drawable.isShow,
      isRemove: false,
      insideIcon: drawable.insideIcon,
      insideRadius: drawable.insideRadius,
      cylinderColor: drawable.cylinderColor,
      cylinderHeight: drawable.cylinderHeight,
      cylinderRadius: drawable.cylinderRadius,
    };
    this.hasDrawed = false;
    this.type = drawable.constructor.name;
    this._balloonTemplate = null;
  }

  draw() {
    const { cylinderHeight } = this.cache;
    const { cylinderRadius } = this.cache;
    const { insideRadius } = this.cache;
    const segment = 32;
    const circleHeight = this.cache.cylinderHeight + this.cache.outsideRadius;
    const cylinderHeightOffset = this.cache.cylinderHeight / 2;

    const group = new THREE.Group();

    if (this.drawable.pin) {
      // 大头
      const geometry = new THREE.SphereGeometry(0.5, 32, 32);

      const redMaterial = new THREE.MeshPhongMaterial({
        color: this.cache.cylinderColor,
      });

      const insideMesh = new THREE.Mesh(geometry, redMaterial);

      group.add(insideMesh);
      group.userData = this;
      // 支柱
      const cylinderMaterial = new THREE.MeshBasicMaterial({
        blending: THREE.NormalBlending,
        transparent: true,
        color: this.cache.cylinderColor,
        opacity: 0.5,
      });
      const cylinderGeometry = new THREE.CylinderGeometry(
        cylinderRadius,
        0,
        cylinderHeight,
        segment,
        segment
      );
      const cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
      cylinderMesh.position.y = cylinderHeightOffset;

      group.add(cylinderMesh);

      this._balloonTemplate = tbService.tb
        .Object3D({ obj: group })
        .setCoords(this.cache.coordinate)
        .rotateX(Math.PI / 2);
      this._balloonTemplate.info = this;
      tbService.tb.add(this._balloonTemplate);
      this.hasDrawed = true;

      const height = cylinderHeight;
      cylinderMesh.scale.set(1, 1, 1);
      cylinderMesh.position.y = height / 2;
      insideMesh.position.y = height;
      return;
    }
    // 内侧图标
    const insideMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      side: THREE.DoubleSide,
    });
    const insideImageLoader = new THREE.ImageLoader();
    insideImageLoader.load(this.cache.insideIcon, img => {
      const texture = new THREE.Texture(img);
      insideMaterial.map = texture;
      texture.needsUpdate = true;
      insideMaterial.needsUpdate = true;
    });

    const insideGeometry = new THREE.CircleGeometry(insideRadius, segment);
    const insideMesh = new THREE.Mesh(insideGeometry, insideMaterial);
    insideMesh.position.y = circleHeight;
    insideMesh.rotateY(Math.PI)
    group.add(insideMesh);
    group.userData = this;
    // 支柱
    const cylinderMaterial = new THREE.MeshBasicMaterial({
      blending: THREE.NormalBlending,
      transparent: true,
      color: this.cache.cylinderColor,
      opacity: 0.5,
    });
    const cylinderGeometry = new THREE.CylinderGeometry(
      cylinderRadius,
      0,
      cylinderHeight,
      segment,
      segment
    );
    const cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinderMesh.position.y = cylinderHeightOffset;

    group.add(cylinderMesh);

    this._balloonTemplate = tbService.tb
      .Object3D({ obj: group })
      .setCoords(this.cache.coordinate)
      .rotateX(Math.PI / 2);
    this._balloonTemplate.info = this;
    tbService.tb.add(this._balloonTemplate);
    this.hasDrawed = true;

    const height = cylinderHeight;
    cylinderMesh.scale.set(1, 1, 1);
    cylinderMesh.position.y = height / 2;
    insideMesh.position.y = height + insideRadius;

    this._map.on('click', this._chooseThreeObject);
  }

  _chooseThreeObject(e) {
    const threebox = tbService.tb;
    const event = e.originalEvent;
    const selectedMeshs = threebox.queryRenderedFeatures(event);

    if (selectedMeshs.length) {
      const result = selectedMeshs.find(selectedMesh => {
        return selectedMesh.object !== null;
      });

      if (!result) {
        return;
      }

      const userData = mathUtils.getTargetObjectInfo(result.object, 'info', 'parent');
      console.log('rd: BalloonWrapper -> _chooseThreeObject -> userData', userData)
      const option = {
        dataSource: userData.drawable,
        type: BALLOON_DRAWABLE_TYPE
      }
      const topic = eventAggregator.getAllEventTopics().MapClicked;
      eventAggregator.publish(topic, option);
    }
  }

  toggleShow(isShow) {
    if (!this.hasDrawed) {
      this.cache.isShow = isShow;
      return;
    }
    if (tbService.popup) {
      if (!isShow || !tbService.showPopup) {
        tbService.popup.remove();
      } else if (tbService.popup.isOpen() === false)
        tbService.popup.addTo(tbService._map);
    }
    this._balloonTemplate.visible = isShow;
    this._map.repaint = true;
  }

  update() {
    const newCoordinate = this.drawable.coordinate;
    if (!this.hasDrawed) {
      this.cache.coordinate = newCoordinate;
      return;
    }
    this._balloonTemplate.setCoords(newCoordinate);
    this._map.repaint = true;
    this.cache.coordinate = newCoordinate;
  }

  remove() {
    if (!this.hasDrawed) {
      this.cache.isRemove = true;
      return;
    }
    tbService.tb.remove(this._balloonTemplate);
    this._map.repaint = true;
  }
}

export default class BalloonHandler extends HandlerBase {
  _addCore(drawable) {
    const wrapper = new BalloonWrapper(this._map, drawable);
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

  show(drawable, e, popUp) {
    const selectedFeature = tbService.tb.queryRenderedFeatures(e.point)[0];
    const self = this;

    if (!selectedFeature) {
      tbService.showPopup = false;
      tbService.removeEventListener('TbLayerRender', self._balloonPopupShow);
      return null;
    }
    const selectedFeatureUserData = selectedFeature.object.parent.userData;
    if (selectedFeatureUserData.type !== drawable.constructor.name) {
      tbService.showPopup = false;
      tbService.removeEventListener('TbLayerRender', self._balloonPopupShow);
      return null;
    }
    if (popUp) {
      tbService.showPopup = true;
      const coffient = 2 ** (tbService._map.getZoom() - 16);
      tbService.popup = new mapboxgl.Popup({
        offset: coffient * 510,
        anchor: 'bottom',
      })
        .setLngLat(selectedFeatureUserData.drawable.coordinate)
        .setHTML(jsonToHtml(selectedFeatureUserData.drawable))
        .addTo(tbService._map);
      tbService.addEventListener('TbLayerRender', self._balloonPopupShow);
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

  _balloonPopupShow() {
    if (this.popup) {
      const coffient = 2 ** (this._map.getZoom() - 16);
      this.popup.options.offset = coffient * 510;
    }
  }
}
