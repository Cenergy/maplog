import axios from 'axios';

const _accessToken = 'pk.eyJ1IjoibGl0dGxlZGVuZyIsImEiOiJjanN2aXgwNmswNHdhNDRtcWIyZnAydnhqIn0.MG_E-xG8D4lAXnTj4kbKmg';

const _profile = 'driving';

class NavigationService {
  init(option) {
    console.log('rd: NavigationService -> init -> option', option);
  }

  /**
 * 请求路径导航数据
 * @name GetNavigationDatas
 * @param {object} option 入参，必须包含coordinates属性
 * @example 入参示例：
 * const option = {
  *   coordinates: [[113.2,22.6],[113.41,22.15],[113.46,22.85]]
  * }
  * @returns {Promise} 返回对象
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
   * await getNavigationData(option);
   */
  async getNavigationData(option) {
    console.log('rd: NavigationService -> getNavigationData -> option', option);
    const { coordinates } = option;
    if (coordinates.length < 2) {
      return new Error('paramter is invalid!');
    }

    const navitgationData = await this._getNavigationDatas(...coordinates);
    return navitgationData;
  }

  /**
   * Transfer coordinates to string data.
   *
   * @name _coordinatesToString
   * @param {Array} [coordinates=[lng1, lat1],[lng2, lat2],[lng3, lat3]]
   * input point lng-lat
   * @returns {string} a string of coordinates
   */
  _coordinatesToString(coordinates) {
    if (typeof coordinates !== 'object' || coordinates.constructor !== Array) {
      throw new TypeError('出错了,变量非数组，无效！');
    }
    if (coordinates.length < 2) {
      throw new TypeError('出错了,坐标点数据错误！');
    }

    const latLngStrings = coordinates
      .map((item) => {
        if (item.length !== 2) {
          throw new TypeError('出错了，坐标无效！');
        }
        return `${item[0]},${item[1]}`;
      })
      .join(';');

    return latLngStrings.substring(0, latLngStrings.length - 1);
  }

  async _getNavigationDatas(...coordinates) {
    const pointString = this._coordinatesToString(coordinates);
    console.log('rd: _getNavigationDatas -> pointString', pointString);

    const url = `https://api.mapbox.com/directions/v5/mapbox/${_profile}/${pointString}.json?access_token=${_accessToken}&geometries=geojson&steps=true`;
    console.log('rd: _getNavigationDatas -> url', url);
    try {
      const responseData = await axios.get(url);
      if (typeof responseData.data === 'object') {
        const result = responseData.data.routes[0];
        console.log('rd: _getNavigationDatas -> response result:', result);
        return result;
      }
      return new Error('_getNavigationDatas failed!');
    } catch (error) {
      return new Error('_getNavigationDatas failed!');
    }
  }
}

export default new NavigationService();
