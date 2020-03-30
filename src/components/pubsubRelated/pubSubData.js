import uuidv4 from 'uuid/v4';

export class EventArgs {
  constructor(option) {
    const { id, dataSource, type } = option;
    this.id = id || uuidv4();
    this.dataSource = dataSource;
    this.type = type;
  }
}

export class MapClickEventArgs extends EventArgs { }

export class PointDetailShowEventArgs extends EventArgs { }

export class BuildingData extends EventArgs {
  constructor(params) {
    super(params);
    const { name, floor } = params;
    this.name = name;
    this.floor = floor;
  }
}
