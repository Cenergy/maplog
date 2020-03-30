import { Threebox, THREE } from '@rdapp/threebox';
import layerZIndexHelper, {
	HIGHEST_FLOOR,
} from '../components/layerZIndexHelper';
import CONSTANTS from '../utils/constants';
import eventTopics from '../components/pubsubRelated/eventTopic';

// @ts-ignore
window.Threebox = Threebox;
// @ts-ignore
window.THREE = THREE;

class TbService extends EventTarget {
	async init(option) {
		const { map } = option;
		this._map = map;

		let tb = null;
		const self = this;
		await new Promise(res => {
			const zIndexLayerID = layerZIndexHelper.getLayerZIndex(HIGHEST_FLOOR);
			this._map.addLayer(
				{
					id: CONSTANTS.LAYER_ID.THREE_BOX_LAYER_ID,
					type: 'custom',
					renderingMode: '3d',
					onAdd(mapbox, mbxContext) {
						tb = new Threebox(mapbox, mbxContext, {
							defaultLights: true,
							passiveRendering: false
						});
						res();
					},
					render() {
						if (tb) tb.update();
						self.dispatchEvent(new Event('TbLayerRender'));
					},
				},
				zIndexLayerID
			);
		});
		this.tb = tb;

		this._map.on('click', CONSTANTS.LAYER_ID.THREE_BOX_LAYER_ID,
			this.dispatchEvent(new Event(eventTopics.TbServiceLayerClicked))
		);
	}
}
export default new TbService();
