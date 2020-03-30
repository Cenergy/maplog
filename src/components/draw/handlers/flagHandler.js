import mapboxgl from 'mapbox-gl';
import HandlerBase from './handlerBase';
import eventAggregator from '../../pubsubRelated/mapEventAggregator';
import { FLAG_DRAWABLE_TYPE } from '../../drawableTypeKey';

export default class FlagHandler extends HandlerBase {
  constructor(option) {
    super(option);
    this.currentIndex = 0;
  }

  async _addCore(drawable) {
    console.log('go: FlagHandler -> _addCore -> drawable', drawable);
    return this._addFlagLayer(drawable);
  }

  async _updateCore(drawable) {
    const realDrawable = await this._drawableRelation.get(drawable._id);
    const {
      marker, flagDrawable, circle, ring,
    } = realDrawable;
    marker.setLngLat(flagDrawable.coordinate);
    realDrawable.marker = marker;
    this._map
      .getSource(circle)
      .setData(this._createGeoJSONCircle(flagDrawable.coordinate, 0.03).data);
    this._map.getSource(ring).setData(this._createGeoJSONRing(flagDrawable.coordinate, 0.0005));
  }

  async _setVisibility(drawableID, visiable) {
    const realDrawable = await this._drawableRelation.get(drawableID);
    const { marker } = realDrawable;

    const el = marker.getElement();
    if (visiable) {
      el.style.display = 'flex';
    } else {
      el.style.display = 'none';
    }
  }

  async _removeCore(drawableID) {
    const realDrawable = await this._drawableRelation.get(drawableID);
    console.log('go: FlagHandler -> _removeCore -> realDrawable', realDrawable);
    if (!realDrawable) {
      return;
    }
    realDrawable.marker.remove();
    this._map.removeLayer(realDrawable.ring);
    this._map.removeLayer(realDrawable.circle);
    console.log('go: FlagHandler -> _removeCore -> realDrawable', realDrawable);
  }

  _addFlagLayer(drawable) {
    console.log('rd: FlagHandler -> _addFlagMarker -> drawable', drawable);
    const {
      _id, _width, _height, coordinate, title = '火灾预警',
    } = drawable;

    const endName = _id;

    const el = document.createElement('div');

    el.className = endName;
    el.style.display = 'flex';
    el.style.justifyContent = 'center';
    el.style.minWidth = `${_width}px`;
    el.style.height = `${_height}px`;
    el.style.backgroundSize = 'cover';

    const flagStaff = document.createElement('div');
    // 旗杆的样式
    flagStaff.className = 'flagStaff';
    flagStaff.style.position = 'relative';
    flagStaff.style.width = '3px';
    flagStaff.style.height = '120px';
    flagStaff.style.backgroundColor = 'white';

    // 添加旗杆上面那个实心圆
    const flagCircle = document.createElement('div');
    flagCircle.className = 'flagCircle';
    flagCircle.style.position = 'absolute';
    flagCircle.style.width = '8px';
    flagCircle.style.height = '8px';
    flagCircle.style.backgroundColor = 'white';
    flagCircle.style.borderRadius = '10px';
    flagCircle.style.left = '-2px';
    flagCircle.style.top = '-4px';
    flagStaff.appendChild(flagCircle);

    // 添加旗杆下面那个实心圆
    const flagGround = document.createElement('div');
    flagGround.style.position = 'absolute';
    flagGround.className = 'flagGround';
    flagGround.style.width = '12px';
    flagGround.style.height = '12px';
    flagGround.style.backgroundColor = 'white';
    flagGround.style.left = '-6px';
    flagGround.style.top = '144px';
    flagGround.style.borderRadius = '50%';
    flagGround.style.border = '1px solid white';
    el.appendChild(flagStaff);

    // 旗帜的内容的样式
    const flagContent = document.createElement('div');
    flagContent.className = 'flagContent';
    el.title = `${title}`;
    if (title.length > 6) {
      const str = `${title.substring(0, 6)}...`;
      flagContent.innerText = `${str}`;
    } else {
      flagContent.innerText = `${title}`;
    }

    flagContent.style.color = 'white';
    flagContent.style.width = '100px';
    flagContent.style.height = '30px';
    flagContent.style.backgroundColor = drawable._color;
    flagContent.style.textAlign = 'center';
    flagContent.style.lineHeight = '30px';
    flagContent.style.border = '1px solid white';
    flagContent.style.borderLeft = 'none';
    el.appendChild(flagContent);

    const marker = new mapboxgl.Marker(el)
      .setLngLat(coordinate)
      .addTo(this._map)
      .setOffset([_width / 2, -_height / 4 - 2]);

    const res = {};
    res.marker = marker;
    res.flagDrawable = drawable;

    const option = { dataSource: res, type: FLAG_DRAWABLE_TYPE };
    el.addEventListener('click', function publishClickEvent() {
      console.log('rd: FlagHandler -> _addFlagLayer -> type', option.type)
      const topic = eventAggregator.getAllEventTopics().MapClicked;
      eventAggregator.publish(topic, option);
    });

    return res;
  }
}
