import pubSub from 'pubsub-js';
import pubSubFactory from './pubSubFactory';
import eventTopic from './eventTopic';

class MapEventAggregator {
    publish(topic, option) {
        const eventArgs = pubSubFactory.createPubSubData(topic, option);
        pubSub.publish(topic, eventArgs);
    }

    subscribe(topic, func) {
        const token = pubSub.subscribe(topic, func);
        console.log('rd: MapEventAggregator -> subscribe -> token', token)
        return token;
    }

    unsubscribe(token) {
        pubSub.unsubscribe(token);
    }

    getAllEventTopics() {
        return eventTopic;
    }
}

export default new MapEventAggregator();