import * as turf from '@turf/turf';
import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import mapboxgl from 'mapbox-gl';
import RadarEffectEntity from '../radar0/radarEffectEntity';
import layerZIndexHelper from '../layerZIndexHelper';

/**
 * 代表一个GPS设备实体
 * @class GPSDevice
 * @param {mapboxgl.Map} map 地图
 * @param {Object} gpsDeviceInfo gps信息
 * @param {String} options.id Required.
 * @param {String} options.name Required.
 * @param {String} options.typeID Required, 代表Gps设备类型，通过该属性来决定呈现样式，gps-person、gps-car.
 * @param {Array} options.coordinate Required，Gps初始位置.
 * @example
 *  const gps = new GPSDevice(this._map, {
 *     userID: '40020000187',
 *     coordinate:[112.3,45.6],
 *     typeID: 'GPS-User',
 *     showScan: false,
 *   });
 * @return {GPSDevice} `this`
 *
 */
class GPSDevice {
    constructor(map, gpsDeviceInfo) {
        this._map = map;
        const {
            id,
            userID,
            name,
            typeID,
            coordinate,
            isShow,
            showScan,
            canDrawRoute,
            scanRadius,
            scanUrl,
        } = gpsDeviceInfo;
        this._id = id;
        this._userID = userID;
        this._name = name;
        this._typeID = typeID;
        this._coordinate = coordinate;
        this._isShow = isShow;
        this._showScan = showScan;
        this._canDrawRoute = canDrawRoute;
        this._isAnimating = false;
        this._newCoordinate = null;
        this._affectRadius = scanRadius || 100;
        this.radarEffectItem = null;
        this._routePoints = [];
        this._scanUrl = scanUrl;
        // 用GPS设备的数据源
        this._point = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'Point',
                        coordinates: this._coordinate,
                    },
                },
            ],
        };

        this._addedToMap();
    }

    setVisibility(visibility) {
        this._map.setLayoutProperty(this._id, 'visibility', visibility);
        if (visibility === 'visible') {
            this._map.setLayoutProperty(
                `route_${this._id}`,
                'visibility',
                this._canDrawRoute ? visibility : 'none'
            );
            this._map.setLayoutProperty(
                `radar_layer_${this._id}`,
                'visibility',
                this._showScan ? visibility : 'none'
            );
        } else {
            this._map.setLayoutProperty(`route_${this._id}`, 'visibility', 'none');
            this._map.setLayoutProperty(`radar_layer_${this._id}`, 'visibility', 'none');
        }
    }

    updateOnMap(drawable) {
        const { coordinate, _isShow, _showScan, _scanRadius } = drawable;

        // 更新扫描范围
        if (this._affectRadius !== _scanRadius) {
            this._affectRadius = _scanRadius;
            if (this.radarEffectItem) {
                this.radarEffectItem.updateCoordinate(this._affectRadius / 1000, this._coordinate);
            }
        }

        if (this._isShow !== _isShow) {
            this._isShow = _isShow;
            this._map.setLayoutProperty(this._id, 'visibility', this._isShow ? 'visible' : 'none');
        }

        // 更新扫描显隐
        this._showScan = _showScan;
        this._map.setLayoutProperty(
            `radar_layer_${this._id}`,
            'visibility',
            this._isShow && this._showScan ? 'visible' : 'none'
        );

        // 更新坐标
        if (this._coordinate !== coordinate && this._newCoordinate !== coordinate) {
            this._animationTo(coordinate);
        }

        return this;
    }

    removeFromMap() {
        this._map.removeLayer(this._id);
        this._map.removeLayer(`route_${this._id}`);
        this._closeScan();
        this._routePoints = [];
    }

    _openScan() {
        console.log('rd: GPSDevice -> openScan -> id:', this._id);
        if (this.radarEffectItem) {
            return;
        }

        this.radarEffectItem = new RadarEffectEntity(this._id, {
            distance: this._affectRadius / 1000,
            coordinate: this._coordinate,
            frameCount: 41,
            urlPrifix: this._scanUrl,
        });
        this.radarEffectItem.addToMap(this._map);
    }

    _closeScan() {
        console.log('rd: GPSDevice -> closeScan -> closeScan', this._id);
        if (!this.radarEffectItem) {
            return;
        }
        this.radarEffectItem.removeFromMap();
        this.radarEffectItem = null;
    }

    _animationTo(newCoordinate, callBack) {
        const oldPoint = turf.point(this._coordinate);
        const newPoint = turf.point(newCoordinate);
        if (turf.booleanEqual(oldPoint, newPoint)) {
            console.log(
                "rd: GPSDevice -> animationTo -> newCoordinate is equal old, won't move.",
                newCoordinate
            );
            return;
        }

        // 判断是否正在运行中
        if (this._isAnimating) {
            this._newCoordinate = newCoordinate;
            return;
        }
        this._newCoordinate = null;
        this._isAnimating = true;

        // 用来缓存切割的点
        const arc = [];

        const line = turf.lineString([this._coordinate, newCoordinate]);
        console.log('rd: GPSDevice -> animationTo -> line', line);

        // 先计算当前点与目标点距离
        const lineDistance = turf.length(line);

        // 值越大则动画越平滑 暂定为1KM20个点
        const steps = lineDistance * 500;
        console.log('rd: GPSDevice -> animationTo -> steps,lineDistance', steps, lineDistance);

        if (steps < 1) {
            console.log("rd: GPSDevice -> animationTo -> step is less than 1, won't move.", steps);
            this._isAnimating = false;
            return;
        }

        const offset = lineDistance / steps;
        for (let i = 0; i < lineDistance; i += offset) {
            const segment = turf.along(line, i);
            arc.push(segment.geometry.coordinates);
        }
        this._animate(steps, 1, arc, callBack);
    }

    _animate(steps, counter, arc, callBack) {
        // console.log('rd: GPSDevice -> animate -> steps', steps, counter, arc[counter]);

        // 计算角度.
        this._point.features[0].properties.bearing = turf.bearing(
            turf.point(arc[counter - 1]),
            turf.point(arc[counter])
        );
        // 赋值坐标点
        this._point.features[0].geometry.coordinates = arc[counter];

        this._map.getSource(`${this._id}_source`).setData(this._point);
        // this._update3DModel(arc[counter]);
        this._updateScan(arc[counter]);
        this._addRouteMarker(arc[counter]);

        // 下一个点
        // eslint-disable-next-line no-param-reassign
        counter += 1;

        // 看是否到最后一个点，不是则继续滑动.
        if (counter < steps) {
            requestAnimationFrame(this._animate.bind(this, steps, counter, arc, callBack));
        } else {
            console.log('rd: GPSDevice -> animate -> end:counter:', counter);
            this._isAnimating = false;
            this._coordinate = this._point.features[0].geometry.coordinates;
            if (callBack) {
                callBack();
            } else if (this._newCoordinate) {
                this._animationTo(this._newCoordinate);
            }
        }
    }

    _updateScan(newCoordinate) {
        if (this.radarEffectItem) {
            this.radarEffectItem.updateCoordinate(this._affectRadius / 1000, newCoordinate);
        }
    }

    _addedToMap() {
        this._map.addSource(`${this._id}_source`, {
            type: 'geojson',
            data: this._point,
        });
        this._map.addLayer({
            id: this._id,
            source: `${this._id}_source`,
            type: 'symbol',
            layout: {
                'icon-image': this._getImageIcon(), // this.gpsDeviceInfo.type,
                'icon-rotate': ['get', 'bearing'],
                'icon-rotation-alignment': 'map',
                'icon-allow-overlap': true,
                'icon-ignore-placement': true,
                'icon-size': 1,
            },
        });

        // this._add3DModel(this._coordinate);

        this._openScan();
        this._addRouteMarker(this._coordinate);
        this._map.setLayoutProperty(this._id, 'visibility', this._isShow ? 'visible' : 'none');
        this._map.setLayoutProperty(
            `radar_layer_${this._id}`,
            'visibility',
            this._isShow && this._showScan ? 'visible' : 'none'
        );
        this._map.setLayoutProperty(
            `route_${this._id}`,
            'visibility',
            this._isShow && this._canDrawRoute ? 'visible' : 'none'
        );
    }

    _update3DModel(latlng) {
        console.log('rd: _update3DModel -> latlng', latlng);
        const layer = this._map.getLayer(this._id);
        if (layer === null) {
            return;
        }

        this._map.removeLayer(this._id);
        this._add3DModel(latlng);
    }

    _add3DModel(modelOrigin) {
        const modelAltitude = 0;
        const modelRotate = [Math.PI / 2, 0, 0];
        const modelScale = 5.41843220338983e-9;

        // transformation parameters to position, rotate and scale the 3D model onto the map
        const modelTransform = {
            translateX: mapboxgl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude).x,
            translateY: mapboxgl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude).y,
            translateZ: mapboxgl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude).z,
            rotateX: modelRotate[0],
            rotateY: modelRotate[1],
            rotateZ: modelRotate[2],
            scale: modelScale,
        };

        // configuration of the custom layer for a 3D model per the CustomLayerInterface
        const customLayer = {
            id: this._id,
            type: 'custom',
            renderingMode: '3d',
            onAdd(map, gl) {
                this.camera = new THREE.Camera();
                this.scene = new THREE.Scene();

                // create two three.js lights to illuminate the model
                const directionalLight = new THREE.DirectionalLight(0xffffff);
                directionalLight.position.set(0, -70, 100).normalize();
                this.scene.add(directionalLight);

                const directionalLight2 = new THREE.DirectionalLight(0xffffff);
                directionalLight2.position.set(0, 70, 100).normalize();
                this.scene.add(directionalLight2);

                // use the three.js GLTF loader to add the 3D model to the three.js scene
                const loader = new GLTFLoader();
                loader.load('http://10.8.9.64:3038/gltf/bus/bus2.gltf', gltf => {
                    this.scene.add(gltf.scene);
                });
                this.map = map;

                // use the Mapbox GL JS map canvas for three.js
                this.renderer = new THREE.WebGLRenderer({
                    canvas: map.getCanvas(),
                    context: gl,
                });

                this.renderer.autoClear = false;
            },
            render(gl, matrix) {
                const rotationX = new THREE.Matrix4().makeRotationAxis(
                    new THREE.Vector3(1, 0, 0),
                    modelTransform.rotateX
                );
                const rotationY = new THREE.Matrix4().makeRotationAxis(
                    new THREE.Vector3(0, 1, 0),
                    modelTransform.rotateY
                );
                const rotationZ = new THREE.Matrix4().makeRotationAxis(
                    new THREE.Vector3(0, 0, 1),
                    modelTransform.rotateZ
                );

                const m = new THREE.Matrix4().fromArray(matrix);
                const l = new THREE.Matrix4()
                    .makeTranslation(
                        modelTransform.translateX,
                        modelTransform.translateY,
                        modelTransform.translateZ
                    )
                    .scale(
                        new THREE.Vector3(
                            modelTransform.scale,
                            -modelTransform.scale,
                            modelTransform.scale
                        )
                    )
                    .multiply(rotationX)
                    .multiply(rotationY)
                    .multiply(rotationZ);

                this.camera.projectionMatrix.elements = matrix;
                this.camera.projectionMatrix = m.multiply(l);
                this.renderer.state.reset();
                this.renderer.render(this.scene, this.camera);
                this.map.triggerRepaint();
            },
        };
        this._map.addLayer(customLayer);
    }

    _getImageIcon() {
        console.log('rd: _getImageIcon -> typeID', this._typeID);
        let iconName = null;
        switch (this._typeID) {
            case 'GPS-User':
                iconName = 'airport-15';
                break;
            case '{2150A447-0620-4B9D-BA04-00F91EA0744F}':
                iconName = 'airfield-15';
                break;
            default:
                iconName = 'airport-15';
        }
        return iconName;
    }

    _addRouteMarker(latlng) {
        this._routePoints.push(latlng);
        if (!this._map.getLayer(`route_${this._id}`)) {
            const zIndexLayerID = layerZIndexHelper.getLayerZIndex('line');
            this._map.addSource(`route_${this._id}_source`, {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'LineString',
                        coordinates: this._routePoints,
                    },
                },
                lineMetrics: true,
            });

            this._map.addLayer(
                {
                    id: `route_${this._id}`,
                    type: 'line',
                    source: `route_${this._id}_source`,
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round',
                    },
                    paint: {
                        'line-color': 'green',
                        'line-width': 3,
                        'line-gradient': [
                            'interpolate',
                            ['linear'],
                            ['line-progress'],
                            0,
                            'cyan',
                            0.5,
                            'lime',
                            1,
                            'yellow',
                        ],
                    },
                },
                zIndexLayerID
            );
            this._map.setLayoutProperty(`route_${this._id}`, 'visibility', 'visible');
        } else {
            this._map.getSource(`route_${this._id}_source`).setData({
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: this._routePoints,
                },
            });
        }
    }
}

export default GPSDevice;
