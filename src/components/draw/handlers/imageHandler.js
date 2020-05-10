// import Pubsub from 'pubsub-js';
import mapboxgl from 'mapbox-gl';
import HandlerBase from './handlerBase';


export default class ImageHandler extends HandlerBase {
    _addCore(drawable) {
        const {
            _height,
            coordinate,
            popupInfo,
            popupClassName,
            // userData,
            offset,
            element = null 
        } = drawable;

        const el=element||this._constructorMarkerElement(drawable)
        const marker = new mapboxgl.Marker({
            element: el,
            anchor: 'bottom',
        });
        // this._publishEvent({el,drawable,marker,userData})
        marker.setLngLat(coordinate).setOffset(offset).addTo(this._map);

        if (popupInfo) {
            const popup = new mapboxgl.Popup({
                offset: _height,
                closeButton: false,
                anchor: 'bottom',
                className: popupClassName,
            }).setHTML(popupInfo);
            marker.popup = popup;
            marker.setPopup(popup);
        }
        return marker;
    }

    _updateCore(drawable) {
        const realDrawable = this._drawableRelation.get(drawable._id);
        if (!realDrawable) {
            return;
        }
        const { _id, _imagePath, _width, _height, coordinate } = drawable;
        const el = document.createElement('div');
        el.id = _id;
        el.style.width = `${_width}px`;
        el.style.height = `${_height}px`;
        if (drawable.title.length > 0) {
            const divLength = (drawable.title.length / 4) * 80;
            const marginLeftLength = (_width - divLength) / 2;
            const textDiv = document.createElement('div');
            textDiv.style.position = 'relative';
            textDiv.style.width = `${divLength}px`;
            textDiv.style.marginLeft = `${marginLeftLength}px`;
            textDiv.style.height = '20px';
            textDiv.style.lineHeight = '20px';
            textDiv.innerText = drawable.title;
            textDiv.style.color = 'white';
            textDiv.style.textAlign = 'center';
            el.appendChild(textDiv);
        }
        const imgDocker = document.createElement('img');
        imgDocker.style.width = `${_width}px`;
        imgDocker.style.height = `${_height}px`;
        imgDocker.src = `${_imagePath}`;
        imgDocker.style.backgroundSize = 'cover';
        el.appendChild(imgDocker);
        realDrawable.setLngLat(coordinate);
        realDrawable.setOffset([0, -_height / 2]);
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
        if (!visiable && realDrawable.popup) {
            realDrawable.popup.remove();
        }
    }

    _constructorMarkerElement(drawable) {
        const { _id, _imagePath, _width, _height, } = drawable;

        let { length } = drawable;
        const el = document.createElement('div');
        el.id = _id;
        el.style.width = `${_width}px`;
        el.style.height = `${_height}px`;
        if (drawable.title && drawable.title.length) {
            if (!length) {
                length = _width;
            }
            const marginLeftLength = (_width - length) / 2;
            const textDiv = document.createElement('div');
            textDiv.style.bottom = `${_height}px`;
            textDiv.style.position = 'absolute';
            textDiv.style.width = `${length}px`;
            textDiv.style.marginLeft = `${marginLeftLength}px`;
            textDiv.style.minHeight = '20px';
            textDiv.innerHTML = drawable.title;
            textDiv.style.color = 'white';
            textDiv.style.textAlign = 'center';
            el.appendChild(textDiv);
        }
        const imgDocker = document.createElement('img');
        imgDocker.style.width = `${_width}px`;
        imgDocker.style.height = `${_height}px`;
        imgDocker.src = `${_imagePath}`;
        imgDocker.style.backgroundSize = 'cover';
        el.appendChild(imgDocker);
        el.style.display = 'block';
        return el;
    }

    // _publishEvent(options){
    //     const {el,drawable,marker,userData}=options
    //     const option = { dataSource: { drawable, marker }, type: IMAGE_DRAWABLE_TYPE };
    //     el.addEventListener('click', function publishClickEvent() {
    //         Pubsub.publish('获取Mapbox图标点位数据', userData);
    //         const topic = eventAggregator.getAllEventTopics().MapClicked;
    //         eventAggregator.publish(topic, option);
    //     });
    // }
}
