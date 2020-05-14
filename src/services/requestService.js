import httpService from './httpService';

async function facilities() {
    try {
        const { data = [] } = await httpService.get('/gmw/api/facility/all');
        return data;
    } catch (error) {
        return [];
    }
}
async function events() {
    try {
        const { data = [] } = await httpService.get('/gmw/api/event/all');
        return data;
    } catch (error) {
        return [];
    }
}
async function layers() {
    try {
        const { data = [] } = await httpService.get('/gmw/api/layer');
        return data;
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
