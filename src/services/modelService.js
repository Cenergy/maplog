import { Threebox, THREE } from 'threebox';
// @ts-ignore
window.Threebox = Threebox;
// @ts-ignore
window.THREE = THREE;
const MODEL_LAYER_ID = 'MODEL_LAYER_ID';

class ModelService {
    async init(option) {
        console.log('go: ModelService -> init -> option', option);
        const { map } = option;
        this._map = map;

        let tb = null;
        await new Promise(res => {
            this._map.addLayer({
                id: MODEL_LAYER_ID,
                type: 'custom',
                renderingMode: '3d',
                onAdd(mapbox, mbxContext) {
                    tb = new Threebox(mapbox, mbxContext, {
                        defaultLights: true,
                    });
                    res();
                },
                render() {
                    if (tb) tb.update();
                },
            });
        });
        this.tb = tb;
    }
}
export default new ModelService();
