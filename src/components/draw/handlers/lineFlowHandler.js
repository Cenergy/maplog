/*eslint-disable */
import { Threebox } from '@rdapp/threebox';
import HandlerBase from './handlerBase';
import tbService from '../../../services/tbService';
import * as turf from '@turf/turf'

const MeshLine = require('three.meshline');
const THREE = require('three');

// @ts-ignore
window.Threebox = Threebox;
// @ts-ignore
window.THREE = THREE;
class LineFlowWrapper {
  constructor(map, drawable) {
    this._map = map;
    this.drawable = drawable;
    this.cache = {
      isShow: drawable.isShow,
      isRemove: false,
      lineData: drawable.lineData,
      lineColor: drawable.lineColor,
      flowLineColor: drawable.flowLineColor,
      flowLineWidth: drawable.flowLineWidth,
      flowLineLength: drawable.flowLineLength,
      lineVisible: drawable.lineVisible,
    };
    this.hasDrawed = false;
    this._template = null;
  }

  draw() {
    const { lineData } = this.cache;
    const { lineColor } = this.cache;
    const { flowLineColor } = this.cache;
    const { flowLineWidth } = this.cache;
    const { flowLineLength } = this.cache;
    const { lineVisible } = this.cache;

    if (!lineData.features) {
      return;
    }

    lineData.features.forEach(element => {
      const riverLength = 2.66;
      let trail_line = null,
        flattenedArray = null,
        allpoints = null,
        trail_mesh = null;
      const options = {
        path: element.geometry.coordinates,
      };
      const lineGeometry = options.path.map(function (coordinate) {
        return coordinate.concat([1]);
      });

      // turf获取中心位置
      const center = getCenter(element.geometry.coordinates);

      const geometry = new THREE.Geometry();

      const straightProject = tbService.tb.utils.lnglatsToWorld(lineGeometry);
      const normalized = tbService.tb.utils.normalizeVertices(straightProject);
      flattenedArray = tbService.tb.utils.flattenVectors(normalized.vertices);
      const vertices = [];

      for (let index = 0; index < flattenedArray.length / 3; index++) {
        vertices.push(
          new THREE.Vector3(
            flattenedArray[index * 3],
            flattenedArray[index * 3 + 1],
            0
          )
        );
      }

      const curve = new THREE.CatmullRomCurve3(vertices);

      // 均分成段
      allpoints = curve.getPoints((300 * riverLength) / 2);
      if (lineVisible) {
        const flowLineGeometry = new THREE.Geometry();
        flowLineGeometry.setFromPoints(allpoints);
        const lineMaterial = new THREE.LineBasicMaterial({
          color: lineColor,
        });
        const line = new THREE.Line(flowLineGeometry, lineMaterial);
        const cubeLine = tbService.tb.Object3D({ obj: line }).setCoords(center);
        tbService.tb.add(cubeLine);
      }

      for (let index = 0; index < allpoints.length; index++) {
        if (index < Number(flowLineLength)) {
          const point = allpoints[index];
          geometry.vertices.push(point);
        }
      }

      trail_line = new MeshLine.MeshLine();
      trail_line.setGeometry(geometry, function (p) {
        return p;
      });

      const resolution = new THREE.Vector2(1000, 100);

      const flowLineMaterial = new MeshLine.MeshLineMaterial({
        color: flowLineColor,
        opacity: 1,
        sizeAttenuation: 1,
        resolution: resolution,
        lineWidth: flowLineWidth,
        near: 0.001,
        far: 100,
        depthTest: true,
        blending: THREE.AdditiveBlending,
        transparent: false,
        side: THREE.DoubleSide,
        // wireframe: true
      });
      trail_mesh = new THREE.Mesh(trail_line.geometry, flowLineMaterial);
      const cube = tbService.tb.Object3D({ obj: trail_mesh }).setCoords(center);
      tbService.tb.add(cube);

      function getCenter(coords) {
        let points = [];
        coords.forEach(point => {
          points.push(turf.point(point));
        });
        const features = turf.featureCollection(points);
        const center = turf.center(features);
        return [
          center.geometry.coordinates[0],
          center.geometry.coordinates[1],
          1,
        ];
      }

      let index = 1;
      let oldtime = 0;
      function animate(timestamp) {
        if (timestamp - oldtime > 5) {
          trail_line.advance(allpoints[index]);
          oldtime = timestamp;
          if (index < allpoints.length - 1) {
            index += 1;
          } else {
            let middlePoint;
            // 因会出现循环飞行，首尾出现连线，所以先隐藏后再显示出来
            if (allpoints.length % 2 > 0) {
              middlePoint = allpoints[(allpoints.length - 1) / 2];
            } else {
              middlePoint = allpoints[(allpoints.length - 2) / 2];
            }
            trail_line.advance([middlePoint[0], middlePoint[1], -1000]);
            index = 0;
          }
        }

        tbService.tb.map.repaint = true;
        requestAnimationFrame(animate);
      }
      animate();
    });
  }

  toggleShow(isShow) {
    if (!this.hasDrawed) {
      this.cache.isShow = isShow;
      return;
    }
    this._template.visible = isShow;
    this._map.repaint = true;
  }

  update() { }

  remove() {
    if (!this.hasDrawed) {
      this.cache.isRemove = true;
      return;
    }
    tbService.tb.remove(this._template);
    this._map.repaint = true;
  }
}

export default class LineFlowHandler extends HandlerBase {
  _addCore(drawable) {
    const wrapper = new LineFlowWrapper(this._map, drawable);
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
