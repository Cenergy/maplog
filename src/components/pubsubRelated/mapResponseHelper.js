class MapResponseHelper {
    async init(option) {
        console.log('rd: MapResponseHelper -> init -> option', option)
        const { mapSdk } = option;
        this.mapSdk = mapSdk;
    }

    showFeatureDetail(msg, data) {
        console.log('rd: MapResponseHelper -> showFeatureDetail -> msg, data', msg, data)
        const { dataSource, type } = data;
        dataSource.addTo(this.mapSdk.map);
    }
}

export default new MapResponseHelper();