import { Threebox, THREE } from '@rdapp/threebox';
// @ts-ignore
window.Threebox = Threebox;
// @ts-ignore
window.THREE = THREE;
const SHADE_LAYER_ID = 'SHADE_LAYER_ID';

class ShadeService {
  async init(option) {
    console.log('go: ModelService -> init -> option', option);
    const { map } = option;
    this._map = map;
    let tb = null;
    await new Promise((res) => {
      this._map.addLayer({
        id: SHADE_LAYER_ID,
        type: 'custom',
        renderingMode: '3d',
        onAdd(mapbox, mbxContext) {
          tb = new Threebox(mapbox, mbxContext, { defaultLights: true });
          res();
        },
        render() {},
      });
    });
    this.tb = tb;
  }
}
export default new ShadeService();
