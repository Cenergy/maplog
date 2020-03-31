import axios from 'axios';
/**
 * 使用axios封装成异步的ajax
 * @param {string} url FileName
 * @returns {void}
 * @example
 * asyncGetJson('streetLine.json');
 */
export default async function asyncGetJson(url) {
  try {
    return await axios.get(url);
  } catch (e) {
    throw e;
  }
}
