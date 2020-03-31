import * as turf from '@turf/turf';

const squareMultiple = Math.sqrt(2);

function _calcDestination(center, realDis, bearing) {
  return turf.destination(center, realDis, bearing).geometry.coordinates;
}

/**
 * 根据中心点和半径计算封闭矩形，并返回矩形四个角的坐标
 * @param {Number} distance 半径范围
 * @param {Array} coordinate 中心点坐标
 * @example
 * const distance = 500;
 * const coordinate = [113.2,22.9];
 * @returns {Array} The points position(latlng array).
 *
 * // execute
 * const points = calcSquarePoints(distance,coordinate);
 */
function calcSquarePoints(distance, coordinate) {
  // console.log('rd: calcSquare -> distance', distance);
  // console.log('rd: calcSquare -> coordinate', coordinate);
  // console.log('rd: calcSquare -> turf', turf);
  const center = turf.point(coordinate);
  const realDis = distance * squareMultiple;

  const squarePoints = [
    _calcDestination(center, realDis, -45),
    _calcDestination(center, realDis, 45),
    _calcDestination(center, realDis, 135),
    _calcDestination(center, realDis, -135),
  ];
  return squarePoints;
}

/**
 * 线段切割成多个点，返回点集和角度
 * @param {Array} startPoint 起点
 * @param {Array} endPoint 终点
 * @example
 * const startPoint = [114.2,22.54];
 * const endPoint = [113.2,22.9];
 * @returns {object} The object: {points:array,bearing:45.5}
 *
 * // execute
 * const result = cutLineToPoints(startPoint,endPoint);
 */
function cutLineToPoints(startPoint, endPoint) {
  // console.log('rd: cutLineToPoints -> startPoint, endPoint', startPoint, endPoint);
  const start = turf.point(startPoint);
  const end = turf.point(endPoint);
  if (turf.booleanEqual(start, end)) {
    console.warn('rd: cutLineToPoints -> startPoint is equal to endPoint, invalid!', start, end);
    return {};
  }

  // 用来缓存切割的点
  const points = [];
  const line = turf.lineString([startPoint, endPoint]);

  // 先计算当前点与目标点距离
  const lineDistance = turf.length(line);

  // 值越大则动画越平滑 暂定为1KM20个点
  const steps = lineDistance * 500;
  // console.log('rd: cutLineToPoints -> steps,lineDistance', steps, lineDistance);

  if (steps < 1) {
    console.warn('rd: cutLineToPoints ->  step is less than 1, invalid!');
    return {};
  }

  const offset = lineDistance / steps;
  for (let i = 0; i < lineDistance; i += offset) {
    const segment = turf.along(line, i);
    points.push(segment.geometry.coordinates);
  }

  // 计算角度
  const bearing = turf.bearing(turf.point(startPoint), turf.point(endPoint));

  return { points, steps, bearing };
}

function calcTwoPointsBearing(start, end) {
  const startPoint = turf.point(start);
  const endPoint = turf.point(end);
  return turf.bearing(startPoint, endPoint);
}

export default {
  calcSquarePoints,
  cutLineToPoints,
  calcTwoPointsBearing,
};
