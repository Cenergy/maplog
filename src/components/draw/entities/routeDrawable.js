import drawable from './drawable';
import { HasCoordinates } from '../../mixin';

class RouteDrawable extends drawable {
  constructor(option) {
    super(option);
    Object.assign(this, new HasCoordinates(option));
  }
}

export default RouteDrawable;
