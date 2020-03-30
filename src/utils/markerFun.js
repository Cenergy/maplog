import mapboxgl from 'mapbox-gl';

export function addMarker(options) {
    const {
        map,
        _id,
        _imagePath,
        _width,
        _height,
        coordinate,
        popupInfo = null,
        popupClassName = 'popupClassName',
        offset = [0, 0],
        title = null,
    } = options;
    let { length } = options;
    const el = document.createElement('div');
    el.id = _id;
    el.style.width = `${_width}px`;
    el.style.height = `${_height}px`;
    if (title) {
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
        textDiv.innerHTML = title;
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

    const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'bottom',
    })
        .setLngLat(coordinate)
        .setOffset(offset)
        .addTo(map);

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
export function removeMarker(marker) {
    marker.remove();
}

export function setVisibility(marker, visiable) {
    const el = marker.getElement();
    el.style.display = visiable ? 'block' : 'none';
    if (!visiable && marker.popup) {
        marker.popup.remove();
    }
}

const imgCss = `
width:46px;
height:46px;
border-radius: 50%;
position: absolute;
top: 38px;
left:18px;
text-align: left;`;

export function contextHTML(options) {
    const { avatar, name, job, phone } = options;
    return `
    <img src="${avatar}" alt="" style="${imgCss}">
    <div style="position: absolute;top: 20px;left: 92px;text-align:left">
    <span style="display: block;margin-top: 10px;">${name}</span>
    <span style="display: block;margin-top: 2px;">${job}</span>
    <span style="display: block;margin-top: 2px;">${phone}</span>
    </div>
            `;
}
