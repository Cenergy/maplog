import uuidv4 from 'uuid/v4';
const blankFeatureCollection = {
    type: 'FeatureCollection',
    features: [],
};

export const a = 1;

class DynamicCanvas {
    static create(option) {
        const { map, length = 50, rgb = '0, 254, 255' } = option;
        const size = length;

        return {
            width: length,
            height: length,
            data: new Uint8Array(size * size * 4),

            onAdd() {
                const canvas = document.createElement('canvas');
                canvas.width = this.width;
                canvas.height = this.height;
                this.context = canvas.getContext('2d');
            },

            render() {
                const duration = 1500;
                const t = (performance.now() % duration) / duration;

                const radius = (size / 2) * 0.3;
                const outerRadius = (size / 2) * 0.7 * t + radius;
                const { context } = this;

                context.clearRect(0, 0, this.width, this.height);
                context.beginPath();

                //  里面不动的圈的样式
                context.arc(this.width / 2, this.height / 2, radius * 0.9, 0, Math.PI * 2);
                context.fillStyle = `rgba(${rgb},0.6)`;
                context.fill();

                context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
                context.fillStyle = `rgba(${rgb},${1 - t})`;
                context.fill();

                // draw inner circle
                context.beginPath();
                context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
                context.fillStyle = `rgba(${rgb}, 1)`;
                context.strokeStyle = `rgba(${rgb}, 1)`;
                context.lineWidth = 2 + 4 * (1 - t);
                context.fill();
                context.stroke();

                this.data = context.getImageData(0, 0, this.width, this.height).data;
                map.triggerRepaint();
                return true;
            },
        };
    }
}

export function addDiffusion(options) {
    const { data, map, rgb = '0, 254, 255', length = 60 } = options;
    const layerId = uuidv4();
    const imageName = `${layerId}_diffusion_image`;
    const sourceName = `${layerId}_diffusion_source`;
    const layerName = `${layerId}_diffusion_layer`;
    if (!map.getSource(sourceName)) {
        map.addSource(sourceName, {
            type: 'geojson',
            data: blankFeatureCollection,
        });
    }
    if (!map.hasImage(imageName)) {
        const dynamicCanvas = DynamicCanvas.create({ map, rgb, length });
        map.addImage(imageName, dynamicCanvas, { pixelRatio: 1 });
    }
    if (!map.getLayer(layerName)) {
        map.addLayer({
            id: layerName,
            type: 'symbol',
            source: sourceName,
            layout: {
                'icon-image': imageName,
                'icon-rotation-alignment': 'map',
            },
        });
    }
    map.getSource(sourceName).setData(data);
    return map.getLayer(layerName);
}
