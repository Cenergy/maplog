import Drawable from './drawable';
import { HasCoordinate } from '../../mixin';
/**
 * three线流动效果
 * @param {object} option 选项
 * @example
 * const option = {
 *   minZoom:10,
 *   maxZoom:19
 * };
 *
 * // execute
 * const spriteTextDrawable = new LineFlowDrawable(option)
 */
class LineFlowDrawable extends Drawable {
  constructor(option) {
    super(option);
    const { lineData = {}, lineColor = '#ff0000', flowLineColor = '#ff0000', flowLineWidth = 3, flowLineLength = 40, lineVisible = false } = option;
    this.lineData = lineData;
    this.lineColor = lineColor;
    this.flowLineColor = flowLineColor;
    this.flowLineWidth = flowLineWidth;
    this.flowLineLength = flowLineLength;
    this.lineVisible = lineVisible;

  }
}

export default LineFlowDrawable;
