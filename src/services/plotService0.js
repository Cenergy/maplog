import RouteDrawable from '../components/draw/entities/routeDrawable';

export const EVENT_ROUTE_GETWAYPOINTS_FINISHED = 'routeGetWaypointsFinished';

class RouteFinishEvent extends Event {
  constructor(eventName, routePoints) {
    super(eventName);
    this.routePoints = routePoints;
  }
}

class PlotService extends EventTarget {
  init(option) {
    const { mapSdk, navigationService } = option;
    this._mapSdk = mapSdk;
    this._navigationService = navigationService;
  }

  startGetNavigationData() {
    this._waypoints = [];
    this._routePoints = [];
    this._routeDrawable = null;
    this._isActive = true;

    this._mapSdk.map.on('click', (e) => {
      e.preventDefault();
      if (e.originalEvent.detail === 2) {
        return;
      }
      this._getWaypoint(e);
    });

    this._mapSdk.map.on('dblclick', (e) => {
      e.preventDefault();
      this._finishGetWaypoint();
    });
  }

  endGetNavigationData() {
    this._isActive = false;
  }

  async _getWaypoint(e) {
    if (!this._isActive) {
      return;
    }

    const lnglat = [e.lngLat.lng, e.lngLat.lat];
    this._addWaypointCore(lnglat);
  }

  async _addWaypointCore(lnglat) {
    this._waypoints.push(lnglat);
    if (this._waypoints.length >= 2) {
      const option = { coordinates: this._waypoints };
      const navigationData = await this._navigationService.getNavigationData(option);
      const { geometry, duration, distance } = navigationData;
      this._routePoints = geometry.coordinates;
      if (!this._routeDrawable) {
        const drawableOption = {
          name: 'route',
          duration,
          distance,
          coordinates: this._routePoints,
          minZoom: 10,
          maxZoom: 22,
        };
        this._routeDrawable = new RouteDrawable(drawableOption);
        const drawableID = this._mapSdk.addDrawable(this._routeDrawable);
        console.log('rd: PlotService -> _getWaypoint -> drawableID', drawableID);
      } else {
        this._routeDrawable.coordinates = this._routePoints;
        this._routeDrawable.duration = duration;
        this._routeDrawable.distance = distance;
        this._mapSdk.updateDrawable(this._routeDrawable);
      }
    }
  }

  _finishGetWaypoint() {
    if (!this._isActive) {
      return;
    }
    this._isActive = false;
    setTimeout(() => {
      this.dispatchEvent(new RouteFinishEvent(EVENT_ROUTE_GETWAYPOINTS_FINISHED,
        this._routePoints));
    }, 1000);
  }
}

export default new PlotService();
