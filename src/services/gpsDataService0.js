import axios from 'axios';
import find from 'lodash/find';
import differenceBy from 'lodash/differenceBy';
import remove from 'lodash/remove';
import GpsDevice from '../components/layer/layerEntities/gpsDevices';

export const EVENT_GPSDEVICE_ADDED = 'gpsDeviceAdded';
export const EVENT_GPSDEVICE_REMOVED = 'gpsDeviceRemoved';
export const EVENT_GPSDEVICE_UNDATED = 'gpsDeviceUpdated';

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

  async init(option) {
    const { gpsServer } = option;
    this._gpsServer = gpsServer;
    await this._getGpsDevices();
    this._startIntervelQueryDevices();
    await this._subscriptGpsInfoReport();
  }

  getGpsDevices() {
    return this._gpsDevices;
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
    return `http://${this._gpsServer.ip}:${this._gpsServer.port}/`;
  }

  _startIntervelQueryDevices() {
    setInterval(async () => {
      try {
        const { data } = await axios.get(`${this._getbaseUrl()}gpsdevices`);
        const removeDevices = differenceBy(this._gpsDevices, data, 'id');
        console.log(
          'rd: GpsDataService -> _startIntervelQueryDevies -> removeDevices',
          removeDevices,
        );
        const addDevices = differenceBy(data, this._gpsDevices, 'id');
        console.log('rd: GpsDataService -> _startIntervelQueryDevies -> addDevices', addDevices);
        removeDevices.forEach((gpsDevice) => {
          remove(this._gpsDevices, gpsDevice);
          this._onGpsDeviceRemoved(gpsDevice);
        });
        addDevices.forEach((device) => {
          const gpsDevice = new GpsDevice(device);
          this._gpsDevices.push(gpsDevice);
          this._onGpsDeviceAdded(gpsDevice);
        });
      } catch (error) {
        console.log('rd: IntervelQueryDevies -> _getGpsDevices -> error', error);
      }
    }, 25000);
  }

  async _getGpsDevices() {
    try {
      const { data } = await axios.get(`${this._getbaseUrl()}gpsdevices`);
      console.log('rd: GpsDataService -> _getGpsDevices -> data', data);
      data.forEach((device) => {
        this._gpsDevices.push(new GpsDevice(device));
      });
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
    const server = `ws://${this._gpsServer.ip}:${this._gpsServer.port}/gpsReporter`;
    const ws = new WebSocket(server);
    ws.onopen = () => {
      console.log('rd: gpsDataService connection open ... ');
      ws.send('my name gis mapbox gps data service.');
    };
    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        console.log('rd: gpsDataService received message', data);
        console.log(this);
        if (data) gpsDataService.onMessageBack(data);
      } catch (error) {
        console.error(error);
      }
    };
    ws.onclose = () => {
      console.log('rd: ResourceEvaluater connection closed.');
    };
  }

  onMessageBack(message) {
    console.log('rd: GpsDataService -> onMessageBack -> message', message);
    console.log('rd: GpsDataService -> onMessageBack -> _gpsDevices', this._gpsDevices);
    if (message && Array.isArray(message)) {
      message.forEach((device) => {
        const gpsDevice = find(this._gpsDevices, d => d._id === device.id);
        if (gpsDevice) {
          gpsDevice.coordinate = device.coordinate;
          this._onGpsDeviceUpdated(gpsDevice);
        }
      });
    }
  }
}

export default new GpsDataService();
