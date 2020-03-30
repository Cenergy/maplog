export default class LayerHandlerBase {
  constructor({ mapSdk }) {
    this._mapSdk = mapSdk;
  }

  // eslint-disable-next-line class-methods-use-this
  handle() {
    throw new Error('Method not implement');
  }
}
