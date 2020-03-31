import mapboxgl from 'mapbox-gl';
import HandlerBase from './handlerBase';
import json2html from '../../../utils/jsonToHtml';

export default class ImageHandler extends HandlerBase {
  _addCore(drawable) {
    const {
      _id, _imagePath, _width, _height, coordinate,
    } = drawable;
    const showInfo = {
      _imagePath,
      _width,
      _height,
      coordinate,
    };
    console.log('go: ImageHandler -> _addCore -> showInfo', showInfo);
    const el = document.createElement('div');
    el.id = _id;
    if (drawable.title !== '') {
      const textDiv = document.createElement('div');
      textDiv.style.position = 'relative';
      textDiv.style.width = '100px';
      textDiv.style.height = '30px';
      textDiv.style.lineHeight = '30px';
      textDiv.style.bottom = `${_height / 10}px`;
      textDiv.style.left = `${_width * 0.56 - 42}px`;
      textDiv.innerText = drawable.title;
      textDiv.style.color = 'white';
      textDiv.style.textAlign = 'center';
      el.appendChild(textDiv);
    }

    el.style.backgroundImage = `url(${_imagePath})`;
    el.style.width = `${_width}px`;
    el.style.height = `${_height}px`;
    el.style.backgroundSize = 'cover';
    el.style.display = 'block';

    const popup = new mapboxgl.Popup({ offset: _height, anchor: 'bottom' }).setHTML(
      json2html(showInfo),
    );
    const marker = new mapboxgl.Marker(el)
      .setLngLat(coordinate)
      .setOffset([0, -_height / 2 + _height / 8])
      .setPopup(popup)
      .addTo(this._map);
    return marker;
  }

  _updateCore(drawable) {
    const realDrawable = this._drawableRelation.get(drawable._id);
    if (!realDrawable) {
      return;
    }
    const {
      _id, _imagePath, _width, _height, coordinate,
    } = drawable;
    const el = realDrawable.getElement();
    el.id = _id;
    if (drawable.title !== '') {
      const textDiv = document.createElement('div');
      textDiv.style.position = 'relative';
      textDiv.style.width = '100px';
      textDiv.style.height = '30px';
      textDiv.style.lineHeight = '30px';
      textDiv.style.bottom = `${_height / 10}px`;
      textDiv.style.left = `${_width * 0.56 - 42}px`;
      textDiv.innerText = drawable.title;
      textDiv.style.color = 'white';
      textDiv.style.textAlign = 'center';
      el.appendChild(textDiv);
    }
    el.style.backgroundImage = `url(${_imagePath})`;
    el.style.width = `${_width}px`;
    el.style.height = `${_height}px`;
    el.style.backgroundSize = 'cover';
    realDrawable.setLngLat(coordinate);
    realDrawable.setOffset([0, -_height / 2 + _height / 8]);
  }

  _removeCore(drawableID) {
    const realDrawable = this._drawableRelation.get(drawableID);
    if (!realDrawable) {
      return;
    }
    realDrawable.remove();
  }

  _setVisibility(drawableID, visiable) {
    const realDrawable = this._drawableRelation.get(drawableID);
    if (!realDrawable) {
      return;
    }
    const el = realDrawable.getElement();
    el.style.display = visiable ? 'block' : 'none';
  }
}
