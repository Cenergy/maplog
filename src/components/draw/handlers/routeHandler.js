/* eslint-disable class-methods-use-this */
import HandlerBase from './handlerBase';

export default class RouteHandler extends HandlerBase {
  constructor(option) {
    super(option);
    const { navagationService } = option;
    this._navagationService = navagationService;
  }

  add(drawable) {
    console.log('rd: RouteHandler -> add -> drawable', drawable);
  }

  update(drawable) {
    console.log('rd: RouteHandler -> update -> drawable', drawable);
  }

  remove(drawable) {
    console.log('rd: RouteHandler -> remove -> drawable', drawable);
  }
}
