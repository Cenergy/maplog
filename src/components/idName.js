import uuidv4 from 'uuid/v4';

export default class IdName {
  constructor({ id, name }) {
    this._id = id || uuidv4();
    this.name = name;
  }

  get id() {
    return this._id;
  }
}
