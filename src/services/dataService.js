class DataService {
  async init(option) {
    const { dataServer } = option;
    this.dataServer = dataServer;
  }
}

export default new DataService();
