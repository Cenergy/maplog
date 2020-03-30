import drawable from './drawable';
import { HasCoordinate } from '../../mixin';

export default class ThreeJsModelDrawable extends drawable {
  /**
   * 构造模型
   * @param {object} option 选项
   * @example
   * const option = {
   *   modelUrl: 'http://xxxx/models/file/file.gltf',
   *   coordinate:[113.958263, 22.559213],
   * };
   *
   * // execute
   * const tjmpmd = new ThreeJsModelDrawable(option)
   */
  constructor(option) {
    super(option);
    Object.assign(this, new HasCoordinate(option));
    const { modelUrl, modelAltitude, scale } = option;
    this.modelUrl = modelUrl || 'http://10.8.9.64:3038/models/file/file/';
    this.modelAltitude = modelAltitude || 0;
    this.scale = scale || 100;
    this._modelTemplate = null;
  }
}
