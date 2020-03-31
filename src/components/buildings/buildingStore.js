import axios from 'axios';

// axios.defaults.baseURL = process.env.BASE_URL;

const BUILDING_DB = 'building_db';
const DB_NAME = 'WEB_INDEX_DB';
// const BUILDING_VERSION = 1;
// const STORE_NAME = 'buildings6666';
const KEY_PATH = 'dataID';
export default class BuildingStore {
  constructor(reqUrl) {
    this.reqUrl = reqUrl;
    const req = indexedDB.open(DB_NAME);
    req.onupgradeneeded = () => {
      const db = req.result; /*
      createObjectStore 相当于创建一个表
      "geo" 相当于表名
      keyPath 索引 primary key
      */
      const obStore = db.createObjectStore(BUILDING_DB, { keyPath: KEY_PATH });

      // 下面这一段相当于创建表的一些数据结构
      obStore.createIndex('description', 'description', { unique: false });
      req.result.close();
    };
  }

  async get() {
    let url;
    try {
      url = await this._getCore();
    } catch (e) {
      console.log('go: get -> error url', e);
    }
    return url;
  }

  async _add(options = {}) {
    const { dataID, dataUrl } = options;
    try {
      const data = await this._addCore(dataID, dataUrl, options);
      return data;
    } catch (e) {
      return dataUrl;
    }
  }

  async _addCore(dataID, dataUrl, options) {
    const res = await axios(dataUrl);
    const { data } = res;
    const resObj = options;
    resObj.data = data;
    if (!dataID) {
      console.log('it does not contains dataID');
      return false;
    }
    return new Promise((resolve, reject) => {
      const db = indexedDB.open(DB_NAME);
      db.onsuccess = () => {
        db.result
          .transaction(BUILDING_DB, 'readwrite')
          .objectStore(BUILDING_DB)
          .add(resObj);
        db.result.close();
        resolve(resObj);
      };
      db.onerror = (e) => {
        reject(e);
      };
    });
  }

  async _getCore() {
    console.log('go: _getCore -> this', this);
    return new Promise((resolve, reject) => {
      const db = indexedDB.open(DB_NAME);
      db.onsuccess = () => {
        const req = db.result
          .transaction(BUILDING_DB, 'readonly')
          .objectStore(BUILDING_DB)
          .get(1);
        db.result.close();

        req.onsuccess = async (e) => {
          if (e.target.result) {
            await resolve(e.target.result);
          } else {
            const res = await this._add({
              dataID: 1,
              description: '建筑数据',
              dataUrl: this.reqUrl,
            });
            await resolve(res);
          }
        };
        req.onerror = (err) => {
          console.log('go: req.onerror -> err', err);
          reject(err);
        };
      };
      db.onerror = (e) => {
        console.log('go: db.onerror -> e', e);
        reject(e);
      };
    });
  }
}
