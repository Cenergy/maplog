import mapboxgl from 'mapbox-gl';
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
    console.log('rd: init -> option', option);
    const { map } = option;
    this._map = map;
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
      if (
        !Object.prototype.hasOwnProperty.call(feature, 'coordinates')
        || feature.coordinates == null
      ) {
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
    const { bearing, option } = options;
    console.log('rd: LocateService -> sliderAround -> bearing:', bearing, option);
    this._rotateCamera(bearing, option);
  }

  stopSliderAround() {
    console.log('rd: LocateService -> stopSliderAround -> this._globalID', this._globalID);
    if (this._globalID) {
      cancelAnimationFrame(this._globalID);
    }
  }

  toggleShowMapBasicInfo(isShow) {
    console.log('rd: LocateService -> toggleShowMapBasicInfo -> isShow', isShow);
    this._addListenMapEvents();
    this._showCenterMarker(isShow);
    this._showBasicInfoContainer(isShow);
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
      el.style.backgroundImage = `url(${dataService.baseUrl}images/icons/hospital-11.svg)`;
      el.style.width = '10px';
      el.style.height = '10px';
      el.style.backgroundSize = 'cover';
      el.style.display = 'block';
      this._centerMarker = new mapboxgl.Marker(el)
        .setLngLat(this._map.getCenter())
        .addTo(this._map);
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
    console.log(
      'rd: LocateService -> _cyclicLocate -> options[index].center',
      options[index].center,
    );
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

  _rotateCamera(bearing, option) {
    this._map.rotateTo((bearing / 100) % 360, option);
    this._globalID = requestAnimationFrame(t => this._rotateCamera(t));
  }
}

export default new LocateService();
