/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */

export default class HandlerBase {
  constructor({ map }) {
    this._map = map;
  }

  add(drawable) {
    throw new Error('method not implementation.');
  }

  update(drawable) {
    throw new Error('method not implementation.');
  }

  remove(drawable) {
    throw new Error('method not implementation.');
  }
}
