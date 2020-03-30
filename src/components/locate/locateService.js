import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';
import MapboxTraffic from '@mapbox/mapbox-gl-traffic';
import dataService from '../../services/dataService';
import jsonToHtml from '../../utils/jsonToHtml';

export const EVENT_MAPBASICINFO_CHANGED = 'mapBasicInfoChanged';

class MapEvent extends Event {
    constructor(eventName, basicInfo) {
        super(eventName);
        this.basicInfo = basicInfo;
    }
}

class LocateService extends EventTarget {
    init(option) {
        // console.log('rd: init -> option', option);
        const { map } = option;
        this._map = map;
        const mapboxTraffic = new MapboxTraffic();
        this._map.mapboxTraffic = mapboxTraffic;
        this._map.addControl(mapboxTraffic);
    }

    locate(options) {
        console.log('rd: locate -> options', options);
        const { locateType, option } = options;
        this._moveToTarget(locateType, option);
    }

    slider(options) {
        console.log('rd: options', options);
        const { features, locateType } = options;
        console.log('rd: features', features);
        const animateItems = [];
        for (let index = 0; index < features.length; index += 1) {
            const feature = features[index];
            if (!Object.prototype.hasOwnProperty.call(feature, 'coordinates') || feature.coordinates == null) {
                throw new Error('invalid input!');
            }

            const latlng = feature.coordinates;
            const item = {
                zoom: Math.random() * 10 + 9,
                center: latlng,
                curve: 1,
                speed: 0.8,
                bearing: Math.random() * 25,
            };
            animateItems.push(item);
        }
        const popup = new mapboxgl.Popup({
            offset: 36,
            closeButton: false,
            closeOnClick: false,
        }).addTo(this._map);
        this._cyclicLocate(features, locateType, animateItems, 0, popup);
    }

    stopSlider(option) {
        console.log('rd: stopSlider -> option', option);
        console.log('rd: LocateService -> stopSlider -> this._map', this._map);
    }

    sliderAround(options) {
        const { timestampDivides } = options;
        const divides = timestampDivides || 1000;
        if (!this._globalID) {
            this._rotateCamera(divides, 0);
        }
    }

    stopSliderAround() {
        console.log('rd: LocateService -> stopSliderAround -> this._globalID', this._globalID);
        if (this._globalID) {
            cancelAnimationFrame(this._globalID);
            this._globalID = null;
        }
    }

    toggleShowMapBasicInfo(isShow) {
        console.log('rd: LocateService -> toggleShowMapBasicInfo -> isShow', isShow);
        this._addListenMapEvents();
        this._showCenterMarker(isShow);
        this._showBasicInfoContainer(isShow);
    }

    fitMapView(option, showTest = false) {
        const { start, end, coordinates, margin = { top: 10, bottom: 10, left: 10, right: 10 } } = option;
        if (!coordinates || coordinates.length === 0) {
            console.error('rd: LocateService -> fitMapView -> coordinates invalid:', coordinates);
            return;
        }

        if (start > end) {
            console.error('rd: LocateService -> fitMapView -> start&end invalid:', start, end);
            return;
        }

        if (coordinates.length > 1) {
            const featurePoints = [];
            coordinates.forEach(coordinate => {
                featurePoints.push(turf.point(coordinate));
            });
            const features = turf.featureCollection(featurePoints);
            const region = turf.envelope(features);

            const bounds = this._calcFitBounds(start, end, region);
            console.log('rd: LocateService -> fitMapView -> bounds', bounds);
            const { top, bottom, left, right } = margin;
            this._map.fitBounds(bounds, {
                padding: { top, bottom, left, right },
            });
            if (showTest) {
                this._testRegion(region, 'red', 'region');
                this._testBounds(bounds);
            }
        } else {
            const center = this._calcFitCenter(start, end, coordinates[0]);
            this._map.flyTo({ center, zoom: 15 });
        }
    }

    _calcFitBounds(start, end, region) {
        const { coordinates } = region.geometry;
        console.log('rd: LocateService -> _calcBounds -> coordinates', coordinates);
        const bounds = [];
        const sw = coordinates[0][0];
        const ne = coordinates[0][2];
        let lngOffset = ne[0] - sw[0];
        let leftdown = sw;
        let rightUp = ne;
        if (start === end) {
            leftdown = [sw[0] - lngOffset * (start - 1), sw[1]];
            rightUp = [ne[0] + lngOffset * (12 - end), ne[1]];
        } else {
            const range = end - start + 1;
            // eslint-disable-next-line operator-assignment
            lngOffset = lngOffset / range;
            leftdown = [sw[0] - lngOffset * (start - 1), sw[1]];
            rightUp = [ne[0] + lngOffset * (12 - end), ne[1]];
        }

        bounds.push(leftdown);
        bounds.push(rightUp);
        return bounds;
    }

    _calcFitCenter(start, end, coordinate) {
        const boundary = 6.5;
        const bounds = this._map.getBounds();
        const lngOffset = (bounds._ne.lng - bounds._sw.lng) / 12;
        const mapCenter = this._map.getCenter();

        const lngDiff = mapCenter.lng - coordinate[0];
        const latDiff = mapCenter.lat - coordinate[1];

        let lngDiffValue = 0;
        if (start === end) {
            const unit = start - boundary;
            lngDiffValue = lngOffset * unit;
        } else {
            const lngRange = (start + end) / 2 - boundary;
            lngDiffValue = lngOffset * lngRange;
        }

        const centerOffset = [lngDiff + lngDiffValue, latDiff];
        return [mapCenter.lng - centerOffset[0], mapCenter.lat - centerOffset[1]];
    }

    toggleShowMapTraffic(isShow) {
        const trafficControl = this._map.mapboxTraffic;
        trafficControl.options.showTraffic = isShow;
        trafficControl.render();
    }

    _testBounds(bounds) {
        const featurePoints = [];
        featurePoints.push(turf.point(bounds[0]));
        featurePoints.push(turf.point(bounds[1]));
        const features = turf.featureCollection(featurePoints);
        const region = turf.envelope(features);
        this._testRegion(region, 'green', 'bounds');
    }

    _testRegion(region, color = 'red', name = 'test') {
        if (!this._map.getLayer(name)) {
            this._map.addSource(`${name}_areaSource`, {
                type: 'geojson',
                data: region,
            });
            this._map.addLayer({
                id: name,
                type: 'fill',
                source: `${name}_areaSource`,
                layout: {},
                paint: {
                    'fill-color': color,
                    'fill-opacity': 0.3,
                },
            });
        } else {
            this._map.getSource(`${name}_areaSource`).setData(region);
        }
    }

    _refreshCurrentBasicInfo() {
        const { lng, lat } = this._map.getCenter();
        const { _sw, _ne } = this._map.getBounds();
        this._basicInfo = {
            center: { lng: lng.toFixed(6), lat: lat.toFixed(6) },
            zoom: this._map.getZoom().toFixed(2),
            pitch: this._map.getPitch().toFixed(2),
            bearing: this._map.getBearing().toFixed(2),
            bounds: {
                sw: { lng: _sw.lng.toFixed(6), lat: _sw.lat.toFixed(6) },
                ne: { lng: _ne.lng.toFixed(6), lat: _ne.lat.toFixed(6) },
            },
        };
        if (this._centerMarker) {
            this._centerMarker.setLngLat(this._map.getCenter());
        }
        if (this._basicInfoContainer) {
            this._basicInfoContainer.innerHTML = jsonToHtml(this._basicInfo);
        }
    }

    _mapEventChanged() {
        this._refreshCurrentBasicInfo();
        this.dispatchEvent(new MapEvent(EVENT_MAPBASICINFO_CHANGED, this._basicInfo));
    }

    _showBasicInfoContainer(isShow) {
        if (!this._basicInfoContainer) {
            this._refreshCurrentBasicInfo();
            const mapDiv = document.getElementById('map');
            const el = document.createElement('div');
            el.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            el.style.color = '#fff';
            el.style.padding = '5px 10px';
            el.style.borderRadius = '5px';
            el.style.position = 'absolute';
            el.style.top = '10px';
            el.style.left = '10px';
            el.style.zIndex = '1';
            el.innerHTML = jsonToHtml(this._basicInfo);
            this._basicInfoContainer = el;
            mapDiv.appendChild(this._basicInfoContainer);
        }
        this._basicInfoContainer.style.display = isShow ? 'block' : 'none';
    }

    _showCenterMarker(isShow) {
        if (!this._centerMarker) {
            const el = document.createElement('div');
            el.style.backgroundImage = `url(${dataService.baseUrl}projectdata/war_dispatch/images/icons/hospital-11.svg)`;
            el.style.width = '10px';
            el.style.height = '10px';
            el.style.backgroundSize = 'cover';
            el.style.display = 'block';
            this._centerMarker = new mapboxgl.Marker(el).setLngLat(this._map.getCenter()).addTo(this._map);
        }
        const el = this._centerMarker.getElement();
        el.style.display = isShow ? 'block' : 'none';
    }

    _addListenMapEvents() {
        this._addListenEvent('zoomend');
        this._addListenEvent('rotateend');
        this._addListenEvent('pitchend');
        this._addListenEvent('dragend');
        this._addListenEvent('moveend');
    }

    _addListenEvent(eventName) {
        this._map.on(eventName, () => {
            this._mapEventChanged();
        });
    }

    _moveToTarget(locateType, option) {
        console.log('rd: moveToTarget -> locateType:', locateType);
        switch (locateType) {
            case 'panTo':
                this._map.panTo(option);
                break;
            case 'jumpTo':
                this._map.jumpTo(option);
                break;
            case 'flyTo':
                this._map.flyTo(option);
                break;
            case 'easeTo':
                this._map.easeTo(option);
                break;
            default:
                this._map.flyTo(option);
        }
    }

    _cyclicLocate(features, locateType, options, index, popup) {
        if (index >= options.length - 1) {
            console.log('Locate over!');
            popup.remove();
            return;
        }
        this._moveToTarget(locateType, options[index]);

        const feature = features[index];
        let properties = null;
        // eslint-disable-next-line no-restricted-syntax
        for (const Key in feature) {
            if (properties == null) {
                properties = `<h1>${Key}: ${feature[Key]}</h1>`;
            } else {
                properties = `${properties}<h1>${Key}: ${feature[Key]}</h1>`;
            }
        }
        console.log('rd: LocateService -> _cyclicLocate -> options[index].center', options[index].center);
        popup.setLngLat(options[index].center);
        popup.setHTML(`<p>${properties}</p>`);
        this._map.once('moveend', () => {
            window.setTimeout(() => {
                // eslint-disable-next-line no-param-reassign
                index = index + 1 === options.length ? 0 : index + 1;
                this._cyclicLocate(features, locateType, options, index, popup);
            }, 1000);
        });
    }

    _rotateCamera(timestampDivides, timestamp) {
        this._map.rotateTo((timestamp / timestampDivides) % 360, { duration: 0 });
        this._globalID = requestAnimationFrame(this._rotateCamera.bind(this, timestampDivides));
    }
}

export default new LocateService();
