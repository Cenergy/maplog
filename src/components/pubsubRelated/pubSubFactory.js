import eventTopic from './eventTopic';
import { EventArgs, MapClickEventArgs, PointDetailShowEventArgs } from './pubSubData';

class PubSubFactory {
  constructor() {
    this._topicDataMap = new Map();
    this._initData();
  }

  createPubSubData(topic, option) {
    // 判断topic是否有效
    const DataType = this._topicDataMap.get(topic);
    return new DataType(option);
  }

  _initData() {
    this._topicDataMap.set(eventTopic.AreaEagleMap.Selected, EventArgs);
    this._topicDataMap.set(eventTopic.MapClicked, MapClickEventArgs);
    this._topicDataMap.set(eventTopic.PointDetailShow, PointDetailShowEventArgs);
  }
}
export default new PubSubFactory();
