import { Threebox, THREE } from '@rdapp/threebox';
import layerZIndexHelper from '../components/layerZIndexHelper';
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
    await new Promise((res) => {
      const zIndexLayerID = layerZIndexHelper.getLayerZIndex('symbol');
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
      }, zIndexLayerID);
    });
    this.tb = tb;
  }
}
export default new ModelService();
