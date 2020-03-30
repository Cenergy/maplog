import axios from 'axios';

const _accessToken = 'pk.eyJ1IjoibGl0dGxlZGVuZyIsImEiOiJjanN2aXgwNmswNHdhNDRtcWIyZnAydnhqIn0.MG_E-xG8D4lAXnTj4kbKmg';

const _profile = 'driving';

/**
 * Transfer coordinates to string data.
 *
 * @name _coordinatesToString
 * @param {Array} [coordinates=[lng1, lat1],[lng2, lat2],[lng3, lat3]]
 * input point lng-lat
 * @returns {string} a string of coordinates
 */
function _coordinatesToString(coordinates) {
  if (typeof coordinates !== 'object' || coordinates.constructor !== Array) {
    throw new TypeError('出错了,变量非数组，无效！');
  }
  if (coordinates.length < 2) {
    throw new TypeError('出错了,坐标点数据错误！');
  }

  const pointString = coordinates
    .map((item) => {
      if (item.length !== 2) {
        throw new TypeError('出错了，坐标无效！');
      }
      return `${item[0]},${item[1]}`;
    })
    .join(';');

  return pointString.substring(0, pointString.length - 1);
}

/**
 * 请求路径导航数据
 * @name GetNavigationDatas
 * @param {object} coordinates 起止点与途径点
 * @returns {object} 返回对象
 * @example 返回对象示例：
 * const result = {distance: 11137.4,
 *  duration: 1096.8,
 *  geometry:
 *  coordinates: (5) [Array(2), Array(2), Array(2), Array(2), Array(2)]
 *  type: "LineString"
 *  __proto__: Object,
 *  legs: [{…}],
 *  weight: 1155.2,
 *  weight_name: "routability"}
 *
 * @example 接口调用示例
 * // execute
 * GetNavigationDatas([113.958263, 22.559213],[113.87572, 22.586208]);
 */
async function GetNavigationDatas(...coordinates) {
  const pointString = _coordinatesToString(coordinates);
  console.log('rd: GetNavigationDatas -> pointString', pointString);

  const url = `https://api.mapbox.com/directions/v5/mapbox/${_profile}/${pointString}.json?access_token=${_accessToken}&geometries=geojson&steps=true`;
  console.log('rd: GetNavigationDatas -> url', url);
  try {
    const responseData = await axios.get(url);
    if (typeof responseData.data === 'object') {
      const result = responseData.data.routes[0];
      console.log('rd: GetNavigationDatas -> response result:', result);
      return result;
    }
    return new Error('GetNavigationDatas failed!');
  } catch (error) {
    return new Error('GetNavigationDatas failed!');
  }
}

export default {
  GetNavigationDatas,
};
