import HandlerBase from './handlerBase';
import SpriteImage from '../../../utils/spriteImage';

export default class SpriteTextHandler extends HandlerBase {
    _addCore(drawable) {
        const map = this._map;
        const { img, id, row, col: column, size = 100, coordinate, data } = drawable;
        const spriteImageName = `${id}_sprite_image`;
        const spriteImageSource = `${id}_sprite_source`;
        const spriteImageLayer = `${id}_sprite_layer`;

        const pulsingDot = new SpriteImage({
            img,
            size,
            row,
            column,
            map,
        });
        map.addImage(spriteImageName, pulsingDot, { pixelRatio: 2 });

        if (coordinate) {
            map.addSource(spriteImageSource, {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: [
                        {
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: coordinate,
                            },
                        },
                    ],
                },
            });
        } else if (data) {
            map.addSource(spriteImageSource, {
                type: 'geojson',
                data,
            });
        }
        const sourceExist = map.getSource(spriteImageSource);
        if (!sourceExist) {
            console.error('coordinate或者data不存在!!');
            return null;
        }

        map.addLayer({
            id: spriteImageLayer,
            type: 'symbol',
            source: spriteImageSource,
            layout: {
                'icon-image': spriteImageName,
                'icon-rotation-alignment': 'map',
            },
        });
        return {
            spriteImageName,
            spriteImageSource,
            spriteImageLayer,
        };
    }

    async _updateCore(drawable) {
        const wrapper = this._drawableRelation.get(drawable._id);
        console.log(`Rd: SpriteTextHandler -> _updateCore -> wrapper`, wrapper);
    }

    _removeCore(drawableID) {
        const realDrawable = this._drawableRelation.get(drawableID);
        const map = this._map;
        const { spriteImageName, spriteImageSource, spriteImageLayer } = realDrawable;
        if (map.getLayer(spriteImageLayer)) map.removeLayer(spriteImageLayer);
        if (map.getSource(spriteImageSource)) map.removeSource(spriteImageSource);
        if (map.hasImage(spriteImageName)) map.removeImage(spriteImageName);
    }

    async _setVisibility(drawableID, visiable) {
        const wrapper = this._drawableRelation.get(drawableID);
        if (wrapper) {
            const { spriteImageLayer } = wrapper;
            this._map.setLayoutProperty(spriteImageLayer, 'visibility', visiable ? 'visible' : 'none');
        }
    }
}
