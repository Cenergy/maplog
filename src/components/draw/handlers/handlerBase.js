import zoomShowController from '../../zoomShowController';

/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */

export default class HandlerBase {
  constructor({ map }) {
    this._map = map;
    this._drawableRelation = new Map();
  }

  add(drawable) {
    if (!drawable) {
      throw new Error('drawable is null');
    }

    console.log('rd: HandlerBase -> add start...', drawable);
    const realDrawable = this._addCore(drawable);
    console.log('go: add -> realDrawable', realDrawable);
    this._drawableRelation.set(drawable._id, realDrawable);
    zoomShowController.register(drawable, this._setVisibility.bind(this));
    zoomShowController.refreshVisibility(drawable);
    console.log('rd: HandlerBase -> add end...', drawable._id);
  }

  _addCore(drawable) {
    throw new Error('method not implementation.');
  }

  update(drawable) {
    // console.log('rd: HandlerBase -> update start...', drawable);
    this._updateCore(drawable);
    // console.log('rd: HandlerBase -> update end...', drawable._id);
  }

  _updateCore(drawable) {
    throw new Error('method not implementation.');
  }

  remove(drawableID) {
    console.log('rd: HandlerBase -> remove start...', drawableID);
    zoomShowController.unRegister(drawableID);
    this._removeCore(drawableID);
    this._drawableRelation.delete(drawableID);
    console.log('rd: HandlerBase -> remove end...', drawableID);
  }

  _removeCore(drawableID) {
    throw new Error('method not implementation.');
  }

  _setVisibility(drawableID, visiable) {
    throw new Error('method not implementation.');
  }
}
