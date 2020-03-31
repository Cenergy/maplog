import drawable from './drawable';
import { HasCoordinate, HasCoordinates } from '../../mixin';

export class ThreeJsModelDrawable extends drawable {
  /**
	 * 构造模型
	 * @param {object} option 选项
	 * @example
	 * const option = {
	 *   modelType: 'protectTarget|pollutionSource|..',
	 *   coordinate: [113, 26],
	 *   parameters: {
	 *     modelScale: 2,
	 *   },
	 * };
	 *
	 * // execute
	 * const tjmd = new ThreeJsModelDrawable(option)
	 */
  constructor(option) {
    super(option);
    Object.assign(this, new HasCoordinate(option));
  }
}

export class ThreeJsMultiPointModelDrawable extends drawable {
  /**
	 * 构造模型
	 * @param {object} option 选项
	 * @example
	 * const option = {
	 *   modelType: 'protectTarget|pollutionSource',
	 *   coordinates: [[113, 26],[114,27]],
	 *   parameters: {
	 *     modelScale: 2,
	 *   },
	 * };
	 *
	 * // execute
	 * const tjmpmd = new ThreeJsMultiPointModelDrawable(option)
	 */
  constructor(option) {
    super(option);
    Object.assign(this, new HasCoordinates(option));
  }
}
