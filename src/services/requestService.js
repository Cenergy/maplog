import httpService from './httpService';
import eventsJson from '../asserts/events';
import layersJson from '../asserts/layers';
import facilitiesJson from '../asserts/facilities';

async function facilities() {
    try {
        // const { data = [] } = await httpService.get('/gmw/api/facility/all');
        return facilitiesJson;
    } catch (error) {
        return [];
    }
}
async function events() {
    try {
        // const { data = [] } = await httpService.get('/gmw/api/event/all');
        return eventsJson;
    } catch (error) {
        return [];
    }
}
async function layers() {
    try {
        // const { data = [] } = await httpService.get('/gmw/api/layer');
        return layersJson;
    } catch (error) {
        return [];
    }
}
async function cameras() {
    try {
        const { data = [] } = await httpService.get('/vfs/api/camera');
        return data;
    } catch (error) {
        return [];
    }
}

export { facilities, events, layers, cameras };
