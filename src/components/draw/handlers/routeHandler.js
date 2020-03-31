import mapboxgl from 'mapbox-gl';
import HandlerBase from './handlerBase';
import layerZIndexHelper from '../../layerZIndexHelper';
import latLngsCalculator from '../../../utils/latLngsCalculator';

export default class RouteHandler extends HandlerBase {
  constructor(option) {
    super(option);
    const { dataService } = option;
    this._dataService = dataService;
  }

  _addCore(drawable) {
    this._addRoute(drawable);
    const marker = this._addDetailsMarker(drawable);
    return marker;
  }

  _updateCore(drawable) {
    const {
      _id, coordinates, duration, distance,
    } = drawable;
    this._map.getSource(`${_id}_source`).setData({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates,
      },
    });

    const marker = this._drawableRelation.get(_id);
    if (!marker) {
      return;
    }

    marker.setLngLat(coordinates[coordinates.length - 1]);
    const distanceKm = (distance / 1000).toFixed(1);
    const timeConst = this._formatSeconds(duration);
    document.getElementById('textElement').innerHTML = `<div>${timeConst}min<br>${distanceKm}km</div>`;
  }

  _removeCore(drawableID) {
    this._map.removeLayer(drawableID);
    const marker = this._drawableRelation.get(drawableID);
    if (marker) {
      marker.remove();
    }
  }

  _setVisibility(drawableID, visiable) {
    const marker = this._drawableRelation.get(drawableID);
    if (!marker) {
      return;
    }

    marker.getElement().style.display = visiable ? 'flex' : 'none';
    this._map.setLayoutProperty(drawableID, 'visibility', visiable ? 'visible' : 'none');
  }

  _addRoute(drawable) {
    const {
      _id, coordinates, isDynamicDraw,
    } = drawable;
    const dataSource = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [],
      },
    };

    console.log('rd: _addRoute -> isDynamicDraw', isDynamicDraw);
    if (!this._map.getLayer(_id)) {
      const zIndexLayerID = layerZIndexHelper.getLayerZIndex('line');
      this._map.addSource(`${_id}_source`, {
        type: 'geojson',
        data: dataSource,
        lineMetrics: true,
      });

      this._map.addLayer(
        {
          id: _id,
          type: 'line',
          source: `${_id}_source`,
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
              0.5,
              '#3BFF57',
              1,
              '#6EFAFF',
            ],
          },
        },
        zIndexLayerID,
      );
    }

    if (!isDynamicDraw) {
      dataSource.geometry.coordinates = coordinates;
      this._map.getSource(`${_id}_source`).setData(dataSource);
    } else {
      let cutedPoints = [];
      for (let index = 0; index < coordinates.length - 2; index += 1) {
        const { points } = latLngsCalculator.cutLineToPoints(coordinates[index],
          coordinates[index + 1]);
        cutedPoints = [...cutedPoints, ...points];
      }

      this._dynamicDrawRoute(0, _id, cutedPoints, dataSource);
    }
  }

  _dynamicDrawRoute(index, id, coordinates, dataSource) {
    let counter = index;
    if (coordinates.length - 10 < counter) {
      counter = 0;
    }
    const source = dataSource;
    source.geometry.coordinates = coordinates.slice(0, counter);
    this._map.getSource(`${id}_source`).setData(dataSource);
    const number = counter + 10;
    this.animationID = requestAnimationFrame(this._dynamicDrawRoute
      .bind(this, number, id, coordinates, source));
  }

  _formatSeconds(value) {
    console.log('rd: _formatSeconds -> value', this._map);
    let secondTime = parseInt(value, 10);
    let minuteTime = 0;
    let hourTime = 0;
    if (secondTime > 60) {
      minuteTime = parseInt(`${secondTime / 60}`, 10);
      secondTime = parseInt(`${secondTime % 60}`, 10);

      if (minuteTime > 60) {
        hourTime = parseInt(`${minuteTime / 60}`, 10);
        minuteTime = parseInt(`${minuteTime % 60}`, 10);
      }
    }
    let result = `${parseInt(`${secondTime}`, 10)}s`;

    if (minuteTime > 0) {
      result = `${parseInt(`${minuteTime}`, 10)}`;
    }
    if (hourTime > 0) {
      result = `${parseInt(`${hourTime}`, 10)}h${result}`;
    }
    return result;
  }

  _addDetailsMarkerCore(drawable, coordinate) {
    const { distance, duration } = drawable;
    const distanceKm = (distance / 1000).toFixed(1);
    const timeConst = this._formatSeconds(duration);
    const el = document.createElement('div');
    el.style.backgroundImage = `url(${this._dataService.baseUrl}images/icons/endPoint.png)`;
    el.style.width = '60px';
    el.style.height = '60px';
    el.style.backgroundSize = 'cover';
    el.style.display = 'flex';
    el.style.color = 'white';
    el.style.textAlign = 'center';
    el.style.alignItems = 'center';

    const textElement = document.createElement('div');
    textElement.style.textAlign = 'center';
    textElement.style.width = '60px';
    textElement.id = 'textElement';
    textElement.innerHTML = `<div>${timeConst}min<br>${distanceKm}km</div>`;
    el.appendChild(textElement);
    el.style.display = 'flex';

    const marker = new mapboxgl.Marker(el)
      .setLngLat(coordinate)
      .addTo(this._map)
      .setOffset([0, -30]);

    return marker;
  }

  _addDetailsMarker(drawable) {
    const { centreDetail, coordinates } = drawable;
    let detailPosition = null;
    if (centreDetail) {
      const index = 0;
      detailPosition = coordinates[index];
    } else {
      detailPosition = coordinates[coordinates.length - 1];
    }
    return this._addDetailsMarkerCore(drawable, detailPosition);
  }
}
