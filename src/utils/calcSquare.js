import * as turf from '@turf/turf';

const squareMultiple = Math.sqrt(2);

function calcDestination(center, realDis, bearing) {
  return turf.destination(center, realDis, bearing).geometry.coordinates;
}

function calc(distance, coordinate) {
  // console.log('rd: calcSquare -> distance', distance);
  // console.log('rd: calcSquare -> coordinate', coordinate);
  // console.log('rd: calcSquare -> turf', turf);
  const center = turf.point(coordinate);
  const realDis = distance * squareMultiple;

  const squarePoints = [
    calcDestination(center, realDis, -45),
    calcDestination(center, realDis, 45),
    calcDestination(center, realDis, 135),
    calcDestination(center, realDis, -135),
  ];
  return squarePoints;
}

export default { calc };
