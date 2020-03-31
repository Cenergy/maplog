class LayerService {
  async init(dataService) {
    const { dataServer } = dataService;
    this.dataServer = dataServer;
    this.layers = await this.requsetLayers();
  }

  async requsetLayers() {
    try {
      console.log(this.dataServer);
      return await [
        {
          name: 'phone',
          typeId: '4004',
        },
        { name: 'camera', typeId: '4004' },
      ];
    } catch (error) {
      console.log('rd: DataService -> requsetLayers -> error', error);
      return [];
    }
  }
}

export default new LayerService();
