import axios from 'axios';
import find from 'lodash/find';
import WebsocketHeartbeatJs from 'websocket-heartbeat-js';
import differenceBy from 'lodash/differenceBy';
import remove from 'lodash/remove';
import GpsDevice from '../components/layer/layerEntities/gpsDevices';

export const EVENT_GPSDEVICE_ADDED = 'gpsDeviceAdded';
export const EVENT_GPSDEVICE_REMOVED = 'gpsDeviceRemoved';
export const EVENT_GPSDEVICE_UNDATED = 'gpsDeviceUpdated';
export const EVENT_GPSDEVICE_FOLLOWED = 'gpsDeviceFollowed';

const devicesAdded = 'devicesAdded';
const devicesPositionChanged = 'devicesPositionChanged';
const devicesRemoved = 'devicesRemoved';

class GpsEvent extends Event {
    constructor(eventName, gpsDevice) {
        super(eventName);
        this.gpsDevice = gpsDevice;
    }
}

class GpsDataService extends EventTarget {
    constructor() {
        super();
        this._gpsDevices = [];
        this._isConnected = true;
    }

    async init() {
        this.queryDevices();
    }

    async queryDevices() {
        await this._getGpsDevices();
        // this._startIntervelQueryDevices();
        await this._subscriptGpsInfoReport();
    }

    getGpsDevices() {
        return this._gpsDevices;
    }

    setFollowDevice(gpsDevice) {
        this.dispatchEvent(new GpsEvent(EVENT_GPSDEVICE_FOLLOWED, gpsDevice));
    }

    _onGpsDeviceAdded(gpsDevice) {
        this.dispatchEvent(new GpsEvent(EVENT_GPSDEVICE_ADDED, gpsDevice));
    }

    _onGpsDeviceRemoved(gpsDevice) {
        this.dispatchEvent(new GpsEvent(EVENT_GPSDEVICE_REMOVED, gpsDevice));
    }

    _onGpsDeviceUpdated(gpsDevice) {
        this.dispatchEvent(new GpsEvent(EVENT_GPSDEVICE_UNDATED, gpsDevice));
    }

    _getbaseUrl() {
        return `/gmw/api/`;
    }

    _startIntervelQueryDevices() {
        // const ws = new WebSocket(`ws://10.8.9.33:8849/`);
        // ws.onopen = () => {
        //   // onopen 连接触发
        //   console.log('websocket open');
        //   ws.send('Ready');
        // };
        // ws.onmessage = e => {
        //   const { data: dataOrigin, type } = JSON.parse(e.data);
        //   console.log(
        //     'Rd: GpsDataService -> _startIntervelQueryDevices -> dataOrigin',
        //     dataOrigin
        //   );
        //   // const data = dataOrigin.map(item => {
        //   //   const dataCompose = item;
        //   //   dataCompose.coordinate = [item.Longitude, item.Latitude];
        //   //   console.log(
        //   //     'Rd: GpsDataService -> _startIntervelQueryDevices -> coordinate',
        //   //     dataCompose.coordinate
        //   //   );
        //   //   dataCompose.name = 'gps';
        //   //   dataCompose.id = item.DeviceID;
        //   //   dataCompose.typeId = '401000100000';
        //   //   dataCompose._id = uuidv4();
        //   //   dataCompose._route = [
        //   //     [item.Longitude, item.Latitude],
        //   //     [item.Longitude - 0.1, item.Latitude - 0.1],
        //   //   ];
        //   //   return dataCompose;
        //   // });
        //   // const removeDevices = differenceBy(this._gpsDevices, data, 'id');
        //   // const addDevices = differenceBy(data, this._gpsDevices, 'id');
        //   // removeDevices.forEach(gpsDevice => {
        //   //   remove(this._gpsDevices, gpsDevice);
        //   //   this._onGpsDeviceRemoved(gpsDevice);
        //   // });
        //   // addDevices.forEach(device => {
        //   //   const gpsDevice = new GpsDevice(device);
        //   //   this._gpsDevices.push(gpsDevice);
        //   //   this._onGpsDeviceAdded(gpsDevice);
        //   // });
        // };
        // ws.onerror = () => {
        //   console.log(`RD: showPeopleLayers -> data`, 'error');
        // };
        setInterval(async () => {
            try {
                const { data } = await axios.get(`${this._getbaseUrl()}gpsdevices`);
                const removeDevices = differenceBy(this._gpsDevices, data, 'id');
                const addDevices = differenceBy(data, this._gpsDevices, 'id');
                removeDevices.forEach(gpsDevice => {
                    remove(this._gpsDevices, gpsDevice);
                    this._onGpsDeviceRemoved(gpsDevice);
                });
                addDevices.forEach(device => {
                    const gpsDevice = new GpsDevice(device);
                    this._gpsDevices.push(gpsDevice);
                    this._onGpsDeviceAdded(gpsDevice);
                });
            } catch (error) {
                console.log('rd: IntervelQueryDevies -> _getGpsDevices -> error', error);
            }
        }, 25000);
    }

    _addDeviceCore(devices) {
        devices.forEach(device => {
            try {
                const { DeviceID, TypeID, Longitude, Latitude, name } = device;
                this._gpsDevices.push(
                    // eslint-disable-next-line max-len
                    new GpsDevice({ id: DeviceID, name, coordinate: [Number(Longitude), Number(Latitude)], typeId: TypeID })
                );
            } catch (error) {
                console.error(`RD: GpsDataService -> _getGpsDevices -> error`, error);
            }
        });
    }

    async _getGpsDevices() {
        try {
            const { data } = await axios.get(`${this._getbaseUrl()}gpsdevices`);
            console.log('rd: GpsDataService -> _getGpsDevices -> data====', data);
            this._addDeviceCore(data);
        } catch (error) {
            console.log('rd: GpsDataService -> _getGpsDevices -> error', error);
        }
    }

    // eslint-disable-next-line class-methods-use-this
    async _subscriptGpsInfoReport() {
        this.connect();
        await Promise.resolve(true);
    }

    connect() {
        const gpsDataService = this;
        const server = `ws://${window.location.host}/gmw/ws/gpsReporter`;
        const ws = new WebsocketHeartbeatJs({ url: server });
        ws.onopen = () => {
            console.log('rd: gpsDataService connection open ... ');
            ws.send('my name gis mapbox gps data service.');
        };
        ws.onmessage = evt => {
            try {
                if (evt.data === 'heartbeat') {
                    return;
                }
                const data = JSON.parse(evt.data);
                console.log('rd: gpsDataService received message', data);
                if (data) gpsDataService.onMessageBack(data);
            } catch (error) {
                console.error(error);
            }
        };
        ws.onclose = () => {
            console.log('rd: ResourceEvaluater connection closed.');
        };
    }

    _onDevicesAdded(devices) {
        this._addDeviceCore(devices);
    }

    _onDevicesRemoved(devices) {
        devices.forEach(device => {
            const { DeviceID } = device;
            const gpsDevice = find(this._gpsDevices, d => d._id === DeviceID);
            if (gpsDevice) {
                this._onGpsDeviceRemoved(gpsDevice);
            }
        });
    }

    _onDevicesPositionChanged(devices) {
        devices.forEach(device => {
            const { DeviceID, Longitude, Latitude } = device;
            const gpsDevice = find(this._gpsDevices, d => d._id === DeviceID);
            if (gpsDevice) {
                gpsDevice.coordinate = [Number(Longitude), Number(Latitude)];
                this._onGpsDeviceUpdated(gpsDevice);
            }
        });
    }

    onMessageBack(message) {
        console.log('rd: GpsDataService -> onMessageBack -> message', message);
        console.log('rd: GpsDataService -> onMessageBack -> _gpsDevices', this._gpsDevices);
        try {
            const { type, devices } = message;
            switch (type) {
                case devicesPositionChanged:
                    this._onDevicesPositionChanged(devices);
                    break;
                case devicesAdded:
                    this._onDevicesAdded(devices);
                    break;
                case devicesRemoved:
                    this._onDevicesRemoved(devices);
                    break;
                default:
                    console.warn('unkonw type to operate.');
                    break;
            }
        } catch (error) {
            console.error(`RD: GpsDataService -> onMessageBack -> error`, error);
        }
    }
}

export default new GpsDataService();
