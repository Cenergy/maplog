/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */
import HandlerBase from './handlerBase';

export class ThreeJsModelHandler extends HandlerBase {
  add(drawable) {
    console.log('rd: ThreeJsModelHandler -> add -> drawable', drawable);
  }

  update(drawable) {
    console.log('rd: ThreeJsModelHandler -> update -> drawable', drawable);
  }

  remove(drawable) {
    console.log('rd: ThreeJsModelHandler -> remove -> drawable', drawable);
  }
}

export class ThreeJsMultiPointModelHandler extends HandlerBase {
  add(drawable) {
    console.log('rd: ThreeJsMultiPointModelHandler -> add -> drawable', drawable);
  }

  update(drawable) {
    console.log('rd: ThreeJsMultiPointModelHandler -> update -> drawable', drawable);
  }

  remove(drawable) {
    console.log('rd: ThreeJsMultiPointModelHandler -> remove -> drawable', drawable);
  }
}
