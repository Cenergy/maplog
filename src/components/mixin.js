export class HasCoordinate {
    constructor({ coordinate }) {
        this.coordinate = coordinate;
    }
}

export class HasCoordinates {
    constructor({ coordinates }) {
        this.coordinates = coordinates;
    }
}

export class HasTwoCoordinates {
    constructor({ startPoint, endPoint }) {
        this.startPoint = startPoint;
        this.endPoint = endPoint;
    }
}
