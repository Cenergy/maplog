import { Threebox, THREE } from '@rdapp/threebox';
import HandlerBase from './handlerBase';

// @ts-ignore
window.Threebox = Threebox;
// @ts-ignore
window.THREE = THREE;

export default class FlylineHandler extends HandlerBase {
  _addCore(drawable) {
    const { _id, coordinates, _color } = drawable;
    const line = this._calcLinePoints(coordinates[0], coordinates[1]);
    let tb;
    this._map.addLayer({
      id: _id,
      type: 'custom',
      onAdd(map, mbxContext) {
        tb = new Threebox(map, mbxContext, {
          defaultLights: true,
        });

        const option = {
          geometry: line,
          color: _color,
        };
        const lineMesh = tb.line(option);
        tb.add(lineMesh);
      },
      render(gl, matrix) {
        tb.update();
      },
    });
  }

  _calcLinePoints(start, end) {
    const arcSegments = 25;
    const line = [];
    const tempElevation = Math.abs((end[0] - start[0]) * (end[1] - start[1])) ** 0.5;
    const maxElevation = tempElevation * 80000;
    const increment = [end[0] - start[0], end[1] - start[1]].map(
      direction => direction / arcSegments,
    );

    for (let l = 0; l <= arcSegments; l += 1) {
      let waypoint = increment.map(direction => direction * l);
      waypoint = [start[0] + waypoint[0], start[1] + waypoint[1]];
      const waypointElevation = Math.sin((Math.PI * l) / arcSegments) * maxElevation;
      waypoint.push(waypointElevation);
      line.push(waypoint);
    }
    return line;
  }

  _updateCore(drawable) {
    const layer = this._map.getLayer(drawable._id);
    if (layer) {
      this._map.removeLayer(drawable._id);
      this._addCore(drawable);
    }
  }

  _removeCore(drawableID) {
    this._map.removeLayer(drawableID);
  }

  _setVisibility(drawableID, visiable) {
    this._map.setLayoutProperty(drawableID, 'visibility', visiable ? 'visible' : 'none');
  }
}
