export default class LayerHandlerBase {
  constructor({ maplog }) {
    this._maplog = maplog;
  }

  // eslint-disable-next-line class-methods-use-this
  handle() {
    throw new Error('Method not implement');
  }
}
