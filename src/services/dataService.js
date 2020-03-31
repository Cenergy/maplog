class DataService {
  async init(option) {
    const { dataServer } = option;
    this.dataServer = dataServer;
    this.baseUrl = `http://${dataServer.ip}:${dataServer.port}/`;
  }
}

export default new DataService();
